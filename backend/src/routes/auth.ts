import { FastifyPluginAsync } from 'fastify';
import { z } from 'zod';
import { AuthService } from '../services/authService.js';

export const authRoutes: FastifyPluginAsync = async (app) => {
  const authService = new AuthService(app);

  app.post('/auth/telegram/start', async () => {
    return authService.startSession();
  });

  app.get('/auth/telegram/poll', async (request, reply) => {
    const querySchema = z.object({ sessionId: z.string().uuid() });
    const { sessionId } = querySchema.parse(request.query);
    const result = await authService.pollSession(sessionId);

    if (result.status === 'NOT_FOUND') {
      return reply.code(404).send(result);
    }

    return result;
  });

  app.post('/auth/telegram/complete', async (request, reply) => {
    const bodySchema = z.object({ sessionId: z.string().uuid() });
    const { sessionId } = bodySchema.parse(request.body);

    const result = await authService.completeSession(sessionId);
    if (!result) {
      return reply.code(400).send({ error: 'SESSION_NOT_CONFIRMED' });
    }

    return result;
  });

  app.post('/auth/refresh', async (request, reply) => {
    const bodySchema = z.object({ refreshToken: z.string().min(1) });
    const { refreshToken } = bodySchema.parse(request.body);

    const result = await authService.refreshAccessToken(refreshToken);
    if (!result) {
      return reply.code(401).send({ error: 'INVALID_REFRESH_TOKEN' });
    }

    return result;
  });

  app.post('/internal/telegram/confirm', async (request, reply) => {
    const apiKey = request.headers['x-bot-api-key'];
    if (apiKey !== app.config.botInternalApiKey) {
      return reply.code(401).send({ error: 'UNAUTHORIZED' });
    }

    const bodySchema = z.object({
      nonce: z.string().min(1),
      telegramId: z.string().min(1),
      telegramUsername: z.string().optional()
    });

    const payload = bodySchema.parse(request.body);
    const result = await authService.confirmFromTelegram(payload);

    if (!result.ok) {
      return reply.code(400).send(result);
    }

    return { ok: true };
  });
};
