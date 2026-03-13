import { Controller, Get } from '@nestjs/common';
import { readFileSync } from 'fs';
import { join } from 'path';
import { createPublicKey } from 'crypto';

function getPublicKey(): string {
  if (process.env.JWT_PUBLIC_KEY) {
    return process.env.JWT_PUBLIC_KEY;
  }
  return readFileSync(join(__dirname, '../../../public.pem'), 'utf8');
}

@Controller('.well-known')
export class JwksController {
  private readonly jwks: { keys: any[] };

  constructor() {
    // Load your public key as text
    const pubPem = getPublicKey();

    // Convert to JWK
    const jwk = createPublicKey(pubPem).export({ format: 'jwk' }) as Record<
      string,
      any
    >;

    jwk.use = 'sig';
    jwk.kid = 'v1';

    // Build your JWKS
    this.jwks = { keys: [jwk] };
  }

  @Get('jwks.json')
  getJwks() {
    return this.jwks;
  }
}
