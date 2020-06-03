import { Document, Types } from 'mongoose'
import BaseQc from '../common/base.qc'
import CommonUtils from '../common/common.util'

export interface Music extends Document {
  _id: Types.ObjectId
  name: string // 文件名
  ext: string // 文件类型
  md5: string // md5哈希值
  size: number // 文件大小
  time: number // 音频时长
  title: string // 歌曲名称
  album: string // 唱片集
  artist: string // 艺术家
  album_image: Buffer // 专辑封面
  lib_id: Types.ObjectId // 歌单ID
}

export class MusicQc extends BaseQc {
  _id?: {$in: string[]}
  name?: {$regex: RegExp}
  ext?: {$in: string[]}
  title?: {$regex: RegExp}
  album?: {$regex: RegExp}
  artist?: {$regex: RegExp}
  lib_id?: {$in: string[]}
  constructor(musicDto: MusicDto) {
    super()
    if(Array.isArray(musicDto.ids) && musicDto.ids.length) {
      this._id = {$in: musicDto.ids}
      return // 如果有ID就只按ID查
    }
    if (musicDto.name) {
      this.name = {$regex: new RegExp(CommonUtils.escapeRegexStr(musicDto.name))}
    }
    if (Array.isArray(musicDto.ext) && musicDto.ext.length) {
      this.ext = {$in: musicDto.ext}
    }
    if (musicDto.title) {
      this.title = {$regex: new RegExp(CommonUtils.escapeRegexStr(musicDto.title))}
    }
    if (musicDto.album) {
      this.album = {$regex: new RegExp(CommonUtils.escapeRegexStr(musicDto.album))}
    }
    if (musicDto.artist) {
      this.artist = {$regex: new RegExp(CommonUtils.escapeRegexStr(musicDto.artist))}
    }
    if (Array.isArray(musicDto.lib_id) && musicDto.lib_id.length) {
      this.lib_id = {$in: musicDto.lib_id}
    }
  }
}

export interface MusicDto {
  ids: string[]
  name: string
  ext: string[]
  title: string
  album: string
  artist: string
  lib_id: string[]
}

export interface MusicLib extends Document {
  _id: Types.ObjectId
  name: string
  path: string
}
