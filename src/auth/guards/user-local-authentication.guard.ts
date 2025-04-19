import { AuthGuard } from '@nestjs/passport';

export class UserLocalAuthenticationGuard extends AuthGuard('user-local') {}
