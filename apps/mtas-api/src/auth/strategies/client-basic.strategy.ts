import { PassportStrategy } from '@nestjs/passport';
import { BasicStrategy } from 'passport-http';
import { ClientsService } from 'src/clients/clients.service';
import * as crypto from 'crypto';
import { Injectable, UnauthorizedException } from '@nestjs/common';

@Injectable()
export class ClientBasicStrategy extends PassportStrategy(
  BasicStrategy,
  'client-basic',
) {
  constructor(private clientService: ClientsService) {
    super();
  }

  async validate(appId: string, clientSecret: string) {
    const client = await this.clientService.getByAppId(appId);
    if (!client || !client.secretHash) {
      throw new UnauthorizedException('invalid_client');
    }

    const secretHash = crypto
      .createHash('sha256')
      .update(clientSecret)
      .digest('hex');

    const ok = crypto.timingSafeEqual(
      Buffer.from(secretHash, 'hex'),
      Buffer.from(client.secretHash, 'hex'),
    );

    if (!ok) throw new UnauthorizedException('invalid_client');

    return client;
  }
}
