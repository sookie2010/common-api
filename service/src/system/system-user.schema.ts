import { Schema } from 'mongoose'

export const SystemUserSchema = new Schema({
  _id: Schema.Types.ObjectId,
  username: String,
  password: String,
  realname: String,
  created_at: Date,
}, { collection: 'system_user', versionKey: false })
