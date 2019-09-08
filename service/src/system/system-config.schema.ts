import { Schema, Types } from 'mongoose';

export const SystemConfigSchema = new Schema({
  _id: Types.ObjectId,
  name: String,
  value: Object,
  description: String,
  is_public: Boolean,
}, { collection: 'system_config', versionKey: false, timestamps: {createdAt: 'created_at', updatedAt: 'updated_at'} })
