import { Document, Types } from 'mongoose'
import { IsNotEmpty, Validate, ValidatorConstraint, ValidatorConstraintInterface, ValidationArguments } from 'class-validator'

@ValidatorConstraint({ name: 'JsonValidator', async: false })
class JsonValidate implements ValidatorConstraintInterface {
  validate(value: any, args: ValidationArguments) {
    if (typeof value !== 'string') { return true }
    try {
      JSON.parse(value)
      return true
    } catch (err) {
      return false
    }
  }
  defaultMessage(args: ValidationArguments) {
    return 'Text ($value) is not a JSON string!';
  }
}

export class SystemConfigEntity {
  _id: Types.ObjectId
  @IsNotEmpty({message: '配置项名称不能为空'})
  name: string // 配置项名称
  @Validate(JsonValidate, {message: '配置项值必须符合JSON格式'})
  value: object // 配置项值
  description: string // 描述
  is_public: boolean // 是否公开
  created_at: Date // 创建时间
  updated_at: Date // 更新时间
}

export interface SystemConfig extends SystemConfigEntity, Document {
  _id: Types.ObjectId
}
