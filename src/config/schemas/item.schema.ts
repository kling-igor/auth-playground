import { Schema } from 'mongoose';

export const ConfigItemSchema = new Schema({
  name: String,
  uptime: Number,
  createDoc: Number,
});
