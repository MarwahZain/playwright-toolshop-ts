import { z } from 'zod';

/** Sent: the body of POST /users/register. The address must match the postcode lookup. */
export const RegisterRequestSchema = z.object({
  first_name: z.string().min(1),
  last_name: z.string().min(1),
  dob: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  phone: z.string().min(1),
  email: z.email(),
  password: z.string().min(8),
  address: z.object({
    street: z.string().min(1),
    city: z.string().min(1),
    state: z.string().min(1),
    country: z.string().length(2),
    postal_code: z.string().min(1),
  }),
});
export type RegisterRequest = z.infer<typeof RegisterRequestSchema>;

/** Received: the user created by POST /users/register. */
export const UserResponseSchema = z.object({
  id: z.string().min(1),
  first_name: z.string().min(1),
  last_name: z.string().min(1),
  email: z.email(),
});
export type UserResponse = z.infer<typeof UserResponseSchema>;

/** Received: GET /postcode-lookup, the address the shop fills in for a postal code and house number. */
export const PostcodeLookupResponseSchema = z.object({
  street: z.string().min(1),
  city: z.string().min(1),
  state: z.string().min(1),
  country: z.string().length(2),
  postcode: z.string().min(1),
});
export type PostcodeLookupResponse = z.infer<typeof PostcodeLookupResponseSchema>;
