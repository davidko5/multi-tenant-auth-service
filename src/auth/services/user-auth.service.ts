import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { UsersService } from '../../users/users.service';
import { JwtService } from '@nestjs/jwt';
import UserRegisterRequestDto from '../dto/user-register-request.dto';
import * as bcrypt from 'bcrypt';
import { PostgresErrorCodes } from 'src/database/postgresErrorCodes.enum';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';
import { InjectRepository } from '@nestjs/typeorm';
import { AuthCode } from '../auth-code.entity';
import { LessThan, Repository } from 'typeorm';
import { Cron, CronExpression } from '@nestjs/schedule';
import { UserTokenPayload } from '../types/user-token-payload.interface';
import { ClientsService } from 'src/clients/clients.service';

interface PostgresError extends Error {
  code?: string;
}

const AUTH_CODE_EXPIRATION = 5 * 60 * 1000;

@Injectable()
export class UserAuthService {
  constructor(
    private configService: ConfigService,
    private usersService: UsersService,
    private clientsService: ClientsService,
    private jwtService: JwtService,
    @InjectRepository(AuthCode)
    private readonly authCodesRepository: Repository<AuthCode>,
  ) {}

  public async register(dto: UserRegisterRequestDto) {
    const hashedPassword = await bcrypt.hash(dto.password, 10);

    try {
      const client = await this.clientsService.getByAppId(dto.appId);
      if (!client) {
        throw new HttpException('Client not found', HttpStatus.BAD_REQUEST);
      }

      console.log(dto.appId, client);

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

      return { ...user, password: undefined };
    } catch {
      throw new HttpException(
        'Wrong credentials or client mismatch',
        HttpStatus.BAD_REQUEST,
      );
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

  public getCookieForLogOut() {
    return 'Authentication=; HttpOnly; Path=/; Max-Age=0';
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
      expiresAt: new Date(Date.now() + AUTH_CODE_EXPIRATION), // 5 minutes expiration
    });

    await this.authCodesRepository.save(authCode);
    return code;
  }

  public async exchangeAuthCodeForToken({
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

    return this.getCookieWithJwtToken(authCodeEntity.userId);
  }

  @Cron(CronExpression.EVERY_12_HOURS)
  private async cleanUpExpiredAuthCodes() {
    await this.authCodesRepository.delete({
      expiresAt: LessThan(new Date()),
    });
    console.log('Expired auth codes cleaned up');
  }

  private getCookieWithJwtToken(userId: number) {
    const payload: UserTokenPayload = { userId };
    const token = this.jwtService.sign(payload);

    return `Authentication=${token}; HttpOnly; Path=/; Max-Age=${this.configService.get('JWT_EXPIRATION_TIME')}`;
  }

  private generateAuthCode(): string {
    return crypto.randomBytes(20).toString('hex');
  }
}
