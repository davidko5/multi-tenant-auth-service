import { Module } from '@nestjs/common';
import { UserAuthController } from './controllers/user-auth.controller';
import { UserAuthService } from './services/user-auth.service';
import { UsersModule } from 'src/users/users.module';
import { JwtService } from '@nestjs/jwt';
import { ClientLocalStrategy } from './strategies/client-local.strategy';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthCode } from './auth-code.entity';
import { ClientAuthController } from './controllers/client-auth.controller';
import { ClientAuthService } from './services/client-auth.service';
import { ClientsModule } from 'src/clients/clients.module';
import { UserJwtStrategy } from './strategies/user-jwt.strategy';
import { UserLocalStrategy } from './strategies/user-local.strategy';
import { ClientJwtStrategy } from './strategies/client-jwt.strategy';
import { readFileSync } from 'fs';
import { join } from 'path';
import { JwksController } from './controllers/jwks.controller';
@Module({
  imports: [
    UsersModule,
    ClientsModule,
    ConfigModule,
    PassportModule,
    TypeOrmModule.forFeature([AuthCode]),
  ],
  controllers: [UserAuthController, ClientAuthController, JwksController],
  providers: [
    UserAuthService,
    ClientAuthService,
    ClientLocalStrategy,
    UserLocalStrategy,
    UserJwtStrategy,
    ClientJwtStrategy,
    // user jwt service
    {
      provide: 'USER_JWT_SERVICE',
      useFactory: (configService: ConfigService) => {
        const privateKey =
          configService.get<string>('JWT_PRIVATE_KEY') ||
          readFileSync(join(__dirname, '../../private.pem'), 'utf8');
        const publicKey =
          configService.get<string>('JWT_PUBLIC_KEY') ||
          readFileSync(join(__dirname, '../../public.pem'), 'utf8');
        const expiresIn = `${configService.get<number>('JWT_EXPIRATION_TIME')}s`;

        return new JwtService({
          privateKey,
          publicKey,
          signOptions: { algorithm: 'RS256', expiresIn, keyid: 'v1' },
        });
      },
      inject: [ConfigService],
    },
    // client jwt service
    {
      provide: 'CLIENT_JWT_SERVICE',
      useFactory: (configService: ConfigService) => {
        const secret = configService.get<string>('JWT_SECRET');
        const expiresIn = `${configService.get<number>('JWT_EXPIRATION_TIME')}s`;

        return new JwtService({
          secret,
          signOptions: { algorithm: 'HS256', expiresIn },
        });
      },
      inject: [ConfigService],
    },
  ],
})
export class AuthModule {}
