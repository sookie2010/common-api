export interface MusicModel {
  _id: string
  name: string // 文件名
  ext: string // 扩展名
  md5?: string // md5哈希值
  size: number // 文件大小
  title?: string // 标题
  album?: string // 唱片集
  artist?: string // 艺术家
  lib_id: string // 歌单ID
  lyric_id: string // 歌词ID
}

export interface MusicLibModel {
  _id: string
  name: string // 歌单名称
  path: string // 歌单文件路径
}

export interface MusicLyricModel {
  _id?: string
  cloud_id?: number
  name?: string
  lyric?: string
}