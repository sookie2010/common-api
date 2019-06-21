import { Schema, Document } from 'mongoose'

export default interface SystemUser extends Document {
  _id?: Schema.Types.ObjectId
  username?: String // 用户名
  password?: String // 密码(SHA1)
  realname?: String // 显示名称
}