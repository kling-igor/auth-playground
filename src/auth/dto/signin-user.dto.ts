import { IsString, IsNotEmpty, IsEmail, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SignInUserDto {
  @ApiProperty({ description: 'user email', example: 'jd@example.com' })
  @IsNotEmpty()
  @MaxLength(255)
  @IsEmail()
  readonly email: string;

  @ApiProperty({ description: 'user password', example: 'supersecret' })
  @IsNotEmpty()
  @IsString()
  readonly password: string;
}
