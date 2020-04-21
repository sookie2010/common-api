export interface SystemRoleModel {
  _id: string | null
  name: string | null // 角色名称
  description: string | null // 描述
  methods: string[] // 允许的请求类型(优先级3)
  include_uri: string[] // 包含的URI(优先级2)
  exclude_uri: string[] // 排除的URI(优先级1)
  created_at?: Date // 创建时间
  updated_at?: Date // 更新时间
}