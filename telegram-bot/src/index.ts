import 'dotenv/config';
import { Telegraf } from 'telegraf';

const token = process.env.TELEGRAM_BOT_TOKEN;
const backendBaseUrl = process.env.BACKEND_BASE_URL;
const botInternalApiKey = process.env.BOT_INTERNAL_API_KEY;

if (!token || !backendBaseUrl || !botInternalApiKey) {
  throw new Error('Missing TELEGRAM_BOT_TOKEN, BACKEND_BASE_URL, or BOT_INTERNAL_API_KEY');
}

const bot = new Telegraf(token);

bot.start(async (ctx) => {
  const nonce = ctx.payload;
  if (!nonce) {
    await ctx.reply('Missing login session. Return to app and tap Continue with Telegram again.');
    return;
  }

  const telegramId = String(ctx.from?.id ?? '');
  if (!telegramId) {
    await ctx.reply('Unable to identify your Telegram account.');
    return;
  }

  try {
    const response = await fetch(`${backendBaseUrl}/internal/telegram/confirm`, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-bot-api-key': botInternalApiKey
      },
      body: JSON.stringify({
        nonce,
        telegramId,
        telegramUsername: ctx.from?.username
      })
    });

    if (!response.ok) {
      const body = (await response.json().catch(() => null)) as { reason?: string } | null;
      await ctx.reply(`Login confirmation failed: ${body?.reason ?? response.statusText}`);
      return;
    }

    await ctx.reply('✅ Account linked. Return to the VPN app to continue login.');
  } catch (error) {
    console.error('Failed to confirm session', error);
    await ctx.reply('Temporary error while linking account. Please try again.');
  }
});

bot.launch().then(() => {
  console.log('Telegram bot started');
});

process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
