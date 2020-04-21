import { IsString, IsNotEmpty, IsEmail, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SignInUserRequestDto {
  @ApiProperty({ description: 'user login', example: 'jd@example.com' })
  @IsNotEmpty()
  @MaxLength(255)
  readonly login: string;

  @ApiProperty({ description: 'user password', example: 'supersecret' })
  @IsNotEmpty()
  @IsString()
  readonly password: string;
}
