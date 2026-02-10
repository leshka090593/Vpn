import { AuthSessionStatus, UserStatus } from '@prisma/client';
import { FastifyInstance } from 'fastify';
import { config } from '../config.js';
import { randomNonce } from '../utils/random.js';

const SESSION_TTL_MINUTES = 10;

export class AuthService {
  constructor(private readonly app: FastifyInstance) {}

  async startSession() {
    const nonce = randomNonce();
    const expiresAt = new Date(Date.now() + SESSION_TTL_MINUTES * 60 * 1000);

    const session = await this.app.prisma.authSession.create({
      data: {
        nonce,
        expiresAt,
        status: AuthSessionStatus.PENDING
      }
    });

    const tgDeepLink = `tg://resolve?domain=${config.telegramBotUsername}&start=${nonce}`;

    return {
      sessionId: session.id,
      nonce,
      tgDeepLink,
      expiresAt: session.expiresAt
    };
  }

  async pollSession(sessionId: string) {
    const session = await this.app.prisma.authSession.findUnique({ where: { id: sessionId } });

    if (!session) {
      return { status: 'NOT_FOUND' as const };
    }

    if (session.expiresAt < new Date() && session.status === AuthSessionStatus.PENDING) {
      await this.app.prisma.authSession.update({
        where: { id: session.id },
        data: { status: AuthSessionStatus.EXPIRED }
      });
      return { status: 'EXPIRED' as const, expiresAt: session.expiresAt };
    }

    return { status: session.status, expiresAt: session.expiresAt };
  }

  async confirmFromTelegram(input: { nonce: string; telegramId: string; telegramUsername?: string }) {
    const session = await this.app.prisma.authSession.findUnique({ where: { nonce: input.nonce } });

    if (!session) {
      return { ok: false as const, reason: 'SESSION_NOT_FOUND' };
    }

    if (session.expiresAt < new Date()) {
      await this.app.prisma.authSession.update({
        where: { id: session.id },
        data: { status: AuthSessionStatus.EXPIRED }
      });
      return { ok: false as const, reason: 'SESSION_EXPIRED' };
    }

    if (session.status !== AuthSessionStatus.PENDING) {
      return { ok: false as const, reason: 'SESSION_ALREADY_USED' };
    }

    await this.app.prisma.$transaction(async (tx) => {
      await tx.user.upsert({
        where: { telegramId: input.telegramId },
        create: {
          telegramId: input.telegramId,
          telegramUsername: input.telegramUsername,
          status: UserStatus.ACTIVE,
          lastLoginAt: new Date()
        },
        update: {
          telegramUsername: input.telegramUsername,
          lastLoginAt: new Date()
        }
      });

      await tx.authSession.update({
        where: { id: session.id },
        data: {
          status: AuthSessionStatus.CONFIRMED,
          telegramId: input.telegramId
        }
      });
    });

    return { ok: true as const };
  }

  async completeSession(sessionId: string) {
    const session = await this.app.prisma.authSession.findUnique({ where: { id: sessionId } });

    if (!session || session.status !== AuthSessionStatus.CONFIRMED || !session.telegramId) {
      return null;
    }

    const user = await this.app.prisma.user.findUnique({ where: { telegramId: session.telegramId } });
    if (!user) {
      return null;
    }

    await this.app.prisma.authSession.update({
      where: { id: session.id },
      data: { status: AuthSessionStatus.CONSUMED }
    });

    const jwtPayload = { sub: user.id, telegramId: user.telegramId, type: 'access' as const };
    const refreshPayload = { sub: user.id, telegramId: user.telegramId, type: 'refresh' as const };

    const jwt = await this.app.jwt.sign(jwtPayload, { expiresIn: config.jwtExpiresIn });
    const refreshToken = await this.app.jwt.sign(refreshPayload, {
      secret: config.jwtRefreshSecret,
      expiresIn: config.refreshExpiresIn
    });

    return {
      jwt,
      refreshToken,
      user: {
        id: user.id,
        telegramId: user.telegramId,
        telegramUsername: user.telegramUsername
      }
    };
  }

  async refreshAccessToken(refreshToken: string) {
    try {
      const payload = await this.app.jwt.verify<{ sub: string; telegramId: string; type: 'refresh' }>(
        refreshToken,
        { secret: config.jwtRefreshSecret }
      );

      if (payload.type !== 'refresh') {
        return null;
      }

      const jwt = await this.app.jwt.sign({
        sub: payload.sub,
        telegramId: payload.telegramId,
        type: 'access'
      });

      return { jwt };
    } catch {
      return null;
    }
  }
}
