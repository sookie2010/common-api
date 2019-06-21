import { Schema, Document } from 'mongoose'

export default interface SystemUser extends Document {
  _id?: Schema.Types.ObjectId
  username?: string // 用户名
  password?: string // 密码(SHA1)
  realname?: string // 显示名称
}
