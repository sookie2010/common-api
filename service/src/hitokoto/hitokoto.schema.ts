import { Schema } from 'mongoose';

export const HitokotoSchema = new Schema({
  _id: Schema.Types.ObjectId,
  hitokoto: String,
  type: String,
  from: String,
  creator: String,
  created_at: Date,
  number: Number,
}, { collection: 'hitokoto', versionKey: false });