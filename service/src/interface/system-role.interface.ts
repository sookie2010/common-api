import { Document, Types } from 'mongoose'
import { IsNotEmpty } from 'class-validator'

export class SystemRoleEntity {
  _id: Types.ObjectId
  @IsNotEmpty({message: '角色名称不能为空'})
  name: string // 角色名称
  description: string // 描述
  methods: string[] // 允许的请求类型(优先级3)
  include_uri: string[] // 包含的URI(优先级2)
  exclude_uri: string[] // 排除的URI(优先级1)
  created_at: Date // 创建时间
  updated_at: Date // 更新时间
}

export interface SystemRole extends SystemRoleEntity, Document {
  _id: Types.ObjectId
}
