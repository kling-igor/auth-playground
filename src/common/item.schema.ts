import { Schema } from 'mongoose';

export const ConfigItemSchema = new Schema(
  {
    name: String,
    uptime: Number,
    content: Object,
  },
  {
    autoIndex: process.env.NODE_ENV == 'development',
    versionKey: false,
  },
);
