import fs from 'node:fs';
import { parse } from 'dotenv';

/**
 * Loads local settings files into process.env, once, before anything reads them.
 *
 * Precedence, strongest first:
 *   1. real environment variables (the terminal, or GitHub secrets in CI)
 *   2. .env.<TEST_ENV>, e.g. .env.uat: personal accounts and tokens for that environment
 *   3. .env: settings shared by every environment, e.g. TEST_ENV=local
 * A value that is already set is never overwritten, which gives exactly this order.
 * All .env files except .env.example are git-ignored: each person keeps their own.
 */
function readEnvFile(file: string): Record<string, string> {
  return fs.existsSync(file) ? parse(fs.readFileSync(file)) : {};
}

const base = readEnvFile('.env');
const environment = (process.env.TEST_ENV || base.TEST_ENV || 'local').trim().toLowerCase();
const specific = readEnvFile(`.env.${environment}`);

for (const source of [specific, base]) {
  for (const [key, value] of Object.entries(source)) {
    if (process.env[key] === undefined) process.env[key] = value;
  }
}
