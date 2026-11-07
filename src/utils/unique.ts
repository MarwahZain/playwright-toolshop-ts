/** A suffix that is unique per call, for names and slugs of test-created records. */
export function uniqueSuffix(): string {
  return `${Date.now()}-${Math.floor(Math.random() * 10000)}`;
}
