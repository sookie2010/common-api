import { Schema, Document } from 'mongoose';

export interface SystemUser extends Document {
  _id?: Schema.Types.ObjectId
  username?: String
  password?: String
  realname?: String
}