import { Document, Types } from 'mongoose'

export interface SourceImageEntity {
  _id?: Types.ObjectId
  mime?: string // MIME类型
  hash?: string // 图片md5值
  size?: number // 图片大小
  label?: string[] // 图片标签
  img?: Buffer // 图片二进制数据
}

export interface SourceImage extends Document, SourceImageEntity {
  _id: Types.ObjectId
}
