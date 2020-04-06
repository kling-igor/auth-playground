import { Schema } from 'mongoose';

// The export model pattern is limited because you can only use one connection.
export const ConfigItemSchema = new Schema(
  {
    name: String,
    uptime: Number,
    content: Object,
  },
  {
    autoIndex: process.env.NODE_ENV == 'development',
  },
);
