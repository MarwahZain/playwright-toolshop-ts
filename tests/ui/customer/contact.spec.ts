import { test, expect } from '../../../src/fixtures/hybrid';
import { MessageResponseSchema } from '../../../src/api/schemas';
import { expectSchema } from '../../../src/utils/schema';
import { ContactCase, toFile, uniqueMessage } from '../../../src/utils/contact-data';
import loginData from '../../../test-data/login.json';
import dataset from '../../../test-data/contact.json';

/**
 * Contact form as a signed-in customer (customer project, saved session).
 * The form greets the customer by name and does not ask for name or email:
 * the message is stored under the customer's account.
 */
const rows = (dataset as ContactCase[]).filter((row) => row.who === 'customer');

for (const row of rows) {
  test(
    `${row.id} ${row.description}`,
    { tag: '@regression' },
    async ({ contactPage, messagesApi }) => {
      const { marker, text } = uniqueMessage();
      await contactPage.open();

      // The form knows who is signed in
      await expect(contactPage.greeting).toContainText(loginData.customerName);
      await expect(contactPage.firstName).toBeHidden();
      await expect(contactPage.email).toBeHidden();

      const upload = await contactPage.send(
        { ...row.contact, message: text },
        toFile(row.attachment),
      );

      expect(upload?.status()).toBe((row.expected as { uploadStatus?: number }).uploadStatus);
      await expect(contactPage.confirmation).toBeVisible();

      // Stored under the customer's account and name
      const found = await messagesApi.findByText(marker);
      expect(found, `a message containing "${marker}" should be stored`).toBeDefined();
      const message = expectSchema(MessageResponseSchema, found);
      expect(message.name).toBe(loginData.customerName);
      expect(message.user_id, 'the message should belong to the customer').toBeTruthy();
      expect(message.subject).toBe(row.contact.subject);
    },
  );
}
