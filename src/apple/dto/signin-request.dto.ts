import { IsJWT } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
export class AppleSigninRequestDto {
  @ApiProperty({ description: 'Apple identityToken formely known as JWT' })
  @IsJWT()
  readonly identityToken: string;
}
