import { Document } from 'mongoose';

export interface File extends Document {
  readonly file_id: string;
  readonly file_hash: string;
  readonly file_type: string;
  readonly filename: string;
  readonly user_id: string;
  readonly upload_status: string;
  readonly upload_date: Date;
  readonly project: string;
  readonly static: boolean;
}
