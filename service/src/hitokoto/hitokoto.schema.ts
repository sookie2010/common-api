import * as mongoose from 'mongoose';

export const HitokotoSchema = new mongoose.Schema({
  _id: mongoose.Types.ObjectId,
  hitokoto: String,
  type: String,
  from: String,
  creator: String,
  created_at: Date,
  number: Number,
}, { collection: 'hitokoto', versionKey: false });