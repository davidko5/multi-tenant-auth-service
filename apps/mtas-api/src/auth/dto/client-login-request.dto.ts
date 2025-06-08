import { IsEmail, IsString, MinLength } from 'class-validator';

class ClientLoginRequestDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(8)
  password: string;
}

export default ClientLoginRequestDto;
