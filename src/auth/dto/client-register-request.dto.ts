import { IsEmail, IsString, MinLength } from 'class-validator';

class ClientRegisterRequestDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(8)
  password: string;
}

export default ClientRegisterRequestDto;
