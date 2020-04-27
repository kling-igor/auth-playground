import { IsJWT, ValidateNested } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

import { UserData } from '../../common/social';

export class GoogleSignupRequestDto {
  @ApiProperty({ description: 'Google tokenId formely known as JWT' })
  @IsJWT()
  readonly tokenId: string;

  @ApiProperty({ description: 'user personal data' })
  @ValidateNested()
  readonly userData: UserData;
}
