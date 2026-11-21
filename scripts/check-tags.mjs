// Tag rules, checked on the full test list:
//  1. every test has @regression, so no test can silently drop out of the full run;
//  2. every @smoke test is also @readonly, because a --grep @smoke on the command line
//     replaces the config's @readonly filter on shared environments (sit, uat).
// Usage: npm run check:tags
import { execSync } from 'node:child_process';

// Generate the BDD tests first, so scenarios are checked too.
execSync('npx bddgen', { stdio: 'inherit', env: { ...process.env, TEST_ENV: 'local' } });

const report = JSON.parse(
  execSync('npx playwright test --list --reporter=json', {
    encoding: 'utf8',
    maxBuffer: 50 * 1024 * 1024,
    env: { ...process.env, TEST_ENV: 'local' }, // local lists every test
  }),
);

const noRegression = new Set();
const smokeNotReadonly = new Set();
const visit = (suite, path) => {
  for (const spec of suite.specs ?? []) {
    const tags = spec.tags ?? [];
    const where = `${spec.file}:${spec.line}  ${[...path, spec.title].join(' › ')}`;
    if (!tags.includes('regression')) noRegression.add(where);
    if (tags.includes('smoke') && !tags.includes('readonly')) smokeNotReadonly.add(where);
  }
  for (const child of suite.suites ?? []) visit(child, [...path, child.title]);
};
for (const suite of report.suites ?? []) visit(suite, []);

const report_ = (set, message) =>
  set.size > 0 && console.error(`${set.size} test(s) ${message}:\n  ${[...set].join('\n  ')}`);
report_(noRegression, 'without @regression');
report_(smokeNotReadonly, 'tagged @smoke but not @readonly');
if (noRegression.size > 0 || smokeNotReadonly.size > 0) process.exit(1);
console.log('Every test has @regression, and every @smoke test is @readonly.');
