import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';
import { AuthService } from './auth.service';
import { Injectable } from '@nestjs/common';
import { Request } from 'express';
import LoginRequestDto from './dto/login-request.dto';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private authService: AuthService) {
    super({
      usernameField: 'email',
      passwordField: 'password',
      passReqToCallback: true,
    });
  }

  validate(req: Request, email: string, password: string) {
    const { clientId } = req.body as LoginRequestDto;
    return this.authService.getAuthenticatedUther(email, password, clientId);
  }
}
