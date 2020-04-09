import { ApiResponseProperty, ApiProperty } from '@nestjs/swagger';
import { IsObject, IsString, ValidateNested, IsInt } from 'class-validator';
import { Exclude, Expose } from 'class-transformer';

export class FileUploadStatus {
  @ApiResponseProperty()
  @IsString()
  public id: string;

  @ApiResponseProperty()
  @IsInt()
  public code: number;

  @ApiResponseProperty()
  @IsString()
  public message: string;
}

@Expose()
export class FileUploadResponseDto {
  @ApiResponseProperty()
  public code: number;

  @ApiResponseProperty()
  public message: string;

  @IsObject()
  // @ApiResponseProperty({ type: [FileUploadStatus] })
  @ApiResponseProperty()
  public data: Record<string, FileUploadStatus>; //FileUploadStatus[];
}
