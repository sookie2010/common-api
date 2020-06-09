import { Document, Types } from 'mongoose'
import { IsNotEmpty, Length, Matches } from 'class-validator'

export class SystemUserEntity {
  _id: Types.ObjectId
  @IsNotEmpty({message: '用户名不能为空'})
  username: string // 用户名
  @IsNotEmpty({message: '密码不能为空'})
  @Length(6, 18, {message: '密码长度6~18位'})
  @Matches(/^(?![\d]+$)(?![a-zA-Z]+$)(?![-=+_.,]+$)[\da-zA-Z-=+_.,]+$/, {message: '密码由字母、数字、特殊字符中的任意两种组成'})
  password: string // 密码(SHA1)
  realname: string // 显示名称
  role_ids: Types.ObjectId[] // 角色ID们
  created_at: Date // 创建时间
  updated_at: Date // 更新时间
}

export interface SystemUser extends SystemUserEntity,Document {
  _id: Types.ObjectId
}
