import * as mongoose from 'mongoose';

export const SystemConfigSchema = new mongoose.Schema({
  _id: mongoose.Schema.Types.ObjectId,
  name: String,
  value: Object
}, { collection: 'system_config', versionKey: false });