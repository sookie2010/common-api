import { Schema, Types } from 'mongoose'

export const ProvinceSchema = new Schema({
  _id: Types.ObjectId,
  code: String,
  name: String,
  province: String,
  city: String,
  area: String,
  town: String,
}, { collection: 'province', versionKey: false })
