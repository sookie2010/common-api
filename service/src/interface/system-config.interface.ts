import { Document, Types } from 'mongoose'
import { IsNotEmpty, IsJSON } from 'class-validator'

export class SystemConfigEntity {
  _id: Types.ObjectId
  @IsNotEmpty({message: '配置项名称不能为空'})
  name: string // 配置项名称
  @IsJSON({message: '配置项值必须符合JSON格式'})
  value: object // 配置项值
  description: string // 描述
  is_public: boolean // 是否公开
  created_at: Date // 创建时间
  updated_at: Date // 更新时间
}

export interface SystemConfig extends SystemConfigEntity,Document {
  _id: Types.ObjectId
}
