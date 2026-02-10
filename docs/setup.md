# Local Setup

## Prerequisites

- Docker + Docker Compose
- Node.js 20+ (if running services outside docker)

## 1) Configure environment

```bash
cp backend/.env.example backend/.env
cp telegram-bot/.env.example telegram-bot/.env
```

Set required values:

- `JWT_SECRET` and `JWT_REFRESH_SECRET`
- `TELEGRAM_BOT_TOKEN`
- `TELEGRAM_BOT_USERNAME`

## 2) Start services

```bash
docker compose -f infra/docker-compose.yml up --build
```

Services:

- Backend: `http://localhost:8080`
- Bot process: runs in compose network
- Postgres: `localhost:5432`

## 3) Apply migrations (if running backend locally)

```bash
cd backend
npm install
npm run prisma:generate
npm run prisma:migrate:sql
```

## 4) Smoke test Telegram linking flow

1. `POST /auth/telegram/start`
2. Open returned `tgDeepLink`
3. Press start in bot
4. Poll `/auth/telegram/poll`
5. Complete via `POST /auth/telegram/complete`
