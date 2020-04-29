import { IsString, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UserData {
  @ApiProperty({ description: 'user login' })
  @IsString()
  readonly login: string;

  @ApiProperty({ description: 'user first name' })
  @IsString()
  readonly first_name: string;

  @ApiProperty({ description: 'user last' })
  @IsString()
  readonly last_name: string;

  @ApiProperty({ description: 'user middle name' })
  @IsString()
  @IsOptional()
  readonly middle_name?: string;
}

export class InsufficientCredentialsError extends Error {
  email;
  firstName;
  lastName;

  constructor(firstName = '', lastName = '', email = '') {
    super('Missing credentials');
    this.name = this.constructor.name;
    if (typeof Error.captureStackTrace === 'function') {
      Error.captureStackTrace(this, InsufficientCredentialsError);
    } else {
      this.stack = new Error('Missing credentials').stack;
    }

    this.email = email;
    this.firstName = firstName;
    this.lastName = lastName;
  }
}
