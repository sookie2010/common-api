export interface SystemConfigModel {
  _id?: string
  name: string // 配置项名称
  value: object | string // 配置项内容
  description: string // 描述
  is_public: boolean // 是否公开
  created_at?: Date // 创建时间
  updated_at?: Date // 更新时间
}