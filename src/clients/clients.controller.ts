import { Body, Controller, Param, Patch, UseGuards } from '@nestjs/common';
import { ClientsService } from './clients.service';
import ClientUpdateRequestDto from 'src/auth/dto/client-update-request.dto';
import { UserJwtAuthenticationGuard } from 'src/auth/guards/user-jwt-authentication.guard';

@Controller('clients')
export class ClientsController {
  constructor(private clientsService: ClientsService) {}

  @UseGuards(UserJwtAuthenticationGuard)
  @Patch('update/:id')
  updateClient(@Body() dto: ClientUpdateRequestDto, @Param('id') id: string) {
    return this.clientsService.update({
      id: parseInt(id),
      ...dto,
    });
  }
}
