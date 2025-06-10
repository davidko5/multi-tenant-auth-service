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
import { ClientLocalAuthenticationGuard } from '../guards/client-local-authentication.guard';
import { ClientJwtAuthenticationGuard } from '../guards/client-jwt-authentication.guard';
import ClientRegisterRequestDto from '../dto/client-register-request.dto';
import RequestWithUser from '../types/request-with-user.interface';

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
  signIn(@Req() req: RequestWithUser, @Res() res: Response) {
    const { user } = req;
    const cookie = this.clientAuthService.getCookieWithJwtToken(user.id);
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
