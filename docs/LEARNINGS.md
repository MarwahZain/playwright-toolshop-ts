## MIMOS: Core UI tests

One CI note: GitHub Actions can’t reach your local Docker, which is why CI targets the public site. If you later want CI on the local stack too, the workflow can clone the Toolshop repo and run docker compose up as a service step

`mkdir ~/projects/playwright-toolshop-ts && cd $_`
`npm init playwright@latest # TypeScript, tests folder, add GitHub Actions: yes`
`npm i -D dotenv zod eslint prettier`
`git init && gh repo create playwright-toolshop-ts --public --source=. --push`

TypeScript only adds type annotations on top
`Keep strict: true`

# lint

eslint-plugin-playwright: it flags `waitForTimeout`, missing `await`, and focused `test.only`, which enforces your outcome automatically.
zero `waitForTimeout`

`npm run lint`
`npm run format`
run
`npm run format:check` as the first CI step, so a badly formatted PR fails before any test runs.

# .vscode/extensions.json

The Playwright extension, it lets you run and debug single tests from the editor gutter and pick locators on the live page.

# playwright.config.ts

`testIdAttribute: 'data-test'`, //Putting it in the top-level use applies it to every project. Now `getByTestId` reads Toolshop’s _data-test_ attributes directly
Without this setting, Playwright looks for `data-testid` and finds nothing on Toolshop. i.e this can be altered in favor of your project.

# run tests with:

`npx playwright test --grep @smoke --project=chromium`
`npx playwright test tests/ui/login.spec.ts --project=chromium`
`npx playwright test tests/ui/login.spec.ts --project=chromium --headed`
`npx playwright test --ui # visual runner: watch steps, time-travel through each action`
`npx playwright test --debug # opens the inspector and pauses on every step`

# gitHub

`git init -b main`
`git add .`
`git status # .env must NOT be listed; .env.example should be`
`git commit -m "chore: bootstrap Playwright + TypeScript framework for Toolshop"`

# github CLI

`brew install gh # if not installed`
`gh auth login # GitHub.com → HTTPS → login with browser`
`gh repo create playwright-toolshop-ts --public --source=. --remote=origin --push \`
`--description "Playwright + TypeScript test framework for the Toolshop demo app: UI, API, hybrid and mocked tests"`

`git init -b main`
`git add .`
`git status # confirm .env is not listed`
`git commit -m "chore: bootstrap Playwright + TypeScript framework for Toolshop"`
`git remote add origin https://github.com/<your-username>/playwright-toolshop-ts.git`
`git push -u origin main`

`git checkout -b feat/m1-ui-tests`
`git add .`
`git commit -m "test: add valid customer login test"`
`git push -u origin feat/m1-ui-tests`
`--force-with-lease` replaces the remote branch, but only if it still contains exactly what you

If an account does get locked, reseeding resets it:
`docker exec -it pst-laravel-api-1 php artisan migrate:fresh --seed`

# Typescript

`selectOption()` returns the selected values `(Promise<string[]>)`, but I typed the action as `() => Promise<void>`, so TypeScript rejects anything that returns a value.
change it to `Promise<unknown>`

using css selectors will trigger the no-raw-locators rule and it will flag it

# What a project is

A Playwright project is a named set of settings that a group of tests runs with.
and three projects (chromium, firefox, webkit) run everytime
A project can set much more than the browser: which test files it runs, whether the browser starts logged in (storageState), and which other projects must finish first (dependencies).

# “Projects per role” uses that to say:

these tests run as a guest, these as a customer, these as an admin.

## The four projects

** setup: **
runs the auth setup file only. It logs in through the API and writes .auth/customer.json and .auth/admin.json.

# guest:

no saved state. Runs tests for logged-out behavior: the login form, search, filter, sort, pagination.

# customer:

loads .auth/customer.json. Runs tests that need a logged-in shopper: account page, favorites, later checkout.

# admin:

loads .auth/admin.json. Runs admin tests: dashboard, product management.
customer and admin list setup as a dependency, so Playwright always runs setup first. If setup fails, those projects are skipped with a clear message instead of running and failing on “unauthorized”.
**How tests are assigned to a role**
The simplest way is by folder:
`tests/
├── auth.setup.ts
└── ui/
├── guest/ login, search, filter, sort, pagination, smoke
├── customer/ account, favorites, checkout
└── admin/ dashboard, products
Each project uses testMatch to pick its folder
`

# State at the start of every test.

Logging with the same user - using the token saved in the .json may cause issue if two tests contradict while testing, and that may produce flaky tests.
A cart test first empties the cart through the API, then adds what it needs, then asserts. It never trusts what a previous test left behind. On its own this doesn’t stop two parallel tests clashing, but combined with option 2 it does.
Run that group serially. test.describe.configure({ mode: 'serial' }). It works, but makes the suite slower and hides the design problem. Keep it as a last resort.

# workers

Workers can be translated to how many sessions at a time are open in parallel
Workers are separate processes that run your tests at the same time. Each worker starts its own browser and picks up tests one by one
When fullyParallel: true is set, Playwright spreads even the tests inside a single file across workers, not only whole files.
undefined: depends on the machine
**WorkerFixtures**
Two kinds of fixtures
Playwright fixtures have a scope, which decides how long one instance lives:
**Test scope (the default):** created for each test and thrown away after it. page, request, loginPage and brandsApi are all test-scoped. Every test gets fresh ones, so tests can’t affect each other.
**Worker scope:** created once per worker process and shared by every test that worker runs. With 4 workers, there are 4 instances in total, whatever the number of tests.
In Java terms, test scope is like @BeforeEach, and worker scope is closer to @BeforeAll, except per parallel worker rather than per class.
Why it uses playwright.request.newContext()

**A worker fixture** can’t use test fixtures, because it outlives every single test. request is test-scoped, so adminToken can’t ask for it. Instead it creates its own short-lived HTTP context from the playwright object, logs in, and disposes of the context. The test-scoped clients then combine both: brandsApi takes the fresh per-test request and the shared adminToken.
**The rule for worker fixtures**
Only share things that tests read and never change. A token is safe: no test modifies it. A shared cart or a shared test user would bring back the parallel collisions we discussed, just inside one worker.
**One limit to remember:** the token expires after 5 minutes. A worker that runs API tests for longer than that would start getting 401s on its later tests.

# Endpoints validations

**zod and ajv**
JSON Schema is a language-neutral standard
ajv validates against JSON Schema, a standard file format.
ajv is the most common JavaScript validator for those files.
**REST Assured’s** matchesJsonSchemaInClasspath("product.json")
zod describes the shape in TypeScript code.
No separate file format: the schema is a TypeScript object, and zod can generate the TypeScript type from it.
**Comparing them**

| Category                                                                                            | ajv                                                                  | zod                                    |
| --------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------- | -------------------------------------- |
| Schema                                                                                              | lives in .json files (JSON Schema standard)                          | TypeScript code                        |
| TypeScript types                                                                                    | written separately, can drift from the schema                        | generated from the schema with z.infer |
| Shared with other teams and languages                                                               | yes, any JSON Schema tool can read it                                | no, TypeScript only                    |
| Fits best when                                                                                      | the backend team publishes schemas, for example from an OpenAPI spec | the test suite owns the schemas        |
| Error messages                                                                                      | precise but technical                                                | readable: field path plus reason       |
| Closest Java equivalent                                                                             | REST Assured + JSON Schema files                                     | POJO + Bean Validation, in one         |
| __Replaced `types.ts` with `zod schemas` so types are generated from the contract and can’t drift.” |

# Docker

Restart and reseed. The sprint only changes after Docker restarts with the new setting:
`docker compose up -d`
`docker exec -it pst-laravel-api-1 php artisan migrate:fresh --seed`
