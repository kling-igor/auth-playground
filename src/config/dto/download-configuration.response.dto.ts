import { IsNumber, IsString, IsArray, ValidateNested } from 'class-validator';
import { ApiResponseProperty } from '@nestjs/swagger';

import { UploadConfigurationRequestDto } from './upload-configuration.request.dto';

export class ConfigurationSlice extends UploadConfigurationRequestDto {
  @ApiResponseProperty()
  @IsNumber()
  readonly serverUptime: number;
}

export class DownloadConfigurationResponseDto {
  @IsArray()
  @ValidateNested()
  @ApiResponseProperty()
  readonly data: ConfigurationSlice[];

  @IsNumber()
  @ApiResponseProperty()
  readonly code: number;

  @IsString()
  @ApiResponseProperty()
  readonly message: string;
}
