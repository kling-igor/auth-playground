import { IsJWT, ValidateNested } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

import { UserData } from '../../common/social';

export class AppleSignupRequestDto {
  @ApiProperty({ description: 'Apple identityToken formely known as JWT' })
  @IsJWT()
  readonly identityToken: string;

  @ApiProperty({ description: 'user personal data' })
  @ValidateNested()
  readonly userData: UserData;
}
