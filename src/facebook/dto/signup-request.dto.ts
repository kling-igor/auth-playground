import { IsString, ValidateNested } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

import { UserData } from '../../common/social';

export class FacebookSignupRequestDto {
  @ApiProperty({ description: 'Facebook access token' })
  @IsString()
  readonly accessToken: string;

  @ApiProperty({ description: 'user personal data' })
  @ValidateNested()
  readonly userData: UserData;
}
