import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';
import { UserAuthService } from '../services/user-auth.service';
import { Injectable } from '@nestjs/common';
import { Request } from 'express';
import UserLoginRequestDto from '../dto/user-login-request.dto';

@Injectable()
export class UserLocalStrategy extends PassportStrategy(
  Strategy,
  'user-local',
) {
  constructor(private userAuthService: UserAuthService) {
    super({
      usernameField: 'email',
      passwordField: 'password',
      passReqToCallback: true,
    });
  }

  validate(req: Request, email: string, password: string) {
    const { appId, redirectUri } = req.body as UserLoginRequestDto;
    return this.userAuthService.getAuthenticatedUser(
      email,
      password,
      appId,
      redirectUri,
    );
  }
}
