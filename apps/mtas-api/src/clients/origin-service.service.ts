import { Injectable } from '@nestjs/common';
import Client from './client.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class OriginServiceService {
  private origins = new Set<string>();

  constructor(
    @InjectRepository(Client)
    private readonly clientRepository: Repository<Client>,
    private readonly configService: ConfigService,
  ) {}

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
          console.error(`Invalid URI in DB: ${uri}`);
        }
      });
    });

    (this.configService.get('ALLOWED_UI_ORIGINS') as string)
      .split(',')
      .forEach((origin) => {
        newOrigins.add(origin);
      });
    this.origins = newOrigins;
    console.log(this.origins);
  }

  isAllowed(origin: string) {
    return this.origins.has(origin);
  }
}
