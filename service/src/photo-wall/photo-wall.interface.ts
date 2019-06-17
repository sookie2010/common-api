import * as mongoose from 'mongoose';

export interface PhotoWall extends mongoose.Document {
  _id?: mongoose.Schema.Types.ObjectId
  name?: String
  md5?: String
  thumbnail?: String
  width?: number
  height?: number
  index?: number
}