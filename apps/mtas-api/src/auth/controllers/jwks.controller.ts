import { Controller, Get } from '@nestjs/common';
import { readFileSync } from 'fs';
import { join } from 'path';
import { pem2jwk } from 'pem-jwk';

@Controller('.well-known')
export class JwksController {
  private readonly jwks: { keys: any[] };

  constructor() {
    // Load your public key as text
    const pubPem = readFileSync(join(__dirname, '../../../public.pem'), 'utf8');

    // Convert to JWK
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call
    const jwk = pem2jwk(pubPem) as Record<string, any>;

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
