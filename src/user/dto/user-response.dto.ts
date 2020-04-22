import { ApiProperty } from '@nestjs/swagger';

export class UserResponseDto {
  @ApiProperty({ description: 'user login', example: 'jd@example.com' })
  readonly login: string;

  @ApiProperty({ description: 'user first name', example: 'John' })
  readonly firstName: string;

  @ApiProperty({ description: 'user middle name' })
  readonly middleName?: string;

  @ApiProperty({ description: 'user last name', example: 'Dow' })
  readonly lastName: string;

  @ApiProperty({ description: 'user roles', example: "['admin']" })
  readonly roles: string[];
}
