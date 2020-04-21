import { IsString, IsNotEmpty, MaxLength, MinLength, IsOptional, IsDate } from 'class-validator';

export class CreateUserDto {
  @IsNotEmpty()
  @MaxLength(255)
  readonly login: string;

  @IsNotEmpty()
  @IsString()
  readonly password: string;

  @IsNotEmpty()
  @IsString()
  @MinLength(2)
  @MaxLength(255)
  readonly firstName: string;

  @IsNotEmpty()
  @IsString()
  @MinLength(2)
  @MaxLength(255)
  @IsOptional()
  readonly middleName?: string;

  @IsNotEmpty()
  @IsString()
  @MinLength(2)
  @MaxLength(255)
  readonly lastName: string;

  @IsNotEmpty()
  @IsString()
  readonly refreshToken: string;

  @IsNotEmpty()
  @IsDate()
  readonly expirationDate: Date;
}
