import { Schema, Document } from 'mongoose'
import BaseQc from '../common/base.qc'

export interface PhotoWall extends Document {
  _id?: Schema.Types.ObjectId
  name?: string // 图片文件名
  md5?: string // 文件md5哈希值
  thumbnail?: string // 缩略图名称
  width?: number // 宽度
  height?: number // 高度
  index?: number // 序号
}

export interface PhotoWallQc extends BaseQc {
  name?: object
  width?: {
    $gte?: number
    $lte?: number}
  height?: {
    $gte?: number
    $lte?: number}
}

export interface PhotoWallDto {
  _ids: string[] // 多个ID, 用于批量删除
  name: string // 名称模糊搜索
  /**
   * 宽度范围
   */
  widthMin: number
  widthMax: number
  /**
   * 高度范围
   */
  heightMin: number
  heightMax: number
}
