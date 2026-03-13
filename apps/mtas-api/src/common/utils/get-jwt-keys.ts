import { readFileSync } from 'fs';
import { join } from 'path';

// Reconstruct a valid PEM from any mangled form (spaces, literal \n, or correct)
function normalizePem(pem: string): string {
  const unified = pem.replace(/\\n/g, '\n').replace(/\r/g, '');

  const match = unified.match(
    /-----BEGIN ([A-Z ]+)-----([\s\S]*?)-----END \1-----/,
  );
  if (!match) return unified;

  const type = match[1];
  const base64 = match[2].replace(/\s+/g, '');
  const lines = base64.match(/.{1,64}/g) || [];

  return [
    `-----BEGIN ${type}-----`,
    ...lines,
    `-----END ${type}-----`,
    '',
  ].join('\n');
}

export function getPublicKey(): string {
  if (process.env.JWT_PUBLIC_KEY) {
    return normalizePem(process.env.JWT_PUBLIC_KEY);
  }
  return readFileSync(join(__dirname, '../../../public.pem'), 'utf8');
}

export function getPrivateKey(): string {
  if (process.env.JWT_PRIVATE_KEY) {
    return normalizePem(process.env.JWT_PRIVATE_KEY);
  }
  return readFileSync(join(__dirname, '../../../private.pem'), 'utf8');
}
