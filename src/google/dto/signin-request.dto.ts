import { IsJWT } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
export class GoogleSigninRequestDto {
  @ApiProperty({ description: 'Google tokenId formely known as JWT' })
  @IsJWT()
  readonly tokenId: string;
}
