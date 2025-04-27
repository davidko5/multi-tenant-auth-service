import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Request } from 'express';
import { UsersService } from 'src/users/users.service';
import { ConfigService } from '@nestjs/config';
import { TokenPayload } from '../types/token-payload.interface';

@Injectable()
export class UserJwtStrategy extends PassportStrategy(Strategy, 'user-jwt') {
  constructor(
    private readonly configService: ConfigService,
    private readonly usersService: UsersService,
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
    if (payload.type !== 'user') {
      throw new UnauthorizedException('Invalid token type for user access');
    }

    return this.usersService.getById(payload.id);
  }
}
