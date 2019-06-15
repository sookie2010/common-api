import * as mongoose from 'mongoose';

export interface Hitokoto extends mongoose.Document {
  readonly _id: mongoose.Schema.Types.ObjectId
  hitokoto: String
  /**
   * a	Anime - 动画
   * b	Comic – 漫画
   * c	Game – 游戏
   * d	Novel – 小说
   * e	Myself – 原创
   * f	Internet – 来自网络
   * g	Other – 其他
   */
  type: String
  from: String
  creator: String
  created_at: Date
  number: Number
}