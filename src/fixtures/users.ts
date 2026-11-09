import { test as hybridTest } from './hybrid';
import { AuthApi } from '../api/AuthApi';
import { AddressesApi } from '../api/AddressesApi';
import { MailCatcherApi } from '../api/MailCatcherApi';
import { PostcodeLookupResponseSchema, RegisterRequest, UserResponseSchema } from '../api/schemas';
import { uniqueSuffix } from '../utils/unique';

export type FreshCustomer = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  password: string;
};

/**
 * Registers a brand-new customer through the API: unique email, strong password,
 * and an address the backend accepts (taken from its own postcode lookup).
 * Nobody else uses this account, so a test may change it freely (orders, password resets).
 *
 * Not deleted afterwards: there is no endpoint to delete a customer. Reseeding the
 * local database removes them.
 */
export async function registerCustomer(
  authApi: AuthApi,
  addressesApi: AddressesApi,
): Promise<FreshCustomer> {
  const id = uniqueSuffix();
  const lookupResponse = await addressesApi.postcodeLookup('AT', '1010', '42');
  const address = PostcodeLookupResponseSchema.parse(await lookupResponse.json());

  const user: RegisterRequest = {
    first_name: 'Qa',
    last_name: 'Fresh',
    dob: '1990-01-15',
    phone: '0123456789',
    email: `qa.user.${id}@example.com`,
    password: `Qa!Fresh-${id}`,
    address: {
      street: address.street,
      city: address.city,
      state: address.state,
      country: address.country,
      postal_code: address.postcode,
    },
  };

  const response = await authApi.register(user);
  if (response.status() !== 201) {
    throw new Error(
      `Registering ${user.email} failed: ${response.status()} ${await response.text()}`,
    );
  }
  const created = UserResponseSchema.parse(await response.json());

  return {
    id: created.id,
    firstName: user.first_name,
    lastName: user.last_name,
    email: user.email,
    password: user.password,
  };
}

export const test = hybridTest.extend<{
  addressesApi: AddressesApi;
  /** A customer registered just for this test. */
  freshCustomer: FreshCustomer;
  /** The emails Toolshop sent, read from MailCatcher. */
  mailCatcher: MailCatcherApi;
}>({
  addressesApi: async ({ request }, use) => use(new AddressesApi(request)),
  freshCustomer: async ({ authApi, addressesApi }, use) =>
    use(await registerCustomer(authApi, addressesApi)),
  mailCatcher: async ({ request }, use) => use(new MailCatcherApi(request)),
});

export { expect } from '@playwright/test';
