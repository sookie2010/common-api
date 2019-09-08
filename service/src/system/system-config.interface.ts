import { Document, Types } from 'mongoose'

export default interface SystemConfig extends Document {
  _id: Types.ObjectId
  name?: string // 配置项名称
  value?: object // 配置项值
  description?: string // 描述
  is_public?: boolean // 是否公开
  created_at?: Date // 创建时间
  updated_at?: Date // 更新时间
}
