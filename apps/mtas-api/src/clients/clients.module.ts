import { Module } from '@nestjs/common';
import { ClientsService } from './clients.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClientsController } from './clients.controller';
import { OriginServiceService } from './origin-service.service';
import Client from './client.entity';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [TypeOrmModule.forFeature([Client]), ConfigModule],
  providers: [ClientsService, OriginServiceService],
  exports: [ClientsService, OriginServiceService],
  controllers: [ClientsController],
})
export class ClientsModule {}
