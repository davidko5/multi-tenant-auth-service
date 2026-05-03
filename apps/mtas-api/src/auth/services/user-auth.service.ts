import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { UsersService } from '../../users/users.service';
import { JwtService } from '@nestjs/jwt';
import UserRegisterRequestDto from '../dto/user-register-request.dto';
import * as bcrypt from 'bcrypt';
import { PostgresErrorCodes } from 'src/database/postgresErrorCodes.enum';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';
import { InjectRepository } from '@nestjs/typeorm';
import { AuthCode } from '../entities/auth-code.entity';
import { LessThan, Repository } from 'typeorm';
import { Cron, CronExpression } from '@nestjs/schedule';
import { TokenPayload } from '../types/token-payload.interface';
import { ClientsService } from 'src/clients/clients.service';
import { RefreshToken } from '../entities/refresh-token.entity';
import { PinoLogger } from 'nestjs-pino';

interface PostgresError extends Error {
  code?: string;
}

@Injectable()
export class UserAuthService {
  public AUTH_CODE_EXPIRATION: number;

  constructor(
    private configService: ConfigService,
    private usersService: UsersService,
    private clientsService: ClientsService,
    @Inject('USER_JWT_SERVICE')
    private jwtService: JwtService,
    @InjectRepository(AuthCode)
    private readonly authCodesRepository: Repository<AuthCode>,
    @InjectRepository(RefreshToken)
    private readonly refreshTokensRepository: Repository<RefreshToken>,
    private readonly logger: PinoLogger,
  ) {
    this.logger.setContext(UserAuthService.name);
    this.AUTH_CODE_EXPIRATION = this.configService.getOrThrow<number>(
      'AUTH_CODE_EXPIRATION',
    );
  }

  public async register(dto: UserRegisterRequestDto) {
    const hashedPassword = await bcrypt.hash(dto.password, 10);

    try {
      const client = await this.clientsService.getByAppId(dto.appId);
      if (!client) {
        throw new HttpException('Client not found', HttpStatus.BAD_REQUEST);
      }

      const createdUser = await this.usersService.create({
        ...dto,
        client,
        password: hashedPassword,
        createdAt: new Date(),
      });
      return { ...createdUser, password: undefined };
    } catch (error) {
      if (
        (error as PostgresError)?.code === PostgresErrorCodes.UniqueViolation
      ) {
        throw new HttpException(
          'User with this email already exists',
          HttpStatus.BAD_REQUEST,
        );
      }
    }
    throw new HttpException(
      'Something went wrong',
      HttpStatus.INTERNAL_SERVER_ERROR,
    );
  }

  public async getAuthenticatedUser(
    email: string,
    plainTextPassword: string,
    appId: string,
    redirectUri: string,
  ) {
    try {
      const user = await this.usersService.getByEmailAndApp(email, appId);
      await this.verifyPassword(plainTextPassword, user.password);
      await this.verifyRedirectUri(redirectUri, appId);

      return { ...user, password: undefined, client: undefined };
    } catch {
      throw new HttpException(
        'Wrong credentials or client mismatch',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  public async refreshAccessToken({
    refreshToken,
    appId,
  }: {
    refreshToken: string;
    appId: string;
  }) {
    const hashedToken = crypto
      .createHash('sha256')
      .update(refreshToken)
      .digest('hex');

    const storedToken = await this.refreshTokensRepository.findOne({
      where: { token: hashedToken, appId },
    });

    // Wrong token or expired - force relogin
    if (!storedToken || storedToken.expiresAt < new Date()) {
      // Per RFC 6749 refresh endpoint should return 400 with {"error": "invalid_grant"}
      // for all failure cases (expired, revoked, invalid)
      throw new HttpException('invalid_grant', HttpStatus.BAD_REQUEST);
    } else if (storedToken.isRevoked) {
      // Just rejecting, no family rewocation dince should be already revoked
      throw new HttpException('invalid_grant', HttpStatus.BAD_REQUEST);
    } else if (!storedToken.replacedAt) {
      // Rotate the old refresh token
      storedToken.replacedAt = new Date();
      await this.refreshTokensRepository.save(storedToken);

      const payload: TokenPayload = {
        id: storedToken.userId,
        type: 'user',
        aud: storedToken.appId,
      };
      const accessToken = this.jwtService.sign(payload);

      const newRefreshToken = await this.createRefreshToken(
        storedToken.userId,
        appId,
        storedToken.familyId, // Pass family ID to rotate within the same family
      );

      this.logger.info(
        { userId: storedToken.userId, appId, familyId: storedToken.familyId },
        'refresh token rotated',
      );

      return { access_token: accessToken, refresh_token: newRefreshToken };
    }
    // Replay attack - force re-login and revoke all tokens of the family
    else if (storedToken.replacedAt) {
      // We dont delete - just mark as revoked to have some trace in DB and for possible future analytics
      await this.refreshTokensRepository.update(
        {
          familyId: storedToken.familyId,
        },
        { isRevoked: true },
      );
      this.logger.warn(
        { userId: storedToken.userId, appId, familyId: storedToken.familyId },
        'refresh token replay detected, family revoked',
      );
      throw new HttpException('invalid_grant', HttpStatus.BAD_REQUEST);
    }
  }

  private async verifyPassword(
    plainTextPassword: string,
    hashedPassword: string,
  ) {
    const isPasswordMatching = await bcrypt.compare(
      plainTextPassword,
      hashedPassword,
    );

    if (!isPasswordMatching) {
      throw new HttpException(
        'Wrong credentials provided',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  private async verifyRedirectUri(redirectUri: string, appId: string) {
    const client = await this.clientsService.getByAppId(appId);
    if (!client) {
      throw new HttpException('Client not found', HttpStatus.BAD_REQUEST);
    }

    if (!client.redirectUris.includes(redirectUri)) {
      throw new HttpException('Invalid redirect URI', HttpStatus.BAD_REQUEST);
    }
  }

  public async createAuthCode(
    userId: number,
    appId: string,
    redirectUri: string,
  ) {
    const code = this.generateAuthCode();
    const authCode = this.authCodesRepository.create({
      userId,
      code,
      appId,
      redirectUri,
      expiresAt: new Date(Date.now() + this.AUTH_CODE_EXPIRATION), // 5 minutes expiration
    });

    await this.authCodesRepository.save(authCode);
    this.logger.info({ userId, appId }, 'auth code issued');
    return code;
  }

  public async exchangeAuthCode({
    authCode,
    appId,
    redirectUri,
  }: {
    authCode: string;
    appId: string;
    redirectUri: string;
  }) {
    const authCodeEntity = await this.authCodesRepository.findOne({
      where: { code: authCode, appId, redirectUri },
    });

    if (!authCodeEntity) {
      throw new HttpException('Invalid auth code', HttpStatus.UNAUTHORIZED);
    }

    if (authCodeEntity.expiresAt < new Date()) {
      throw new HttpException('Auth code expired', HttpStatus.UNAUTHORIZED);
    }

    // It should be a one-time use code, delete after use
    await this.authCodesRepository.delete({
      code: authCode,
      appId,
      redirectUri,
    });

    const payload: TokenPayload = {
      id: authCodeEntity.userId,
      type: 'user',
      aud: authCodeEntity.appId,
    };
    const accessToken = this.jwtService.sign(payload);

    const refreshToken = await this.createRefreshToken(
      authCodeEntity.userId,
      appId,
    );

    this.logger.info(
      { userId: authCodeEntity.userId, appId },
      'token exchanged',
    );

    return { access_token: accessToken, refresh_token: refreshToken };
  }

  public async createRefreshToken(
    userId: number,
    appId: string,
    // If provided that means we are rotating, if not then it's new family
    familyId?: string,
  ) {
    const token = this.generateRefreshToken();
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    const refreshToken = this.refreshTokensRepository.create({
      token: hashedToken,
      userId,
      appId,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days expiration
      familyId: familyId || crypto.randomBytes(20).toString('hex'), // Generate new family ID if not provided
      isRevoked: false,
    });

    await this.refreshTokensRepository.save(refreshToken);
    return token;
  }

  public async revokeFamily(refreshToken: string) {
    const hashedToken = crypto
      .createHash('sha256')
      .update(refreshToken)
      .digest('hex');

    const storedToken = await this.refreshTokensRepository.findOne({
      where: { token: hashedToken },
    });

    if (!storedToken) return;

    await this.refreshTokensRepository.update(
      { familyId: storedToken.familyId },
      { isRevoked: true },
    );
    this.logger.info(
      {
        userId: storedToken.userId,
        appId: storedToken.appId,
        familyId: storedToken.familyId,
      },
      'refresh token family revoked',
    );
  }

  // Not removing cause in future can be used with local auth
  // for user authenticating to their profile at mtas
  private getCookieWithJwtToken(userId: number, appId: string) {
    const payload: TokenPayload = { id: userId, type: 'user', aud: appId };
    const token = this.jwtService.sign(payload);

    return `Authentication=${token}; HttpOnly; Path=/; Max-Age=${this.configService.get('JWT_EXPIRATION_TIME')}; SameSite=Lax; Secure`;
  }

  private generateAuthCode(): string {
    return crypto.randomBytes(20).toString('hex');
  }

  private generateRefreshToken(): string {
    // Lives longer than auth code so more entropy - 32 bytes instead of 20
    return crypto.randomBytes(32).toString('hex');
  }

  @Cron(CronExpression.EVERY_12_HOURS)
  private async cleanUpExpiredAuthCodes() {
    await this.authCodesRepository.delete({
      expiresAt: LessThan(new Date()),
    });
    this.logger.info('expired auth codes cleaned up');
  }

  @Cron(CronExpression.EVERY_12_HOURS)
  private async cleanUpExpiredRefreshTokens() {
    await this.refreshTokensRepository.delete({
      expiresAt: LessThan(new Date()),
    });
    this.logger.info('expired refresh tokens cleaned up');
  }
}
