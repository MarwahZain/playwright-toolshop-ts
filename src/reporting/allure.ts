import os from 'node:os';
import { Status } from 'allure-js-commons';
import type { Category } from 'allure-js-commons/sdk';

/**
 * Failure categories for the Allure report. Allure checks them in order and
 * puts each failed test in the first category whose regex matches its error
 * message. The regexes run in Allure (Java), so (?s) lets ".*" span lines.
 */
export const allureCategories: Category[] = [
  {
    name: 'Visual differences',
    description:
      'The page no longer matches its baseline image. Check the diff, then fix or approve.',
    messageRegex: '(?s).*Screenshot comparison failed.*',
    matchedStatuses: [Status.FAILED],
  },
  {
    name: 'Contract mismatches',
    description:
      'An API response broke the zod schema: a backend bug or an unagreed contract change.',
    messageRegex: '(?s).*Response does not match the schema.*',
    matchedStatuses: [Status.FAILED],
  },
  {
    name: 'Element not found or ambiguous',
    description: 'A locator matched no element or several. Usually a UI change or a test defect.',
    messageRegex: '(?s).*(element\\(s\\) not found|strict mode violation).*',
    matchedStatuses: [Status.FAILED, Status.BROKEN],
  },
  {
    name: 'Timeouts',
    description:
      'A test or an action ran out of time: a slow environment, a hang or a missing wait.',
    messageRegex: '(?s).*(Test timeout of|Timeout \\d+ms exceeded).*',
    matchedStatuses: [Status.FAILED, Status.BROKEN],
  },
  {
    name: 'Other assertion failures',
    description: 'The app behaved differently from the expectation: a likely product defect.',
    messageRegex: '(?s).*',
    matchedStatuses: [Status.FAILED],
  },
  {
    name: 'Other errors',
    description: 'An exception outside an assertion: test code, data or environment.',
    messageRegex: '(?s).*',
    matchedStatuses: [Status.BROKEN],
  },
];

/** Shown in the Environment widget of the Allure report. */
export function allureEnvironment(baseURL: string): Record<string, string> {
  return {
    'Base URL': baseURL,
    'API URL': process.env.API_URL ?? 'not set',
    Node: process.version,
    OS: `${os.platform()} ${os.release()}`,
    CI: process.env.CI ? 'yes' : 'no',
  };
}
