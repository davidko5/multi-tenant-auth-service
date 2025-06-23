import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as cookieParser from 'cookie-parser';
import { ValidationPipe } from '@nestjs/common';
import { OriginServiceService } from './clients/origin-service.service';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.use(cookieParser());

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
      forbidUnknownValues: true,
    }),
  );

  const originSvc = app.get(OriginServiceService);
  await originSvc.load();

  app.enableCors({
    origin: (
      incomingOrigin: string | undefined,
      callback: (err: Error | null, allowed?: boolean) => void,
    ) => {
      // Allow server-to-server or tools when origin is undefined
      if (!incomingOrigin || originSvc.isAllowed(incomingOrigin)) {
        callback(null, true);
      } else {
        callback(
          new Error(`CORS policy: origin ${incomingOrigin} not allowed`),
          false,
        );
      }
    },
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
