import { Document, Schema } from 'mongoose';

export interface SystemConfig extends Document {
  _id?: Schema.Types.ObjectId
  name?: String
  value?: Object
}