import { APIResponse } from '@playwright/test';
import { z } from 'zod';
import { ApiClient } from './ApiClient';

/**
 * Only what the lookup needs from each page. Older invoices are not validated here:
 * the invoice that is found gets the full contract check in the test.
 */
const InvoicePageSchema = z.object({
  last_page: z.number().int().positive(),
  data: z.array(z.looseObject({ invoice_number: z.string() })),
});

/** Invoices of the user whose token the client was created with. */
export class InvoicesApi extends ApiClient {
  async list(page = 1): Promise<APIResponse> {
    return this.request.get(this.url('/invoices'), { params: { page }, headers: this.headers });
  }

  /**
   * Finds an invoice by its number. The list is not sorted by date, so the
   * pages are searched one by one. Returns undefined if no page has it.
   */
  async findByNumber(invoiceNumber: string): Promise<unknown> {
    for (let page = 1; ; page++) {
      const response = await this.list(page);
      if (!response.ok())
        throw new Error(`GET /invoices?page=${page} returned ${response.status()}`);
      const body = InvoicePageSchema.parse(await response.json());
      const match = body.data.find((invoice) => invoice.invoice_number === invoiceNumber);
      if (match) return match;
      if (page >= body.last_page) return undefined;
    }
  }
}
