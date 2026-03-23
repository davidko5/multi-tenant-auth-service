import { IsNotEmpty, IsString } from 'class-validator';

class UserTokenRefreshRequestDto {
  @IsNotEmpty()
  @IsString()
  refreshToken: string;

  @IsNotEmpty()
  @IsString()
  appId: string;
}

export default UserTokenRefreshRequestDto;
