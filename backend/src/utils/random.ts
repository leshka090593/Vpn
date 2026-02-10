import { randomBytes } from 'crypto';

export function randomNonce(length = 24): string {
  return randomBytes(length).toString('base64url');
}
