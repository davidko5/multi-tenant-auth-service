import { IsNotEmpty, IsString, IsUrl } from 'class-validator';

class UserTokenExchangeRequestDto {
  @IsNotEmpty()
  @IsString()
  authCode: string;

  @IsNotEmpty()
  @IsString()
  appId: string;

  @IsNotEmpty()
  @IsUrl()
  redirectUri: string;
}

export default UserTokenExchangeRequestDto;
