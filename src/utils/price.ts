/** Parses a displayed price such as "$14.15" into a number. */
export function parsePrice(text: string): number {
  return Number(text.replace(/[^0-9.]/g, ''));
}
