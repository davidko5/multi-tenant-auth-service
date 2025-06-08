import { Body, Controller, Param, Patch, UseGuards } from '@nestjs/common';
import { UserJwtAuthenticationGuard } from 'src/auth/guards/user-jwt-authentication.guard';
import { UsersService } from './users.service';
import UserUpdateRequestDto from 'src/auth/dto/user-update-request.dto';

@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @UseGuards(UserJwtAuthenticationGuard)
  @Patch(':id')
  updateClient(@Body() dto: UserUpdateRequestDto, @Param('id') id: string) {
    return this.usersService.update({
      id: parseInt(id),
      ...dto,
    });
  }
}
