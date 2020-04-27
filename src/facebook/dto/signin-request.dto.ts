import { IsString, IsNotEmpty, MaxLength, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
export class FacebookSigninRequestDto {
  @ApiProperty({ description: 'Facebook access token' })
  @IsString()
  readonly accessToken: string;
}
