import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

class ClientUpdateRequestDto {
  @IsString()
  @IsOptional()
  @IsNotEmpty()
  updatedAppId?: string;

  @IsString({ each: true })
  @IsOptional()
  updatedRedirectUris?: string[];
}

export default ClientUpdateRequestDto;
