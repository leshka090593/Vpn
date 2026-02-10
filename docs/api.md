# API (Current MVP Scope)

## Health

- `GET /health` -> `{ status: "ok" }`

## Telegram Auth

- `POST /auth/telegram/start`
  - returns `{ sessionId, nonce, tgDeepLink, expiresAt }`
- `GET /auth/telegram/poll?sessionId=<uuid>`
  - returns `{ status, expiresAt }`
- `POST /auth/telegram/complete` with `{ sessionId }`
  - returns `{ jwt, refreshToken, user }`
- `POST /auth/refresh` with `{ refreshToken }`
  - returns `{ jwt }`

## Bot callback (internal)

- `POST /internal/telegram/confirm`
  - header: `x-bot-api-key`
  - body: `{ nonce, telegramId, telegramUsername? }`
  - marks auth session confirmed, upserts user
