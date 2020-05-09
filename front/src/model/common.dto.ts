export interface MsgResult {
  status: boolean
  msg: string
}

/**
 * 分页查询基础类
 */
export class Page {
  // 页码
  pageNum: number = 1
  // 每页数据条数
  limit: number = 10
  // 数据总数
  total: number = 0
  /**
   * 重置分页
   */
  public reset() {
    this.pageNum = 1
    this.limit = 10
  }
}