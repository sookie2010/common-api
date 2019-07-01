import { Schema } from 'mongoose'

export const ArticleSchema = new Schema({
  _id: Schema.Types.ObjectId,
  title: String,
  path: String,
  categories: Array,
  tags: Array,
  create_date: Date,
  content: String,
  content_hash: String,
}, { collection: 'article', versionKey: false })

export const ArticleKeysSchema = new Schema({
  _id: Schema.Types.ObjectId,
  article_id: Schema.Types.ObjectId,
  keys: Array,
}, { collection: 'article_keys', versionKey: false })
