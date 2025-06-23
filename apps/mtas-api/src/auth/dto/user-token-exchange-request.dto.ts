import { IsNotEmpty, IsString, IsUrl } from 'class-validator';

class UserTokenExchangeRequestDto {
  @IsNotEmpty()
  @IsString()
  authCode: string;

  @IsNotEmpty()
  @IsString()
  appId: string;

  @IsNotEmpty()
  // require_tld: false to allow localhost
  @IsUrl({ require_tld: false })
  redirectUri: string;
}

export default UserTokenExchangeRequestDto;
