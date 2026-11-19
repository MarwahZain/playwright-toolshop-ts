# Roadmap

Twelve milestones from first commit to a CI-green portfolio repo. Each milestone ends with a concrete outcome.

Progress: M0 to M6 complete (open: M3 runtime measurement, M4 search for a new product). Next: M7.

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
- [x] Tag release v0.1

**Outcome:** role-based UI tests skip the login screen and the suite runs faster.

## M4: API layer

- [x] API clients in `src/api` using the request fixture
- [x] CRUD tests on products, brands and categories
- [x] Negative cases: 401, 404, 422 validation
- [x] Response schema validation with zod
- [ ] Hybrid: create a product through the API as admin, verify it in the UI (search tests open: the new product is not found by search)
- [x] Hybrid: fill the cart through the API, finish checkout in the UI

**Outcome:** a clear explanation of why hybrid tests are faster and less flaky than pure UI tests.

## M5: Advanced scenarios

- [x] Mock an empty product list with `page.route`
- [x] Mock a 500 error and a slow response
- [x] Full checkout across payment methods
- [x] Contact form with file upload
- [x] Forgot password: read the email through the MailCatcher API and assert its content
- [x] Tags `@smoke` and `@regression` on every test
- [x] Visual snapshot for one or two stable pages
- [x] Give tests that change account data their own user, registered through the API

**Outcome:** the MailCatcher test and isolated test users set the repo apart from most Toolshop projects.

## M6: Reporting, CI and environments

Goal: learn the GitHub Actions features worth knowing, and run the same suite against several environments (SIT, QA, UAT) the way everyday projects do.

| Environment | URL                                                       | Data          | Tests                        |
| ----------- | --------------------------------------------------------- | ------------- | ---------------------------- |
| `local`     | localhost:4200 / 8091 (Docker on the Mac)                 | own           | all                          |
| `qa`        | Toolshop in Docker on the runner, pinned commit           | fresh per run | all                          |
| `sit`       | with-bugs.practicesoftwaretesting.com (sprint5 with bugs) | shared        | `@readonly`                  |
| `uat`       | practicesoftwaretesting.com (sprint5, stable)             | shared        | `@readonly`, manual approval |

Part A: configuration

- [x] HTML and Allure reporters, Allure failure categories and environment info
- [x] Trace and video kept on every failure
- [x] Parallel workers and retries only in CI (2 workers, 1 retry)

Part B: GitHub Actions and environments

- [x] B1: CI gate on every push and PR: lint, format, type and tag checks, then smoke; reports as artifacts
- [x] B2: `TEST_ENV` switch in code (environment map, like Spring profiles), customer name from one place, `@readonly` tags
- [x] B3: GitHub Environments `sit` and `uat` with variables, secrets and UAT approval; reusable `run-tests.yml`; Test on environment workflow; smoke with its own account; account-settings diagnostic
- [x] Wrap-up: current action versions (v7), Dependabot, README badges, tag release v1.0

The `qa` environment in Docker, shards, published reports, the visual job in CI and Jenkins continue in M8.

**Outcome:** one suite that switches environments with one variable, green CI gates, and UAT runs behind an approval.

## M7: Lighthouse audits

- [ ] Choose the integration: `playwright-lighthouse` inside the suite (reuses fixtures and saved sessions) or Lighthouse CI (`@lhci/cli`) as a separate CI step
- [ ] A `lighthouse` project: Chromium only, 1 worker, tag `@lighthouse` (Lighthouse needs the remote debugging port and a quiet machine)
- [ ] Audit key pages: home, product details, login, contact; stretch: one page with a customer session
- [ ] Thresholds per category (performance, accessibility, best practices, SEO) in one config file; the test fails below them
- [ ] Performance scores from a dev server are low and noisy: set that threshold from a baseline of 3 runs, keep accessibility strict
- [ ] Save the HTML report per page and attach it to the Playwright report
- [ ] Run in the regression workflow against Toolshop in Docker, publish the reports next to Allure
- [ ] Log real accessibility findings as GitHub issues; LEARNINGS entry on reading and stabilising Lighthouse scores

**Outcome:** performance, accessibility, best practice and SEO scores for the key pages, checked against thresholds on every regression run.

## M8: Advanced CI/CD

Goal: the techniques expected of a technical lead, built on the M6 setup.

- [ ] `qa` environment: Toolshop in Docker on the runner as a composite action (`.github/actions/start-toolshop`), green full run (`regression.yml` is the starting point)
- [ ] 3 shards with one merged HTML report (blob reports, `merge-reports`)
- [ ] Allure with history per environment on GitHub Pages (`/qa`, `/sit`, `/uat`), job summaries
- [ ] Nightly schedule: a matrix over the environments, calling `run-tests.yml`
- [ ] Visual tests in CI (`qa` only), in the Playwright Docker image
- [ ] Self-healing shared accounts: unlock a locked customer through the admin API before login
- [ ] Jenkins: `Jenkinsfile` with an environment choice parameter feeding `TEST_ENV`, Jenkins in Docker on the Mac, `docs/JENKINS.md`

**Outcome:** reproducible full runs on a fresh environment, fast sharded feedback, published trends, and the same pipeline in GitHub Actions and Jenkins.

## M9: Showcase

- [ ] Run the suite against `sprint5-with-bugs` and log each real bug as a GitHub issue
- [ ] Optional: one Gherkin feature with `playwright-bdd`
- [ ] README: architecture diagram and folder map
- [ ] README: local setup with Docker, report screenshots, coverage map
- [ ] Stretch: a CI job that starts Toolshop with Docker Compose

**Outcome:** a repo that shows real testing work, not only automation.

## M10: API mocking

- [ ] Mock fixture in `src/fixtures` that wraps `page.route` for `/products`
- [ ] Return a fixed product list with `route.fulfill` and assert the grid renders it exactly
- [ ] Modify a real response: fetch it with `route.fetch()`, change one price, fulfill the edited body
- [ ] Error states: 500, 404 and an invalid JSON body, each showing a user-facing message
- [ ] Slow API: delay the response and assert the loading state
- [ ] Network failure: `route.abort()` and assert the app does not crash
- [ ] Record a HAR file and replay it with `routeFromHAR` for an offline test
- [ ] Tag mocked specs `@mocked` and keep them in `tests/mocked/`
- [ ] LEARNINGS entry: when to mock and when to hit the real API

**Outcome:** any UI state can be tested, including errors the real backend rarely produces, without touching real data.

## M11: BDD with Gherkin

- [ ] Install `playwright-bdd` and add a `bddgen` step before the test run
- [ ] Feature file for login written from a user story, in `features/`
- [ ] Step definitions that reuse the existing fixtures (`loginPage`, `homePage`)
- [ ] Scenario Outline with an Examples table for search terms
- [ ] Background steps for shared setup
- [ ] Tags on scenarios mapped to `@smoke` and `@regression`
- [ ] Generate features with the test-analyst skill, review them with the QA architect skill
- [ ] Show feature and scenario names in the HTML report
- [ ] README section: how BDD fits next to plain Playwright specs

**Outcome:** business-readable feature files that run on the same page objects and fixtures as the rest of the suite.

## Git workflow

- One branch per feature or milestone, with a prefix: `feat/`, `test/`, `refactor/`, `docs/`, `ci/`
- Pull request to `main`, CI must pass before merging
- Conventional commit messages
- Release tags at the end of M4 (v0.1) and M6 (v1.0)
