import { Document, Types } from 'mongoose'

export interface BackgroundImgEntity {
  _id?: Types.ObjectId
  mime?: string // MIME类型
  hash?: string // 图片md5值
  size?: number // 图片大小
  created_at?: Date // 创建时间
  img?: Buffer // 图片二进制数据
}

export interface BackgroundImg extends Document, BackgroundImgEntity {
  _id: Types.ObjectId
}