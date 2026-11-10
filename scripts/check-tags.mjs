// Fails when a test has no @regression tag, so no test can silently drop out of the full run.
// Usage: npm run check:tags
import { execSync } from 'node:child_process';

const report = JSON.parse(
  execSync('npx playwright test --list --reporter=json', {
    encoding: 'utf8',
    maxBuffer: 50 * 1024 * 1024,
  }),
);

const missing = new Set();
const visit = (suite, path) => {
  for (const spec of suite.specs ?? []) {
    if (!(spec.tags ?? []).includes('regression'))
      missing.add(`${spec.file}:${spec.line}  ${[...path, spec.title].join(' › ')}`);
  }
  for (const child of suite.suites ?? []) visit(child, [...path, child.title]);
};
for (const suite of report.suites ?? []) visit(suite, []);

if (missing.size > 0) {
  console.error(`${missing.size} test(s) without @regression:\n  ${[...missing].join('\n  ')}`);
  process.exit(1);
}
console.log('Every test has @regression.');
