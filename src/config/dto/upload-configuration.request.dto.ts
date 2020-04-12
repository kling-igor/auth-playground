import { IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UploadConfigurationRequestDto {
  @ApiProperty({ description: 'ES5 transpilled controllers' })
  @IsOptional()
  readonly controller?: any[];

  @ApiProperty({ description: 'Project files descriptions' })
  @IsOptional()
  readonly file?: any[];

  @ApiProperty({ description: 'Model schemas' })
  @IsOptional()
  readonly model?: any[];

  @ApiProperty({ description: 'Project printforms descriptions' })
  @IsOptional()
  readonly printform?: any[];

  @ApiProperty({ description: 'ES5 transpilled services' })
  @IsOptional()
  readonly service?: any[];

  @ApiProperty({ description: 'View styles' })
  @IsOptional()
  readonly style?: any[];

  @ApiProperty({ description: 'Localized strings' })
  @IsOptional()
  readonly translation?: any[];

  @ApiProperty({ description: 'View layouts' })
  @IsOptional()
  readonly view?: any[];
}
