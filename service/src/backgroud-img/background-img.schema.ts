import { Schema, Types } from 'mongoose'

export const BackgroundImgSchema = new Schema({
  _id: Types.ObjectId,
  mime: String,
  hash: String,
  size: Number,
  img: Buffer,
}, { collection: 'background_img', versionKey: false, timestamps: {createdAt: 'created_at'} })
