import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Request } from 'express';
import { UsersService } from 'src/users/users.service';
import { TokenPayload } from '../types/token-payload.interface';
import { join } from 'path';
import { readFileSync } from 'fs';

@Injectable()
export class UserJwtStrategy extends PassportStrategy(Strategy, 'user-jwt') {
  constructor(private readonly usersService: UsersService) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (req: Request) => {
          return (req.cookies as Record<string, string>)?.Authentication;
        },
      ]),
      ignoreExpiration: false,
      secretOrKey: readFileSync(join(__dirname, '../../../public.pem'), 'utf8'),
      algorithms: ['RS256'],
    });
  }

  validate(payload: TokenPayload) {
    if (payload.type !== 'user') {
      throw new UnauthorizedException('Invalid token type for user access');
    }

    return this.usersService.getById(payload.id);
  }
}
