import { IsString, IsNotEmpty, IsEmail, MaxLength } from 'class-validator';

export class SignInUserDto {
  @IsNotEmpty()
  @MaxLength(255)
  @IsEmail()
  readonly email: string;

  @IsNotEmpty()
  @IsString()
  readonly password: string;
}
