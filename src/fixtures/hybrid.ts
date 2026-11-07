import { mergeTests } from '@playwright/test';
import { test as pagesTest } from './pages';
import { test as apiTest } from './api';

/** Page objects and API clients in one test, for tests that arrange through the API and assert in the UI. */
export const test = mergeTests(pagesTest, apiTest);

export { expect } from '@playwright/test';
