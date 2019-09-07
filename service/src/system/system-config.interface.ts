import { Document, Types } from 'mongoose'

export default interface SystemConfig extends Document {
  _id: Types.ObjectId
  name?: string
  value?: object
  description?: string
  is_public?: boolean
}
