import { Schema, Types } from 'mongoose'

export const ArticleSchema = new Schema({
  _id: Types.ObjectId,
  title: String,
  path: Array,
  categories: Array,
  tags: Array,
  create_date: Date,
  content: String,
  content_hash: String,
}, { collection: 'article', versionKey: false })

export const ArticleKeysSchema = new Schema({
  _id: Types.ObjectId,
  article_id: Types.ObjectId,
  keys: Array,
}, { collection: 'article_keys', versionKey: false })
