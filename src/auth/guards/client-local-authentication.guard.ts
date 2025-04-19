import { AuthGuard } from '@nestjs/passport';

export class ClientLocalAuthenticationGuard extends AuthGuard('client-local') {}
