import { IsEmail, IsString, MinLength } from 'class-validator';

class UserLoginRequestDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(8)
  password: string;
}

export default UserLoginRequestDto;
