import { IsNotEmpty, IsString } from 'class-validator';

class UserTokenRefreshRequestDto {
  @IsNotEmpty()
  @IsString()
  refreshToken: string;
}

export default UserTokenRefreshRequestDto;
