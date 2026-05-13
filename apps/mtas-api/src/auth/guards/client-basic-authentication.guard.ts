import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class ClientBasicAuthenticationGuard extends AuthGuard('client-basic') {}
