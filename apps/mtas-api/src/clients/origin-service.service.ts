import { Injectable } from '@nestjs/common';
import Client from './client.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { PinoLogger } from 'nestjs-pino';

@Injectable()
export class OriginServiceService {
  private origins = new Set<string>();

  constructor(
    @InjectRepository(Client)
    private readonly clientRepository: Repository<Client>,
    private readonly configService: ConfigService,
    private readonly logger: PinoLogger,
  ) {
    this.logger.setContext(OriginServiceService.name);
  }

  async load() {
    const clients = await this.clientRepository.find({
      select: ['redirectUris'],
    });
    const newOrigins = new Set<string>();

    clients.forEach((client) => {
      client.redirectUris.forEach((uri) => {
        try {
          const origin = new URL(uri).origin;
          newOrigins.add(origin);
        } catch {
          this.logger.warn({ uri }, 'invalid redirect URI in DB');
        }
      });
    });

    (this.configService.get('ALLOWED_UI_ORIGINS') as string)
      .split(',')
      .forEach((origin) => {
        newOrigins.add(origin.trim());
      });
    this.origins = newOrigins;
    this.logger.info({ origins: [...newOrigins] }, 'CORS origins loaded');
  }

  isAllowed(origin: string) {
    return this.origins.has(origin);
  }
}
