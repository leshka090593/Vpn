# Deployment Notes (MVP)

- Use HTTPS for backend and admin endpoints in production.
- Store secrets in a managed secret store (not in repo).
- Rotate JWT secrets and bot API key periodically.
- Restrict `/internal/telegram/confirm` by network + `x-bot-api-key`.
- Use managed PostgreSQL with backups and point-in-time recovery.
- Add monitoring for backend and bot process health.
