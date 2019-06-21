import { Document, Schema } from 'mongoose'

export default interface SystemConfig extends Document {
  _id?: Schema.Types.ObjectId
  name?: string
  value?: object
  description?: string
}
