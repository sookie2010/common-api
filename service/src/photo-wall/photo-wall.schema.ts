import * as mongoose from 'mongoose';

export const PhotoWallSchema = new mongoose.Schema({
  _id: mongoose.Schema.Types.ObjectId,
  name: String,
  md5: String,
  thumbnail: String,
  width: Number,
  height: Number,
}, { collection: 'photo_wall', versionKey: false });