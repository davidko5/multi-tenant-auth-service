import { Module } from '@nestjs/common';
import { ClientsService } from './clients.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClientsController } from './clients.controller';
import Client from './client.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Client])],
  providers: [ClientsService],
  exports: [ClientsService],
  controllers: [ClientsController],
})
export class ClientsModule {}
