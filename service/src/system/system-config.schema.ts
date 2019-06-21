import { Schema } from 'mongoose';

export const SystemConfigSchema = new Schema({
  _id: Schema.Types.ObjectId,
  name: String,
  value: Object,
  description: String,
}, { collection: 'system_config', versionKey: false })
