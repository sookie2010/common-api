import * as mongoose from 'mongoose';

export const HitokotoSchema = new mongoose.Schema({
  _id: mongoose.Schema.Types.ObjectId,
  hitokoto: String,
  type: String,
  from: String,
  creator: String,
  created_at: Date,
  number: Number,
}, { collection: 'hitokoto' });