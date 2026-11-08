import { test as base } from '@playwright/test';
import { AuthApi } from '../api/AuthApi';
import { ProductsApi } from '../api/ProductsApi';
import { BrandsApi } from '../api/BrandsApi';
import { CategoriesApi } from '../api/CategoriesApi';
import { CartsApi } from '../api/CartsApi';
import { InvoicesApi } from '../api/InvoicesApi';
import loginData from '../../test-data/login.json';

type ApiFixtures = {
  authApi: AuthApi;
  productsApi: ProductsApi;
  brandsApi: BrandsApi;
  categoriesApi: CategoriesApi;
  cartsApi: CartsApi;
  /** The customer's invoices, read with the customer's token. */
  invoicesApi: InvoicesApi;
};

type WorkerFixtures = {
  /** Admin token, fetched once per worker through POST /users/login. */
  adminToken: string;
  /** Customer token, for tests that check a non-admin is refused (403). */
  customerToken: string;
};

/**
 * API clients for tests. Clients that write data (brands, categories,
 * products) are created with the admin token. For an anonymous call,
 * for example a 401 test, create the client directly without a token:
 * `new BrandsApi(request)`.
 */
export const test = base.extend<ApiFixtures, WorkerFixtures>({
  adminToken: [
    async ({ playwright }, use) => {
      const context = await playwright.request.newContext();
      const email = process.env.ADMIN_EMAIL || loginData.validAdmin.email;
      const password = process.env.ADMIN_PASSWORD || loginData.validAdmin.password;
      const token = await new AuthApi(context).getToken(email, password);
      await context.dispose();
      await use(token);
    },
    { scope: 'worker' },
  ],

  customerToken: [
    async ({ playwright }, use) => {
      const context = await playwright.request.newContext();
      const email = process.env.CUSTOMER_EMAIL || loginData.validCustomer.email;
      const password = process.env.CUSTOMER_PASSWORD || loginData.validCustomer.password;
      const token = await new AuthApi(context).getToken(email, password);
      await context.dispose();
      await use(token);
    },
    { scope: 'worker' },
  ],

  authApi: async ({ request }, use) => use(new AuthApi(request)),
  productsApi: async ({ request, adminToken }, use) => use(new ProductsApi(request, adminToken)),
  brandsApi: async ({ request, adminToken }, use) => use(new BrandsApi(request, adminToken)),
  categoriesApi: async ({ request, adminToken }, use) =>
    use(new CategoriesApi(request, adminToken)),
  cartsApi: async ({ request }, use) => use(new CartsApi(request)),
  invoicesApi: async ({ request, customerToken }, use) =>
    use(new InvoicesApi(request, customerToken)),
});

export { expect } from '@playwright/test';
