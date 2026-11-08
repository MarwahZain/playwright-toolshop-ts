import { test, expect } from '../../../src/fixtures/hybrid';
import { MessageResponseSchema } from '../../../src/api/schemas';
import { expectSchema } from '../../../src/utils/schema';
import { ContactCase, toFile, uniqueMessage } from '../../../src/utils/contact-data';
import dataset from '../../../test-data/contact.json';

/**
 * Contact form as a guest. A message is stored through POST /messages; an attached
 * file is uploaded in a second request. The app only accepts empty .txt files.
 * No email is sent, so the checks are the screen and the stored message.
 */
const rows = (dataset as ContactCase[]).filter((row) => row.who === 'guest');
const sentRows = rows.filter((row) => row.expected.sent);
const rejectedRows = rows.filter((row) => !row.expected.sent);

test.describe('Contact form as a guest', () => {
  test.beforeEach(async ({ contactPage }) => {
    await contactPage.open();
  });

  for (const row of sentRows) {
    test(
      `${row.id} ${row.description}`,
      { tag: '@regression' },
      async ({ contactPage, messagesApi }) => {
        const { marker, text } = uniqueMessage();

        const upload = await contactPage.send(
          { ...row.contact, message: text },
          toFile(row.attachment),
        );

        // The upload request (only for rows with a file) was accepted
        expect(upload?.status()).toBe((row.expected as { uploadStatus?: number }).uploadStatus);
        await expect(contactPage.confirmation).toBeVisible();

        // The message is stored as sent
        const found = await messagesApi.findByText(marker);
        expect(found, `a message containing "${marker}" should be stored`).toBeDefined();
        const message = expectSchema(MessageResponseSchema, found);
        expect(message.name).toBe(`${row.contact.firstName} ${row.contact.lastName}`);
        expect(message.email).toBe(row.contact.email);
        expect(message.subject).toBe(row.contact.subject);
        expect(message.message).toBe(text);
      },
    );
  }

  for (const row of rejectedRows) {
    test(
      `${row.id} ${row.description}`,
      { tag: '@regression' },
      async ({ contactPage, messagesApi }) => {
        const expected = row.expected as {
          field: 'subject' | 'message' | 'attachment';
          error: string;
        };
        const { marker, text } = uniqueMessage();

        await contactPage.fillForm(
          { ...row.contact, message: row.message ?? text },
          toFile(row.attachment),
        );
        await contactPage.submit();

        await expect(contactPage.fieldError(expected.field)).toHaveText(expected.error);
        await expect(contactPage.confirmation).toBeHidden();
        // Nothing was stored for this attempt
        expect(await messagesApi.findByText(marker), 'no message should be stored').toBeUndefined();
      },
    );
  }
});
