import { Schema } from 'mongoose'

export const BackgroundImgSchema = new Schema({
  _id: Schema.Types.ObjectId,
  mime: String,
  hash: String,
  size: Number,
  created_at: Date,
  img: Buffer
}, { collection: 'background_img', versionKey: false })
