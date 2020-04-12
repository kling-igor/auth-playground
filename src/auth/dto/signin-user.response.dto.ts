import { ApiProperty } from '@nestjs/swagger';

export class SignInUserResponseDto {
  @ApiProperty({ description: 'user email', example: 'jd@example.com' })
  readonly email: string;

  @ApiProperty({
    description: 'JSON Web Token',
    example:
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpYXQiOjE1ODUwNDk5MzUsImV4cCI6MTU4NTA0OTk5NX0.7sycWpnBeW44SkS6zyHqITCFmKsrBDB-qHcdTYwWhBY',
  })
  readonly jwt: string;

  @ApiProperty({ description: 'refresh token', example: '6ddd129d2d8c4049b114b2d139cc7fae' })
  readonly refreshToken: string;
}
