export interface FileDto {
  fieldname: string // 文件字段
  originalname: string // 文件名
  encoding: string // 文件编码
  mimetype: string // MIME
  buffer: Buffer // 文件字节码
  size: number // 文件体积
}

export interface Page {
  start: Number // 起始数据行(从0开始)
  pageNum: Number // 当前页码
  limit: Number // 每页数据数量
  total: Number // 数据总数
  data: Array<Object> // 当前页数据
}