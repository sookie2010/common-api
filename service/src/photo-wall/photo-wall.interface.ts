import { Document, Types } from 'mongoose'
import BaseQc from '../common/base.qc'
import CommonUtils from '../common/common.util'

export interface PhotoWallEntity {
  _id?: Types.ObjectId
  name?: string // 图片文件名
  md5?: string // 文件md5哈希值
  thumbnail?: string // 缩略图名称
  width?: number // 宽度
  height?: number // 高度
  index?: number // 序号
}

export interface PhotoWall extends Document, PhotoWallEntity {
  _id: Types.ObjectId
}

export class PhotoWallQc extends BaseQc {
  name?: object
  width?: {
    $gte?: number
    $lte?: number}
  height?: {
    $gte?: number
    $lte?: number}
  constructor(photoWallDto: PhotoWallDto) {
    super()
    if (photoWallDto.name) { // mongodb的模糊搜索使用正则形式
      this.name = {$regex: new RegExp(CommonUtils.escapeRegexStr(photoWallDto.name))}
    }
    if (~~photoWallDto.widthMin || ~~photoWallDto.widthMax) {
      this.width = {}
      if (~~photoWallDto.widthMin) {
        this.width.$gte = ~~photoWallDto.widthMin
      }
      if (~~photoWallDto.widthMax) {
        this.width.$lte = ~~photoWallDto.widthMax
      }
    }
    if (~~photoWallDto.heightMin || ~~photoWallDto.heightMax) {
      this.height = {}
      if (~~photoWallDto.heightMin) {
        this.height.$gte = ~~photoWallDto.heightMin
      }
      if (~~photoWallDto.heightMax) {
        this.height.$lte = ~~photoWallDto.heightMax
      }
    }
  }
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
