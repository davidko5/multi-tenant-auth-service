import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

class UserRegisterRequestDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  appId: string;

  @IsEmail()
  email: string;

  @IsString()
  @MinLength(8)
  password: string;
}

export default UserRegisterRequestDto;
