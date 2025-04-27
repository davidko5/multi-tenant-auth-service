import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';
import { Injectable } from '@nestjs/common';
import { ClientAuthService } from '../services/client-auth.service';

@Injectable()
export class ClientLocalStrategy extends PassportStrategy(
  Strategy,
  'client-local',
) {
  constructor(private clientAuthService: ClientAuthService) {
    super({
      usernameField: 'email',
      passwordField: 'password',
    });
  }

  validate(email: string, password: string) {
    return this.clientAuthService.getAuthenticatedClient(email, password);
  }
}
