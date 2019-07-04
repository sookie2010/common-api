import { Schema, Document } from 'mongoose'
import BaseQc from 'src/common/base.qc';

export interface Article extends Document {
  _id?: Schema.Types.ObjectId
  title?: string // 文章标题
  path?: string // 文章访问路径
  create_date?: Date // 创建时间
  categories?: string[] // 分类
  tags?: string[] // 标签
  content?: string // 正文内容
  content_hash?: string // 正文内容Hash(SHA1)
}

export interface ArticleKeys extends Document {
  _id: Schema.Types.ObjectId
  article_id: Schema.Types.ObjectId
  keys: string[]
}

export interface ArticleQc extends BaseQc {
  title?: {
    $regex?: RegExp}
  create_date?: {
    $gte: Date
    $lte: Date}
  is_splited?: boolean
}

export interface ArticleDto {
  /**
   * 多个ID, 用于批量操作
   */
  _ids: string[]
  _id: Schema.Types.ObjectId
  /**
   * 标题模糊搜索
   */
  title: string
  /**
   * 创建时间范围搜索, 数组包含2个元素
   * 分别是起始时间与结束时间的 UTS 字符串
   */
  createDate: string[]
  /**
   * 是否已分词, 'true'已分词, 'false'未分词
   */
  isSplited: string
  /**
   * 搜索关键字
   */
  words: string
  /**
   * 关键字匹配数量
   */
  num: number
}
