import * as mongoose from 'mongoose';

export interface SystemConfig extends mongoose.Document {
  _id?: mongoose.Schema.Types.ObjectId
  name?: String
  value?: Object
}