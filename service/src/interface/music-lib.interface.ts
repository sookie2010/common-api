import { Document, Types } from 'mongoose'
import BaseQc from '../common/base.qc'
import CommonUtils from '../common/common.util'

export interface MusicLib extends Document {
  _id: Types.ObjectId
  name: string // 文件名
  ext: string // 文件类型
  md5: string // md5哈希值
  size: number // 文件大小
  time: number // 音频时长
  title: string // 歌曲名称
  album: string // 唱片集
  artist: string // 艺术家
}

export class MusicLibQc extends BaseQc {
  name?: {$regex: RegExp}
  ext?: {$in: string[]}
  title?: {$regex: RegExp}
  album?: {$regex: RegExp}
  artist?: {$regex: RegExp}
  constructor(musicLibDto: MusicLibDto) {
    super()
    if (musicLibDto.name) {
      this.name = {$regex: new RegExp(CommonUtils.escapeRegexStr(musicLibDto.name))}
    }
    if (Array.isArray(musicLibDto.ext) && musicLibDto.ext.length) {
      this.ext = {$in: musicLibDto.ext}
    }
    if (musicLibDto.title) {
      this.title = {$regex: new RegExp(CommonUtils.escapeRegexStr(musicLibDto.title))}
    }
    if (musicLibDto.album) {
      this.album = {$regex: new RegExp(CommonUtils.escapeRegexStr(musicLibDto.album))}
    }
    if (musicLibDto.artist) {
      this.artist = {$regex: new RegExp(CommonUtils.escapeRegexStr(musicLibDto.artist))}
    }
  }
}

export interface MusicLibDto {
  name: string
  ext: string[]
  title: string
  album: string
  artist: string
}