import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import Client from './client.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { filterUndefined } from 'src/common/utils/filter-undefined';

@Injectable()
export class ClientsService {
  constructor(
    @InjectRepository(Client)
    private readonly clientRepository: Repository<Client>,
  ) {}

  async getById(id: number): Promise<Client> {
    const client = await this.clientRepository.findOne({ where: { id } });
    if (client) {
      return client;
    }

    throw new HttpException('Client not found', HttpStatus.NOT_FOUND);
  }

  async getByEmail(email: string): Promise<Client> {
    const client = await this.clientRepository.findOne({
      where: { email },
    });
    if (client) {
      return client;
    }

    throw new HttpException('Client not found', HttpStatus.NOT_FOUND);
  }

  async getByAppId(appId: string): Promise<Client> {
    const client = await this.clientRepository.findOne({ where: { appId } });
    if (client) {
      return client;
    }

    throw new HttpException('Client not found', HttpStatus.NOT_FOUND);
  }

  async create(client: Omit<Client, 'id'>): Promise<Client> {
    const newClient = this.clientRepository.create(client);
    await this.clientRepository.save(newClient);
    return newClient;
  }

  async update(params: {
    id: number;
    updatedAppId?: string;
    updatedRedirectUris?: string[];
  }): Promise<Client> {
    const client = await this.getById(params.id);
    if (client) {
      const updates = filterUndefined({
        appId: params.updatedAppId,
        redirectUris: params.updatedRedirectUris,
      });

      return this.clientRepository.save({
        ...client,
        ...updates,
      });
    }

    throw new HttpException('Client not found', HttpStatus.NOT_FOUND);
  }
}
