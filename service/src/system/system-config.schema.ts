import { Schema, Types } from 'mongoose';

export const SystemConfigSchema = new Schema({
  _id: { type: Types.ObjectId, default: new Types.ObjectId()},
  name: String,
  value: Object,
  description: String,
  is_public: Boolean,
}, { collection: 'system_config', versionKey: false })
