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
} from '@nestjs/common';
import { UserAuthService } from '../services/user-auth.service';
import UserRegisterRequestDto from '../dto/user-register-request.dto';
import { UserLocalAuthenticationGuard } from '../guards/user-local-authentication.guard';
import { UserJwtAuthenticationGuard } from '../guards/user-jwt-authentication.guard';
import UserLoginRequestDto from '../dto/user-login-request.dto';
import UserTokenExchangeRequestDto from '../dto/user-token-exchange-request.dto';
import RequestWithUser from '../types/request-with-user.interface';
import UserLoginResponseDto from '../dto/user-login-response.dto';
import UserTokenRefreshRequestDto from '../dto/user-token-refresh-request.dto';
import UserRefreshTokenRevokeRequestDto from '../dto/user-refresh-token-revoke-request.dto';
import { ClientBasicAuthenticationGuard } from '../guards/client-basic-authentication.guard';
import RequestWithClient from '../types/request-with-client.interface';

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

  @UseGuards(ClientBasicAuthenticationGuard)
  @HttpCode(200)
  @Post('exchange-token')
  async exchangeToken(
    @Req() req: RequestWithClient,
    @Body() dto: UserTokenExchangeRequestDto,
  ) {
    return await this.userAuthService.exchangeAuthCode({
      ...dto,
      appId: req.user.appId,
    });
  }

  @UseGuards(ClientBasicAuthenticationGuard)
  @Post('refresh-token')
  async refreshToken(
    @Req() req: RequestWithClient,
    @Body() dto: UserTokenRefreshRequestDto,
  ) {
    return this.userAuthService.refreshAccessToken({
      ...dto,
      appId: req.user.appId,
    });
  }

  @UseGuards(UserJwtAuthenticationGuard)
  @Get('authenticated-user')
  getProfile(@Request() req: RequestWithUser) {
    return { ...req.user, password: undefined };
  }

  // Should be called on logout
  @UseGuards(ClientBasicAuthenticationGuard)
  @HttpCode(200)
  @Post('revoke')
  async revoke(@Body() dto: UserRefreshTokenRevokeRequestDto) {
    await this.userAuthService.revokeFamily(dto.refreshToken);
  }
}
