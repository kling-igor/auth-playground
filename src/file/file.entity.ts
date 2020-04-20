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

@Entity({ name: 'users' })
export class UserEntity {
  // id файла в формате uuid
  @PrimaryGeneratedColumn({ type: 'uuid', name: 'file_id' })
  fileId: string;

  // хэш файла по алгоритму sha1
  @Column({ type: 'varchar', length: 40, name: 'file_hash' })
  fileHash: string;

  // тип файла / расширение
  @Column({ type: 'varchar', length: 100, name: 'file_type' })
  fileType: string;

  // оригинальное название файла
  @Column({ type: 'varchar', length: 255 })
  filename: string;

  // id пользователя загрузившего файл
  @Column({ type: 'uuid', name: 'user_id' })
  userId: string;

  // статус загрузки (результат)
  @Column({ type: 'varchar', length: 15, name: 'upload_status' })
  uploadStatus: string;

  // дата загрузки
  @CreateDateColumn({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP', name: 'upload_date' })
  uploadDate: Date;

  // токен проекта
  @Column({ type: 'varchar', length: 50 })
  project: string;

  // флаг, обозначающий файл статичным
  @Column({ type: 'boolean', default: true })
  static: boolean;
}
