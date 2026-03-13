import { readFileSync } from 'fs';
import { join } from 'path';

// Env vars may contain literal '\n' instead of actual newlines (common in Docker/Coolify)
function normalizePem(pem: string): string {
  return pem.replace(/\\n/g, '\n');
}

export function getPublicKey(): string {
  if (process.env.JWT_PUBLIC_KEY) {
    const raw = process.env.JWT_PUBLIC_KEY;
    console.log(
      'DEBUG RAW KEY (first 80 chars):',
      JSON.stringify(raw.slice(0, 80)),
    );
    const normalized = normalizePem(raw);
    console.log(
      'DEBUG NORMALIZED KEY (first 80 chars):',
      JSON.stringify(normalized.slice(0, 80)),
    );
    return normalized;
  }
  return readFileSync(join(__dirname, '../../../public.pem'), 'utf8');
}

export function getPrivateKey(): string {
  if (process.env.JWT_PRIVATE_KEY) {
    return normalizePem(process.env.JWT_PRIVATE_KEY);
  }
  return readFileSync(join(__dirname, '../../../private.pem'), 'utf8');
}
