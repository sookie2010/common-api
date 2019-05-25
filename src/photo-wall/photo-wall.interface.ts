import * as mongoose from 'mongoose';

export interface PhotoWall extends mongoose.Document {
  readonly _id: mongoose.Schema.Types.ObjectId
  readonly name: String,
  readonly md5: String,
  readonly thumbnail: String,
  readonly width: number,
  readonly height: number,
}