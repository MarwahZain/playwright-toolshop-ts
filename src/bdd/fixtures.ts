import { mergeTests } from '@playwright/test';
import { test as bddTest, createBdd } from 'playwright-bdd';
import { test as appTest } from '../fixtures/hybrid';

/**
 * The test object every step definition uses.
 *
 * - bddTest (playwright-bdd): the machinery that matches a Gherkin sentence to its step
 *   definition, runs Given/When/Then in order and records each step in the report.
 *   createBdd() refuses a test without it.
 * - appTest (src/fixtures/hybrid.ts): our page objects and API clients.
 *
 * A scenario runs with exactly one test object, so mergeTests combines both into one.
 * Step files import Given/When/Then from here and receive fixtures by name.
 */
export const test = mergeTests(bddTest, appTest);

export const { Given, When, Then } = createBdd(test);
