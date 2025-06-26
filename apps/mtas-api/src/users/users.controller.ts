import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Request,
  UseGuards,
} from '@nestjs/common';
import { UserJwtAuthenticationGuard } from 'src/auth/guards/user-jwt-authentication.guard';
import { UsersService } from './users.service';
import UserUpdateRequestDto from 'src/auth/dto/user-update-request.dto';
import RequestWithUser from 'src/auth/types/request-with-user.interface';

@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @UseGuards(UserJwtAuthenticationGuard)
  @Get('')
  async getUsers(@Request() req: RequestWithUser) {
    const client = await this.usersService.getUserClient(req.user.id);
    return this.usersService.getAllClientUsers(client.id);
  }

  @UseGuards(UserJwtAuthenticationGuard)
  @Patch(':id')
  updateClient(@Body() dto: UserUpdateRequestDto, @Param('id') id: string) {
    return this.usersService.update({
      id: parseInt(id),
      ...dto,
    });
  }
}
