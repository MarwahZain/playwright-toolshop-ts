# Toolshop (Practice Software Testing): Local Run Reference

How to run the app under test locally with Docker, so the suite can run against `localhost`.

Repo: https://github.com/testsmith-io/practice-software-testing
Machine: Mac (Apple Silicon), Docker Desktop
Local folder: `~/Projects/ToolsShopApp/practice-software-testing`

## Start the app

```bash
cd ~/Projects/ToolsShopApp/practice-software-testing
docker compose up -d
docker exec -it pst-laravel-api-1 php artisan migrate:fresh --seed
```

Then open http://localhost:4200.

Note: `docker compose exec laravel-api php artisan migrate:refresh --seed` is the older command from the fork's README. If it fails, use the `docker exec` line above. If the container name differs, check it with `docker ps`.

After `docker compose up -d`, every container should say Running or Started, including `pst-composer-1`.

## Stop the app

```bash
docker compose down
```

Then quit Docker Desktop to free memory.

## Local URLs

| What        | URL                                     |
| ----------- | --------------------------------------- |
| Web app     | http://localhost:4200                   |
| REST API    | http://localhost:8091                   |
| Swagger     | http://localhost:8091/api/documentation |
| MailCatcher | http://localhost:1080                   |
| PHPMyAdmin  | http://localhost:8000 (root / root)     |

## Test accounts

These are Toolshop's public seed accounts.

| Role  | Email                                 | Password  |
| ----- | ------------------------------------- | --------- |
| Admin | admin@practicesoftwaretesting.com     | welcome01 |
| User  | customer@practicesoftwaretesting.com  | welcome01 |
| User  | customer2@practicesoftwaretesting.com | welcome01 |
| User  | customer3@practicesoftwaretesting.com | pass123   |

## Switch sprint

The sprint is set in the Toolshop app's own hidden `.env` file, in the folder above, not in this test repo.

Edit it (`open -e .env`) and set `SPRINT=sprint5`.
Options: sprint1 to sprint5, sprint5-with-bugs, sprint5-holtesting.
Then run `docker compose up -d` again and reseed.

Check the current sprint with `grep SPRINT .env`.

## Quick API check

```bash
curl -s http://localhost:8091/products | grep -o '"in_stock":[^,]*' | head -3
```

On sprint 5 this prints `"in_stock":true`.

## Troubleshooting

- `no matching manifest for linux/arm64`: add `platform: linux/amd64` under that service in `docker-compose.yml`.
- No products in the app: run the seed command again.
- Container exits with code 137: raise Docker memory (Settings, Resources).
- `unknown command: docker compose`: open Docker Desktop and wait for Engine running, then reopen Terminal.
