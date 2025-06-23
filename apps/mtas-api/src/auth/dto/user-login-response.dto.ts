import { IsString } from 'class-validator';

class UserLoginResponseDto {
  @IsString()
  authCode: string;

  constructor(authCode: string) {
    this.authCode = authCode;
  }
}

export default UserLoginResponseDto;
