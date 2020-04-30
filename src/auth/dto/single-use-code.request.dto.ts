import { IsString, IsNotEmpty, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SingleUseCodeRequestDto {
  @ApiProperty({ description: 'server generated single use code' })
  @IsNotEmpty()
  @IsString()
  @MaxLength(255)
  readonly code: string;
}
