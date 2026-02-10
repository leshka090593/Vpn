# Architecture Overview

## High-level flow

1. Android app calls backend `POST /auth/telegram/start` to create an auth session (`sessionId`, `nonce`, deep-link).
2. App opens Telegram bot deep-link (`tg://resolve?domain=<bot>&start=<nonce>`).
3. User presses start in bot; bot calls backend bot-only endpoint to confirm session and bind Telegram identity.
4. Android app polls `GET /auth/telegram/poll?sessionId=...` until confirmed.
5. App exchanges session via `POST /auth/telegram/complete` for JWT + refresh token.
6. App uses JWT for authorized API access (countries, entitlement, vpn config).
7. Backend later selects server by country and integrates with 3x-ui to produce VLESS + REALITY config.
8. Android VPN layer consumes config and starts `VpnService` tunnel.

## Components

- **Android app** (planned in upcoming milestone): Telegram auth UX, country picker, billing, VPN control.
- **Backend API**: auth session lifecycle, users/subscriptions/countries/servers/provisions data, entitlement and VPN config issuance.
- **Telegram bot**: receives deep links and confirms sessions through backend.
- **Admin panel** (planned in upcoming milestone): CRUD for countries/servers and read-only users/subscriptions.
- **PostgreSQL**: source of truth for app/business state.

## Data minimization

MVP stores only required fields for operation:

- Telegram identity (`telegram_id`, optional username)
- Auth session nonce + status
- Subscription entitlement state
- Provision linkage metadata

No VPN traffic logs are part of this architecture.
