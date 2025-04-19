import { ClientAuthService } from '../services/client-auth.service';
import {
  Body,
  Controller,
  Post,
  HttpCode,
  HttpStatus,
  UseGuards,
  Request,
  Get,
  Req,
  Res,
} from '@nestjs/common';
import { Response } from 'express';
import RequestWithUser from '../types/request-with-user.interface';
import { ClientLocalAuthenticationGuard } from '../guards/client-local-authentication.guard';
import { ClientJwtAuthenticationGuard } from '../guards/client-jwt-authentication.guard';
import RequestWithClient from '../types/request-with-client.interface';
import ClientRegisterRequestDto from '../dto/client-register-request.dto';

@Controller('client-auth')
export class ClientAuthController {
  constructor(private clientAuthService: ClientAuthService) {}

  @Post('register')
  register(@Body() dto: ClientRegisterRequestDto) {
    return this.clientAuthService.register(dto);
  }

  @UseGuards(ClientLocalAuthenticationGuard)
  @HttpCode(HttpStatus.OK)
  @Post('login')
  signIn(@Req() req: RequestWithClient, @Res() res: Response) {
    const { client } = req;
    const cookie = this.clientAuthService.getCookieWithJwtToken(client.id);
    res.setHeader('Set-Cookie', cookie);

    return res.send();
  }

  @UseGuards(ClientJwtAuthenticationGuard)
  @Get('authenticated-client')
  getProfile(@Request() req: RequestWithUser) {
    return { ...req.user, password: undefined };
  }

  @UseGuards(ClientJwtAuthenticationGuard)
  @HttpCode(200)
  @Post('logout')
  logOut(@Res() res: Response) {
    res.setHeader('Set-Cookie', this.clientAuthService.getCookieForLogOut());
    res.send();
  }
}
