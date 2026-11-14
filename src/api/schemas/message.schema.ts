import { z } from 'zod';

/** Received: a contact message as an admin sees it (GET /messages, GET /messages/{id}). */
export const MessageResponseSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  email: z.string().nullable().optional(),
  subject: z.string().min(1),
  message: z.string().min(50),
  status: z.string(),
  user_id: z.string().nullable().optional(),
});
export type MessageResponse = z.infer<typeof MessageResponseSchema>;
