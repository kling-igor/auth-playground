import { Schema } from 'mongoose';

// The export model pattern is limited because you can only use one connection.
export const ConfigItemSchema = new Schema({
  name: String,
  uptime: Number,
  createDoc: Number,
});
