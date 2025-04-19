import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import Client from './client.entity';
import { InjectRepository } from '@nestjs/typeorm';

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

  async create(client: Omit<Client, 'id'>): Promise<Client> {
    const newClient = this.clientRepository.create(client);
    await this.clientRepository.save(newClient);
    return newClient;
  }
}
