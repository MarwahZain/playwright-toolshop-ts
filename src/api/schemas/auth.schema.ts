import { z } from 'zod';

/** Sent: the body of POST /users/login. */
export const LoginRequestSchema = z.object({
  email: z.string().min(1),
  password: z.string().min(1),
});
export type LoginRequest = z.infer<typeof LoginRequestSchema>;

/** Received: POST /users/login on success. */
export const LoginResponseSchema = z.object({
  access_token: z.string().min(1),
  token_type: z.string(),
  expires_in: z.number().int().positive(),
});
export type LoginResponse = z.infer<typeof LoginResponseSchema>;
