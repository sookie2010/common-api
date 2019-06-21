import { Schema, Document } from 'mongoose'
import BaseQc from '../common/base.qc'

export interface Hitokoto extends Document {
  _id: Schema.Types.ObjectId
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
  number: number
}

export interface HitokotoQc extends BaseQc {
  type?: Object
  hitokoto?: Object
  created_at?: Object
}

export interface HitokotoDto {
  /**
   * 多个ID, 用于批量删除
   */
  _ids: Array<string>
  /**
   * 内容模糊搜索
   */
  content: string
  /**
   * 创建时间范围搜索, 数组包含2个元素
   * 分别是起始时间与结束时间的 UTS 字符串
   */
  createAt: Array<string>
  /**
   * a	Anime - 动画
   * b	Comic – 漫画
   * c	Game – 游戏
   * d	Novel – 小说
   * e	Myself – 原创
   * f	Internet – 来自网络
   * g	Other – 其他
   * (默认全部)
   */
  type: String
  /**
   * text	返回纯净文本
   * json	返回不进行unicode转码的json文本(默认)
   */
  format: String
  /**
   * 文字长度上限
   */
  length: Number
}