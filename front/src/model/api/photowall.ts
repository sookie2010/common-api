export default interface PhotoWallModel {
  _id: string
  name: string // 图片文件名
  md5: string // 文件md5哈希值
  thumbnail: string // 缩略图名称
  width: number // 宽度
  height: number // 高度
  index: number // 序号
}