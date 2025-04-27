import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Request } from 'express';
import { ConfigService } from '@nestjs/config';
import { TokenPayload } from '../types/token-payload.interface';
import { ClientsService } from 'src/clients/clients.service';

@Injectable()
export class ClientJwtStrategy extends PassportStrategy(
  Strategy,
  'client-jwt',
) {
  constructor(
    private readonly configService: ConfigService,
    private readonly clientsService: ClientsService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (req: Request) => {
          return (req.cookies as Record<string, string>)?.Authentication;
        },
      ]),
      secretOrKey: configService.get('JWT_SECRET') as string,
    });
  }

  validate(payload: TokenPayload) {
    if (payload.type !== 'client') {
      throw new UnauthorizedException('Invalid token type for client access');
    }

    return this.clientsService.getById(payload.id);
  }
}
