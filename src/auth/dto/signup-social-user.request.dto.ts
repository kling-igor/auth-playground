import { IsString, IsNotEmpty, MaxLength, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
export class SignUpSocialUserRequestDto {
  @ApiProperty({ description: 'user login', example: 'jd@example.com' })
  @IsNotEmpty()
  @MaxLength(255)
  readonly login: string;

  @ApiProperty({ description: 'user first name', example: 'John' })
  @IsNotEmpty()
  @IsString()
  @MinLength(2)
  @MaxLength(255)
  readonly firstName: string;

  @ApiProperty({ description: 'user last name', example: 'Dow' })
  @IsNotEmpty()
  @IsString()
  @MinLength(2)
  @MaxLength(255)
  readonly lastName: string;

  @ApiProperty({ description: 'social network ', example: 'google' })
  @IsNotEmpty()
  @IsString()
  @MinLength(2)
  @MaxLength(255)
  readonly socialNetwork: string;

  @ApiProperty({ description: 'user id in social network', example: '123456789' })
  @IsNotEmpty()
  @IsString()
  @MinLength(2)
  @MaxLength(255)
  readonly socialId: string;
}
