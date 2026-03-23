import { IsNotEmpty, IsString } from 'class-validator';

class UserRefreshTokenRevokeRequestDto {
  @IsString()
  @IsNotEmpty()
  refreshToken: string;
}

export default UserRefreshTokenRevokeRequestDto;
