import { z } from 'zod';

/** The envelope every paginated list response has, wrapped around any item schema. */
export function paginated<T extends z.ZodType>(item: T) {
  return z.object({
    current_page: z.number().int().positive(),
    per_page: z.number().int().positive(),
    last_page: z.number().int().positive(),
    total: z.number().int().nonnegative(),
    data: z.array(item),
  });
}
