import { IsOptional, IsString } from 'class-validator';

class UserUpdateRequestDto {
  @IsString()
  @IsOptional()
  updatedName?: string;
}

export default UserUpdateRequestDto;
