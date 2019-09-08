import { Schema, Types } from 'mongoose'

export const SystemUserSchema = new Schema({
  _id: Types.ObjectId,
  username: String,
  password: String,
  realname: String,
}, { collection: 'system_user', versionKey: false, timestamps: {createdAt: 'created_at', updatedAt: 'updated_at'} })
