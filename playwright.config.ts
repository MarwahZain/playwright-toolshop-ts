import { defineConfig, devices } from '@playwright/test';
import 'dotenv/config';

const baseURL = process.env.BASE_URL;
if (!baseURL) {
  throw new Error('BASE_URL is missing. Copy .env.example to .env and fill it in.');
}

export default defineConfig({
  use: {
    baseURL,
    testIdAttribute: 'data-test',
    // ...
  },
  // ...
});