import { z } from 'zod';

/** Received: one line of an invoice. */
export const InvoiceLineResponseSchema = z.object({
  product_id: z.string().min(1),
  quantity: z.number().int().positive(),
  unit_price: z.number().positive(),
});

/** Received: an invoice from GET /invoices, as seen by the customer it belongs to. */
export const InvoiceResponseSchema = z.object({
  id: z.string().min(1),
  invoice_number: z.string().regex(/^INV-\d+$/),
  total: z.number().positive(),
  status: z.string(),
  payment: z.object({ payment_method: z.string() }),
  invoicelines: z.array(InvoiceLineResponseSchema).min(1),
});
export type InvoiceResponse = z.infer<typeof InvoiceResponseSchema>;
