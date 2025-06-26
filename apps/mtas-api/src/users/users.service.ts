import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import User from './user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { filterUndefined } from 'src/common/utils/filter-undefined';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
  ) {}

  async getById(id: number): Promise<User> {
    const user = await this.usersRepository.findOne({ where: { id } });
    if (user) {
      return user;
    }

    throw new HttpException('User not found', HttpStatus.NOT_FOUND);
  }

  async getByEmailAndApp(email: string, appId: string): Promise<User> {
    const user = await this.usersRepository.findOne({
      where: { email, client: { appId } },
    });
    if (user) {
      return user;
    }

    throw new HttpException('User not found', HttpStatus.NOT_FOUND);
  }

  async create(user: Omit<User, 'id'>): Promise<User> {
    const newUser = this.usersRepository.create(user);
    await this.usersRepository.save(newUser);
    return newUser;
  }

  async update(params: {
    id: number;
    updatedName?: string;
  }): Promise<Partial<User>> {
    const user = await this.getById(params.id);
    if (user) {
      const updates = filterUndefined({
        name: params.updatedName,
      });

      const updatedUser = await this.usersRepository.save({
        ...user,
        ...updates,
      });

      return {
        ...updatedUser,
        password: undefined,
        client: undefined,
      };
    }

    throw new HttpException('User not found', HttpStatus.NOT_FOUND);
  }

  async getUserClient(userId: number) {
    const user = await this.getById(userId);
    return user.client;
  }

  async getAllClientUsers(clientId: number) {
    const users = await this.usersRepository.find({
      where: { client: { id: clientId } },
    });
    return users.map((user) => ({
      ...user,
      password: undefined,
      client: undefined,
    }));
  }
}
