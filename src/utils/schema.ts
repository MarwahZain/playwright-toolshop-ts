import { expect } from '@playwright/test';
import { z } from 'zod';

/**
 * Validates a response body against a schema and returns it typed.
 * On failure, the test fails with every problem listed by field path.
 */
export function expectSchema<T extends z.ZodType>(schema: T, body: unknown): z.infer<T> {
  const result = schema.safeParse(body);
  expect(
    result.success,
    result.success
      ? undefined
      : `Response does not match the schema:\n${z.prettifyError(result.error)}`,
  ).toBe(true);
  return result.data as z.infer<T>;
}
