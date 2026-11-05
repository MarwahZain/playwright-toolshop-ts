# Roadmap

Eight milestones from first commit to a CI-green portfolio repo. Each milestone ends with a concrete outcome.

Progress: M0 to M2 complete, M3 in progress.

## M0: Bootstrap

- [x] Initialize Playwright with TypeScript and a GitHub Actions workflow
- [x] Enable TypeScript strict mode, add ESLint and Prettier
- [x] Add dotenv, create `.env.example`, gitignore `.env`
- [x] Set `testIdAttribute: 'data-test'` in the config
- [x] Make `BASE_URL` switchable between local Docker and the public site
- [x] Write one smoke test
- [x] Create the public repo and push the first commit

**Outcome:** one smoke test green locally, repo public on GitHub.

## M1: Core UI tests

- [x] Login: valid customer login
- [x] Login: invalid password and empty fields
- [x] Product search by name
- [x] Category filter
- [x] Sort by price and by name
- [x] Pagination
- [x] Review: no hard waits, no CSS-chain locators, enforced by lint rules

**Outcome:** stable tests with no `waitForTimeout` and only web-first assertions.

## M2: Page Object Model and fixtures

- [x] Page classes in `src/pages` (Login, Home, Product, Cart, Checkout, Account)
- [x] Shared components (header, cart badge, product card)
- [x] Custom fixtures with `test.extend`
- [x] Test data in `test-data/*.json`
- [x] Data-driven test over a product set
- [x] Refactor M1 tests onto the page objects

**Outcome:** specs read like business steps, with no locators inside test files.

## M3: Authentication and state

- [x] Global setup logs in through `POST /users/login`
- [x] Save storageState for admin and customer
- [x] Separate Playwright projects per role
- [ ] Measure suite runtime before and after, note it in the README
- [ ] Tag release v0.1

**Outcome:** role-based UI tests skip the login screen and the suite runs faster.

## M4: API layer

- [ ] API clients in `src/api` using the request fixture
- [ ] CRUD tests on products, brands and categories
- [ ] Negative cases: 401, 404, 422 validation
- [ ] Response schema validation with zod
- [ ] Hybrid: create a product through the API as admin, verify it in the UI
- [ ] Hybrid: fill the cart through the API, finish checkout in the UI

**Outcome:** a clear explanation of why hybrid tests are faster and less flaky than pure UI tests.

## M5: Advanced scenarios

- [ ] Mock an empty product list with `page.route`
- [ ] Mock a 500 error and a slow response
- [ ] Full checkout across payment methods
- [ ] Contact form with file upload
- [ ] Forgot password: read the email through the MailCatcher API and assert its content
- [ ] Tags `@smoke` and `@regression` on every test
- [ ] Visual snapshot for one or two stable pages
- [ ] Give tests that change account data their own user, registered through the API

**Outcome:** the MailCatcher test and isolated test users set the repo apart from most Toolshop projects.

## M6: Reporting and CI

- [ ] HTML and Allure reporters
- [x] Smoke tests on every push against the public site
- [ ] Full regression on a manual trigger
- [x] Upload the report as a workflow artifact
- [ ] Publish the Allure report to GitHub Pages
- [ ] Parallel workers and sharding, retries only in CI
- [ ] CI badge in the README, tag release v1.0

**Outcome:** a green CI badge and a published report.

## M7: Showcase

- [ ] Run the suite against `sprint5-with-bugs` and log each real bug as a GitHub issue
- [ ] Optional: one Gherkin feature with `playwright-bdd`
- [ ] README: architecture diagram and folder map
- [ ] README: local setup with Docker, report screenshots, coverage map
- [ ] Stretch: a CI job that starts Toolshop with Docker Compose

**Outcome:** a repo that shows real testing work, not only automation.

## Git workflow

- One branch per feature or milestone, with a prefix: `feat/`, `test/`, `refactor/`, `docs/`, `ci/`
- Pull request to `main`, CI must pass before merging
- Conventional commit messages
- Release tags at the end of M3 (v0.1) and M6 (v1.0)
