import { Module } from '@nestjs/common';
import { UserAuthController } from './controllers/user-auth.controller';
import { UserAuthService } from './services/user-auth.service';
import { UsersModule } from 'src/users/users.module';
import { JwtModule } from '@nestjs/jwt';
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
@Module({
  imports: [
    UsersModule,
    ClientsModule,
    ConfigModule,
    PassportModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get('JWT_SECRET'),
        signOptions: {
          expiresIn: `${configService.get('JWT_EXPIRATION_TIME')}s`,
        },
      }),
    }),
    TypeOrmModule.forFeature([AuthCode]),
  ],
  controllers: [UserAuthController, ClientAuthController],
  providers: [
    UserAuthService,
    ClientAuthService,
    ClientLocalStrategy,
    UserLocalStrategy,
    UserJwtStrategy,
    ClientJwtStrategy,
  ],
})
export class AuthModule {}
