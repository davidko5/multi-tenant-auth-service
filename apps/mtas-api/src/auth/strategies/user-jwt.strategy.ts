import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Request } from 'express';
import { UsersService } from 'src/users/users.service';
import { TokenPayload } from '../types/token-payload.interface';
import { getPublicKey } from 'src/common/utils/get-jwt-keys';

@Injectable()
export class UserJwtStrategy extends PassportStrategy(Strategy, 'user-jwt') {
  constructor(private readonly usersService: UsersService) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        // Token from Cookie for requests from mtas-ui
        (req: Request) => {
          return (req.cookies as Record<string, string>)?.Authentication;
        },
        // Bearer header token for requests from client apps,
        // since we can not use Cookie because of different origins
        ExtractJwt.fromAuthHeaderAsBearerToken(),
      ]),
      ignoreExpiration: false,
      secretOrKey: getPublicKey(),
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
