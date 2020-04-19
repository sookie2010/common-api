export interface SourceImageModel {
  _id: string
  mime: string // MIME类型
  hash: string // 图片md5值
  size: number // 图片大小
  label: string[] // 图片标签
  img: Buffer // 图片二进制数据
  created_at: Date
}

/**
 * 图片标签
 */
export interface ImageLabel {
  name: string // 标签名称
  color: string // 标签颜色
}