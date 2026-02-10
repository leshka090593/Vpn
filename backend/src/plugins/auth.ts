import fp from 'fastify-plugin';
import fastifyJwt from '@fastify/jwt';
import { config } from '../config.js';

declare module '@fastify/jwt' {
  interface FastifyJWT {
    payload: { sub: string; telegramId: string; type: 'access' | 'refresh' };
    user: { sub: string; telegramId: string; type: 'access' | 'refresh' };
  }
}

export default fp(async (app) => {
  await app.register(fastifyJwt, {
    secret: config.jwtSecret,
    sign: { expiresIn: config.jwtExpiresIn }
  });
});
