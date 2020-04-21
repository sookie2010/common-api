import { Vue } from 'vue-property-decorator'
import { Page } from './common.dto'

export default abstract class BaseList<T extends Page> extends Vue {
  protected loading: boolean = false
  protected abstract search: T
  abstract async loadData(): Promise<void>
  /**
   * 重置搜索项
   */
  reset() {
    this.search.reset()
    this.loadData()
  }
  /**
   * 页码变更
   * @param pageNum 页码
   */
  pageChange(pageNum: number) {
    this.search.pageNum = pageNum
    this.loadData()
  }

  /**
   * 每页数据条数变更
   * @param pageSize 每页数据条数
   */
  pageSizeChange(pageSize: number) {
    this.search.limit = pageSize
    this.loadData()
  }
}