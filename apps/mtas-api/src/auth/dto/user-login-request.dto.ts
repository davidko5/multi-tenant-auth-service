import { IsEmail, IsString, IsUrl, MinLength } from 'class-validator';

class UserLoginRequestDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(8)
  password: string;

  @IsString()
  appId: string;

  @IsString()
  // require_tld: false to allow localhost
  @IsUrl({ require_tld: false })
  redirectUri: string;
}

export default UserLoginRequestDto;
