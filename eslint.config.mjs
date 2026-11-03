import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import playwright from 'eslint-plugin-playwright';
import prettier from 'eslint-config-prettier';

const pwRecommended = playwright.configs['flat/recommended'];

export default tseslint.config(
  {
    ignores: ['node_modules', 'playwright-report', 'test-results', 'allure-results', 'allure-report'],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    ...pwRecommended,
    files: ['tests/**', 'src/**'],
    rules: {
      ...pwRecommended.rules,
      'playwright/no-wait-for-timeout': 'error',
      'playwright/no-networkidle': 'error',
      'playwright/no-force-option': 'error',
      'playwright/no-element-handle': 'error',
      'playwright/prefer-web-first-assertions': 'error',
      'playwright/missing-playwright-await': 'error',
      'playwright/no-raw-locators': 'warn',
    },
  },
  prettier,
);