export interface FileEntity {
  fieldname: string // 文件字段
  originalname: string // 文件名
  encoding: string // 文件编码
  mimetype: string // MIME
  buffer: Buffer // 文件字节码
  size: number // 文件体积
}

export interface Page {
  start: number // 起始数据行(从0开始)
  pageNum: number // 当前页码
  limit: number // 每页数据数量
}

export class PageResult {
  total: number // 数据总数
  data: object[] // 当前页数据
  constructor(total: number = 0, data: object[] = []){
    this.total = total
    this.data = data
  }
}

export class MsgResult {
  constructor(
    private readonly status: boolean,
    private readonly message: string,
    private readonly data?: object) { }

  getStatus() {
    return this.status
  }
  getMessage() {
    return this.message
  }
}
