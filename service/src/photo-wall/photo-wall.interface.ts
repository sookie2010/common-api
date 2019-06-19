import { Schema, Document } from 'mongoose';

export interface PhotoWall extends Document {
  _id?: Schema.Types.ObjectId
  name?: String
  md5?: String
  thumbnail?: String
  width?: number
  height?: number
  index?: number
}