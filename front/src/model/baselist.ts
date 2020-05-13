import { Vue } from 'vue-property-decorator'
import { Page } from './common.dto'

export default abstract class BaseList<T extends Page> extends Vue {
  protected loading: boolean = false
  protected abstract search: T
  /**
   * 加载数据的实现
   */
  abstract async loadData(): Promise<void>
  /**
   * 加载数据
   * @param resetPage 是否重置页码
   */
  loadDataBase(resetPage: boolean = false): void {
    if(resetPage) {
      this.search.pageNum = 1
    }
    this.loadData()
  }
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