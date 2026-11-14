import 'dotenv/config';
import loginData from '../../test-data/login.json';

/**
 * The accounts tests sign in with. Each value comes from an environment variable
 * first (in CI: the GitHub Environment's secrets and variables), then falls back to
 * Toolshop's seeded demo accounts in test-data/login.json.
 * Tests must read the customer's name from here, never from login.json, so a
 * different account per environment needs no code change.
 */
export interface Account {
  email: string;
  password: string;
}

export interface Customer extends Account {
  /** Full name as the shop shows it, e.g. in the header menu. */
  name: string;
}

export const customer: Customer = {
  email: process.env.CUSTOMER_EMAIL || loginData.validCustomer.email,
  password: process.env.CUSTOMER_PASSWORD || loginData.validCustomer.password,
  name: process.env.CUSTOMER_NAME || loginData.customerName,
};

export const admin: Account = {
  email: process.env.ADMIN_EMAIL || loginData.validAdmin.email,
  password: process.env.ADMIN_PASSWORD || loginData.validAdmin.password,
};
