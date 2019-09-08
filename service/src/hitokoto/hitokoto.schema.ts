import { Schema, Types } from 'mongoose'

export const HitokotoSchema = new Schema({
  _id: Types.ObjectId,
  hitokoto: String,
  type: String,
  from: String,
  creator: String,
  number: Number,
}, { collection: 'hitokoto', versionKey: false, timestamps: {createdAt: 'created_at'} })
