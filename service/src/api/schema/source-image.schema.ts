import { Schema, Types } from 'mongoose'

export const SourceImageSchema = new Schema({
  _id: Types.ObjectId,
  mime: String,
  hash: String,
  size: Number,
  label: Array,
  img: Buffer,
}, { collection: 'source_image', versionKey: false, timestamps: {createdAt: 'created_at', updatedAt: false} })
