import { APIRequestContext, APIResponse } from '@playwright/test';
import { test, expect } from '../../src/fixtures/api';
import { BrandsApi } from '../../src/api/BrandsApi';
import { CategoriesApi } from '../../src/api/CategoriesApi';
import { ProductsApi } from '../../src/api/ProductsApi';
import {
  UNKNOWN_ID,
  existingReferences,
  newBrand,
  newCategory,
  newProduct,
} from '../../src/api/builders';
import dataset from '../../test-data/api-negative.json';

/**
 * One row of test-data/api-negative.json = one test case.
 *
 * Columns:
 *   id              test case ID, shown in the test title
 *   resource        brands | categories | products
 *   action          get | create | update | delete (get, update and delete target an unknown id)
 *   auth            none | customer | admin: whose token is sent
 *   description     what the case is about, shown in the test title
 *   remove          optional: fields to delete from a valid request body
 *   override        optional: fields to replace in a valid request body
 *   expectedStatus  the status code the API must return
 *   expectedField   optional: the field the 422 error must name
 *   knownIssue      optional: a known bug. The test still expects the correct behavior,
 *                   but is reported as an expected failure until the bug is fixed.
 *                   When it starts passing, the run fails: remove this column then.
 */
type NegativeCase = {
  id: string;
  resource: 'brands' | 'categories' | 'products';
  action: 'get' | 'create' | 'update' | 'delete';
  auth: 'none' | 'customer' | 'admin';
  description: string;
  remove?: string[];
  override?: Record<string, unknown>;
  expectedStatus: number;
  expectedField?: string;
  knownIssue?: string;
};

/** The operations every resource client has, so one test can drive all three. */
interface CrudClient {
  get(id: string): Promise<APIResponse>;
  create(body: Record<string, unknown>): Promise<APIResponse>;
  update(id: string, body: Record<string, unknown>): Promise<APIResponse>;
  delete(id: string): Promise<APIResponse>;
}

function clientFor(
  resource: NegativeCase['resource'],
  request: APIRequestContext,
  token?: string,
): CrudClient {
  switch (resource) {
    case 'brands':
      return new BrandsApi(request, token);
    case 'categories':
      return new CategoriesApi(request, token);
    case 'products':
      return new ProductsApi(request, token);
  }
}

/** A body the API would accept, so a refusal can only come from the column under test. */
async function validBody(resource: NegativeCase['resource'], productsApi: ProductsApi) {
  switch (resource) {
    case 'brands':
      return newBrand();
    case 'categories':
      return newCategory();
    case 'products':
      return newProduct(await existingReferences(productsApi));
  }
}

async function send(
  client: CrudClient,
  action: NegativeCase['action'],
  body: Record<string, unknown>,
) {
  switch (action) {
    case 'get':
      return client.get(UNKNOWN_ID);
    case 'create':
      return client.create(body);
    case 'update':
      return client.update(UNKNOWN_ID, body);
    case 'delete':
      return client.delete(UNKNOWN_ID);
  }
}

/** Safety net: if the API wrongly created a record, delete it again so no test data is left behind. */
async function removeIfCreated(response: APIResponse, adminClient: CrudClient): Promise<void> {
  if (response.status() !== 201) return;
  const created = (await response.json()) as { id?: string };
  if (created.id) await adminClient.delete(created.id);
}

/** When the row has an expectedField, the error body must name it. Laravel puts field errors at the top level or under "errors". */
async function expectFieldError(response: APIResponse, field?: string): Promise<void> {
  if (!field) return;
  const body = (await response.json()) as Record<string, unknown>;
  const errors = (body.errors as Record<string, unknown>) ?? body;
  expect(Object.keys(errors), `error should name "${field}"`).toContain(field);
}

test.describe('API negative cases', () => {
  for (const row of dataset as NegativeCase[]) {
    test(
      `${row.id} ${row.resource} ${row.action} ${row.description} returns ${row.expectedStatus}`,
      {
        tag: ['@api', '@regression'],
        annotation: row.knownIssue ? [{ type: 'known issue', description: row.knownIssue }] : [],
      },
      async ({ request, productsApi, adminToken, customerToken }) => {
        // 0. Rows with a known bug are expected to fail until it is fixed
        test.fail(row.knownIssue !== undefined, row.knownIssue);

        // 1. Pick the token from the auth column
        const token = { none: undefined, customer: customerToken, admin: adminToken }[row.auth];
        const client = clientFor(row.resource, request, token);

        // 2. Start from a valid body, then apply the remove and override columns
        // Negative cases deliberately break the request contract, so the body is a loose record here.
        const body: Record<string, unknown> = {
          ...(await validBody(row.resource, productsApi)),
          ...row.override,
        };
        for (const field of row.remove ?? []) delete body[field];

        // 3. Send the action
        const response = await send(client, row.action, body);

        await removeIfCreated(response, clientFor(row.resource, request, adminToken));

        // 4. Check the expectedStatus column
        expect(response.status()).toBe(row.expectedStatus);

        // 5. Check the expectedField column
        await expectFieldError(response, row.expectedField);
      },
    );
  }
});
