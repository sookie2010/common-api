import { Controller, Get, Put, Query, Body, UseInterceptors } from '@nestjs/common'
import { Page, MsgResult } from '../common/common.dto'
import LoginInterceptor from '../common/login.interceptor'
import ArticleService from '../service/article.service'
import { ArticleDto } from '../interface/article.interface'
import PageTransform from '../common/page.transform'

@UseInterceptors(LoginInterceptor)
@Controller('/article')
export default class ArticleController {
  constructor(
    private readonly articleService: ArticleService,
  ) {}

  /**
   * 查询文章列表
   * @param hitokotoDto 查询条件
   * @param page 分页
   */
  @Get('/list')
  list(@Query() articleDto: ArticleDto, @Query(PageTransform) page: Page): Promise<Page> {
    return this.articleService.list(articleDto, page)
  }

  /**
   * 查询文章目录树
   * @param deep 树深度
   * @param parent 父节点名称
   */
  @Get('/tree')
  tree(@Query('deep')deep: number, @Query('parent')parent: string): Promise<object[]> {
    return this.articleService.tree(+deep, parent)
  }

  /**
   * 获取文章markdown文本
   * @param id 文章ID
   */
  @Get('/markdown')
  markdown(@Query('id')id: string): Promise<string> {
    return this.articleService.markdown(id)
  }

  /**
   * 批量执行文章分词处理
   * @param articleDto 包含多个ID
   */
  @Put('/splitWord')
  splitWord(@Body() articleDto: ArticleDto): Promise<MsgResult> {
    return this.articleService.splitWord(articleDto._ids)
  }

  /**
   * 从主站拉取全部文章(包含正文)
   */
  @Get('/pull')
  pull(): Promise<MsgResult> {
    return this.articleService.pullArticles()
  }

  /**
   * 列出所有标签
   */
  @Get('/listTags')
  listTags(): Promise<string[]> {
    return this.articleService.listAttrs('$tags')
  }

  /**
   * 列出所有分类
   */
  @Get('/listCategories')
  listCategories(): Promise<string[]> {
    return this.articleService.listAttrs('$categories')
  }

  /**
   * 文章分析统计
   * @param type 查询的种类(normal 或 timelineWords)
   */
  @Get('/statistics')
  statistics(@Query('type') type: string): Promise<{categories?: any[], publishDates?: any[], timelineWords?: any[]}> {
    return this.articleService.statistics(type)
  }
}
