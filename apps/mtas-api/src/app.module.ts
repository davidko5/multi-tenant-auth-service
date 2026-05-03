import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { DatabaseModule } from './database/database.module';
import { ConfigModule } from '@nestjs/config';
import * as Joi from '@hapi/joi';
import { ScheduleModule } from '@nestjs/schedule';
import { ClientsModule } from './clients/clients.module';
import { CommonModule } from './common/common.module';
import { LoggerModule } from 'nestjs-pino';

@Module({
  imports: [
    LoggerModule.forRoot({
      pinoHttp: {
        transport:
          process.env.NODE_ENV !== 'production'
            ? {
                target: 'pino-pretty',
                options: { ignore: 'pid,hostname,req,res,responseTime' },
              }
            : undefined,
        redact: {
          paths: [
            'req.headers.authorization',
            'req.headers.cookie',
            '*.password',
            '*.access_token',
            '*.refresh_token',
            '*.refreshToken',
            '*.accessToken',
            '*.token',
          ],
          censor: '[REDACTED]',
        },
        customSuccessMessage: (req, res, responseTime) =>
          `${req.method} ${req.url} ${res.statusCode} ${responseTime}ms`,
        customErrorMessage: (req, res, err) =>
          `${req.method} ${req.url} ${res.statusCode} ${err.message}`,
      },
    }),
    AuthModule,
    UsersModule,
    DatabaseModule,
    ConfigModule.forRoot({
      validationSchema: Joi.object({
        POSTGRES_HOST: Joi.string().required(),
        POSTGRES_PORT: Joi.number().required(),
        POSTGRES_USER: Joi.string().required(),
        POSTGRES_PASSWORD: Joi.string().required(),
        POSTGRES_DB: Joi.string().required(),
        PORT: Joi.number(),
        JWT_SECRET: Joi.string().required(),
        JWT_EXPIRATION_TIME: Joi.string().required(),
        ALLOWED_UI_ORIGINS: Joi.string().required(),
        NODE_ENV: Joi.string()
          .valid('development', 'production')
          .default('development'),
        AUTH_CODE_EXPIRATION: Joi.number().default(5 * 60 * 1000),
      }),
    }),
    ScheduleModule.forRoot(),
    ClientsModule,
    CommonModule,
  ],
})
export class AppModule {}
