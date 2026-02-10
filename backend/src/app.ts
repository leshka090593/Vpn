import Fastify from 'fastify';
import cors from '@fastify/cors';
import prismaPlugin from './plugins/prisma.js';
import authPlugin from './plugins/auth.js';
import { healthRoutes } from './routes/health.js';
import { authRoutes } from './routes/auth.js';
import { config } from './config.js';

declare module 'fastify' {
  interface FastifyInstance {
    config: typeof config;
  }
}

export async function buildApp() {
  const app = Fastify({ logger: true });

  app.decorate('config', config);

  await app.register(cors, {
    origin: true
  });

  await app.register(prismaPlugin);
  await app.register(authPlugin);

  await app.register(healthRoutes);
  await app.register(authRoutes);

  return app;
}
