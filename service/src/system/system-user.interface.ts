import { Document, Types } from 'mongoose'

export default interface SystemUser extends Document {
  _id: Types.ObjectId
  username?: string // 用户名
  password?: string // 密码(SHA1)
  realname?: string // 显示名称
  created_at?: Date // 创建时间
}
