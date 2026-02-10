# VPN MVP Monorepo

This repository contains an end-to-end MVP foundation for an Android VPN product using Telegram linking, backend entitlement checks, and server provisioning plumbing.

## Current status

Implemented in this PR (Milestones 1-3):

- Repository bootstrap and service layout
- Infrastructure bootstrap (`docker-compose`) with PostgreSQL + backend + Telegram bot
- Backend API skeleton (Fastify + TypeScript + Prisma)
- Database schema + SQL migration for auth, users, subscriptions, countries, servers, and provisions
- Telegram login linking flow (`/auth/telegram/start`, poll, complete)
- Telegram bot `/start` deep-link handler to confirm auth sessions
- Core docs including architecture and setup

## Repository structure

- `android-app/`: Android app placeholder for upcoming milestones
- `backend/`: Fastify + Prisma API
- `telegram-bot/`: Telegram bot service
- `admin-web/`: Admin panel placeholder for upcoming milestones
- `infra/`: Compose and environment templates
- `docs/`: Architecture and setup documentation

## Quick start

1. Copy env templates:
   - `cp backend/.env.example backend/.env`
   - `cp telegram-bot/.env.example telegram-bot/.env`
2. Start postgres + backend + bot:
   - `docker compose -f infra/docker-compose.yml up --build`
3. Read detailed setup instructions in `docs/setup.md`.

