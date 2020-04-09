import { IsUUID, IsHash, IsIn, IsBoolean, IsString } from 'class-validator';
import { Expose } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

@Expose()
export class FileInfoCreateDto {
  @IsString()
  @IsUUID('4')
  @ApiProperty({ description: 'Идентификатор загружаемого файла' })
  public id: string;

  @IsString()
  @IsHash('sha1')
  @ApiProperty({ description: 'SHA1 содержимого файла' })
  public hash: string;

  @IsString()
  @ApiProperty({ description: 'Оригинальное имя файла (без расширения)' })
  public name: string;

  @IsString()
  @ApiProperty({ description: 'Расширение файла или MIME' })
  public type: string;

  @IsIn(['binary', 'base64'])
  @ApiProperty({ description: 'Кодирование', enum: ['binary', 'base64'] })
  public encoding: string;

  @IsBoolean()
  @ApiProperty({ description: 'Будет ли файл доступен для скачивания как статический контент без авторизации' })
  public static: boolean;
}
