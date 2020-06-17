import { Schema, Types } from 'mongoose'

export const SystemRoleSchema = new Schema({
  _id: Types.ObjectId,
  name: String,
  description: String,
  methods: Array,
  include_uri: Array,
  exclude_uri: Array,
}, { collection: 'system_role', versionKey: false, timestamps: {createdAt: 'created_at', updatedAt: 'updated_at'} })
