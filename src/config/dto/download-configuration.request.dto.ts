import { IsNumber, IsArray, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class DownloadConfigurationRequestDto {
  @IsArray()
  @ApiProperty({
    description: 'Array of collection names to be requested for new documents since specified uptime value',
  })
  readonly get: [string];

  @IsNumber()
  @Min(0)
  @ApiProperty({ description: 'Last synchronization uptime' })
  readonly uptime: number;
}
