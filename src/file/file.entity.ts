import {
  Column,
  Entity,
  CreateDateColumn,
  JoinColumn,
  ManyToMany,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity({ name: 'file_statistic' })
export class File {
  // id файла в формате uuid
  @PrimaryGeneratedColumn('uuid', { name: 'file_id' })
  public fileId: string;

  // хэш файла по алгоритму sha1
  @Column({ type: 'varchar', length: 40, name: 'file_hash' })
  public fileHash: string;

  // тип файла / расширение
  @Column({ type: 'varchar', length: 100, name: 'file_type' })
  public fileType: string;

  // оригинальное название файла
  @Column({ type: 'varchar', length: 255 })
  public filename: string;

  // id пользователя загрузившего файл
  @Column({ type: 'uuid', name: 'user_id' })
  public userId: string;

  // статус загрузки (результат)
  @Column({ type: 'varchar', length: 15, name: 'upload_status' })
  public uploadStatus: string;

  // дата загрузки
  @CreateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', name: 'upload_date' })
  public uploadDate: Date;

  // токен проекта
  @Column({ type: 'varchar', length: 50 })
  public project: string;

  // флаг, обозначающий файл статичным
  @Column({ type: 'boolean', default: true })
  public static: boolean;
}
