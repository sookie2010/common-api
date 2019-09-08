import { Schema, Types } from 'mongoose'

export const PhotoWallSchema = new Schema({
  _id: { type: Types.ObjectId, default: new Types.ObjectId()},
  name: String,
  md5: String,
  thumbnail: String,
  width: Number,
  height: Number,
  index: Number,
}, { collection: 'photo_wall', versionKey: false })
