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
import { UserAuthService } from '../services/user-auth.service';
import UserRegisterRequestDto from '../dto/user-register-request.dto';
import { UserLocalAuthenticationGuard } from '../guards/user-local-authentication.guard';
import { UserJwtAuthenticationGuard } from '../guards/user-jwt-authentication.guard';
import { Response } from 'express';
import UserLoginRequestDto from '../dto/user-login-request.dto';
import UserTokenExchangeRequestDto from '../dto/user-token-exchange-request.dto';
import RequestWithUser from '../types/request-with-user.interface';
import UserLoginResponseDto from '../dto/user-login-response.dto';

@Controller('user-auth')
export class UserAuthController {
  constructor(private userAuthService: UserAuthService) {}

  @Post('register')
  register(@Body() dto: UserRegisterRequestDto) {
    return this.userAuthService.register(dto);
  }

  @UseGuards(UserLocalAuthenticationGuard)
  @HttpCode(HttpStatus.OK)
  @Post('login')
  async signIn(@Req() req: RequestWithUser, @Body() dto: UserLoginRequestDto) {
    const { user } = req;

    const authCode = await this.userAuthService.createAuthCode(
      user.id,
      dto.appId,
      dto.redirectUri,
    );

    return new UserLoginResponseDto(authCode);
  }

  @HttpCode(200)
  @Post('exchange-token')
  async exchangeToken(
    @Body() dto: UserTokenExchangeRequestDto,
    @Res() res: Response,
  ) {
    const cookie = await this.userAuthService.exchangeAuthCodeForToken(dto);
    res.setHeader('Set-Cookie', cookie);

    return res.send();
  }

  @UseGuards(UserJwtAuthenticationGuard)
  @Get('authenticated-user')
  getProfile(@Request() req: RequestWithUser) {
    return { ...req.user, password: undefined };
  }

  @UseGuards(UserJwtAuthenticationGuard)
  @HttpCode(200)
  @Post('logout')
  logOut(@Res() res: Response) {
    res.setHeader('Set-Cookie', this.userAuthService.getCookieForLogOut());
    res.send();
  }
}
