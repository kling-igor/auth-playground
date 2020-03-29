/* eslint-disable @typescript-eslint/camelcase */
import { Schema } from 'mongoose';

// The export model pattern is limited because you can only use one connection.
export const FileSchema = new Schema({
  // id файла в формате uuid
  file_id: String,

  // хэш файла по алгоритму sha1
  file_hash: String,

  // тип файла / расширение
  file_type: String,

  // оригинальное название файла
  filename: String,

  // id пользователя загрузившего файл
  user_id: String,

  // статус загрузки (результат)
  upload_status: String,

  // дата загрузки
  upload_date: Date,

  // токен проекта
  project: String,

  // флаг, обозначающий файл статичным
  static: Boolean,
});
