import { Controller, Get } from '@nestjs/common';
import { createPublicKey } from 'crypto';
import { getPublicKey } from 'src/common/utils/get-jwt-keys';

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
