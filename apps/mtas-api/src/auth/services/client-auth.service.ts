import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PostgresErrorCodes } from 'src/database/postgresErrorCodes.enum';
import { ConfigService } from '@nestjs/config';
import ClientRegisterRequestDto from '../dto/client-register-request.dto';
import { ClientsService } from 'src/clients/clients.service';
import { TokenPayload } from '../types/token-payload.interface';
import { v4 as uuidv4 } from 'uuid';

interface PostgresError extends Error {
  code?: string;
}

@Injectable()
export class ClientAuthService {
  constructor(
    private configService: ConfigService,
    private clientsService: ClientsService,
    private jwtService: JwtService,
  ) {}

  public async register(dto: ClientRegisterRequestDto) {
    const hashedPassword = await bcrypt.hash(dto.password, 10);

    try {
      const createdClient = await this.clientsService.create({
        ...dto,
        password: hashedPassword,
        appId: uuidv4(),
        redirectUris: [],
        createdAt: new Date(),
        users: [],
      });
      return { ...createdClient, password: undefined };
    } catch (error) {
      if (
        (error as PostgresError)?.code === PostgresErrorCodes.UniqueViolation
      ) {
        throw new HttpException(
          'Client with this email already exists',
          HttpStatus.BAD_REQUEST,
        );
      }
    }
    throw new HttpException(
      'Something went wrong',
      HttpStatus.INTERNAL_SERVER_ERROR,
    );
  }

  public async getAuthenticatedClient(
    email: string,
    plainTextPassword: string,
  ) {
    try {
      const client = await this.clientsService.getByEmail(email);
      await this.verifyPassword(plainTextPassword, client.password);
      return { ...client, password: undefined };
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

  public getCookieForLogOut() {
    return 'Authentication=; HttpOnly; Path=/; Max-Age=0';
  }

  public getCookieWithJwtToken(clientId: number) {
    const payload: TokenPayload = { id: clientId, type: 'client' };
    const token = this.jwtService.sign(payload);

    return `Authentication=${token}; HttpOnly; Path=/; Max-Age=${this.configService.get('JWT_EXPIRATION_TIME')}`;
  }
}
