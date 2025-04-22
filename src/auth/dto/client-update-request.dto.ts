import { IsOptional, IsString } from 'class-validator';

class ClientUpdateRequestDto {
  @IsString()
  @IsOptional()
  updatedAppId?: string;

  @IsString({ each: true })
  @IsOptional()
  updatedRedirectUris?: string[];
}

export default ClientUpdateRequestDto;
