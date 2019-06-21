import { Schema } from 'mongoose';

export const SystemConfigSchema = new Schema({
  _id: Schema.Types.ObjectId,
  name: String,
  value: Object
}, { collection: 'system_config', versionKey: false })