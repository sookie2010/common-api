import { Schema, Types } from 'mongoose'

/**
 * 歌曲
 */
export const MusicSchema = new Schema({
  _id: Types.ObjectId,
  name: String, // 文件名
  ext: String, // 文件类型
  md5: String, // md5哈希值
  size: Number, // 文件大小
  time: Number, // 音频时长
  title: String, // 歌曲名称
  album: String, // 唱片集
  artist: String, // 艺术家
  album_image: Buffer, // 专辑封面
  lib_id: Types.ObjectId, // 歌单ID
  lyric_id: Types.ObjectId, // 歌词ID
}, { collection: 'music', versionKey: false })

/**
 * 歌单
 */
export const MusicLibSchema = new Schema({
  _id: Types.ObjectId,
  name: String, // 名称
  path: String, // 路径
}, { collection: 'music_lib', versionKey: false })

export const MusicLyricSchema = new Schema({
  _id: Types.ObjectId,
  cloud_id: Number, // 网易云ID
  name: String, // 名称
  lyric: String, // 歌词文本
}, { collection: 'music_lyric', versionKey: false })