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
import { AuthService } from './auth.service';
import RegisterRequestDto from './dto/register-request.dto';
import { LocalAuthenticationGuard } from './local-authentication.guard';
import { JwtAuthenticationGuard } from './jwt-authentication.guard';
import RequestWithUser from './request-with-user.interface';
import { Response } from 'express';
import LoginRequestDto from './dto/login-request.dto';
import TokenExchangeRequestDto from './dto/token-exchange-request.dto';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register')
  register(@Body() dto: RegisterRequestDto) {
    return this.authService.register(dto);
  }

  @UseGuards(LocalAuthenticationGuard)
  @HttpCode(HttpStatus.OK)
  @Post('login')
  signIn(@Req() req: RequestWithUser, @Body() dto: LoginRequestDto) {
    const { user } = req;

    return this.authService.createAuthCode(
      user.id,
      dto.clientId,
      dto.redirectUri,
    );
  }

  @HttpCode(200)
  @Post('exchange-token')
  async exchangeToken(
    @Body() dto: TokenExchangeRequestDto,
    @Res() res: Response,
  ) {
    const cookie = await this.authService.exchangeAuthCodeForToken(dto);
    res.setHeader('Set-Cookie', cookie);

    return res.send();
  }

  @UseGuards(JwtAuthenticationGuard)
  @Get('authenticated-user')
  getProfile(@Request() req: RequestWithUser) {
    return { ...req.user, password: undefined };
  }

  @UseGuards(JwtAuthenticationGuard)
  @HttpCode(200)
  @Post('logout')
  logOut(@Res() res: Response) {
    res.setHeader('Set-Cookie', this.authService.getCookieForLogOut());
    res.send();
  }
}
