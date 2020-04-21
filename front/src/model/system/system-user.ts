export interface SystemUserModel {
  _id: string | null
  username: string | null
  password: string | null
  realname: string | null
  role_ids: string[]
  created_at?: Date
  updated_at?: Date
}