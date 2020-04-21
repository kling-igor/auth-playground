import { IsString, IsNotEmpty, MaxLength, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
export class SignUpUserRequestDto {
  @ApiProperty({ description: 'user login', example: 'jd@example.com' })
  @IsNotEmpty()
  @MaxLength(255)
  readonly login: string;

  @ApiProperty({ description: 'user password', example: 'supersecret' })
  @IsNotEmpty()
  @IsString()
  readonly password: string;

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
}
