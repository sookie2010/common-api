import { Controller, Get, Post, Put, Delete, Query, Body, UseInterceptors } from '@nestjs/common'
import { Page } from '../common/common.dto'
import LoginInterceptor from '../common/login.interceptor'
import ArticleService from './article.service';
import { ArticleDto } from './article.interface'

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
  list(@Query() articleDto: ArticleDto, @Query() page: Page): Promise<Page> {
    if (page.pageNum && page.limit) {
      page.start = ~~page.limit * (~~page.pageNum - 1)
    }
    return this.articleService.list(articleDto, page)
  }
  /**
   * 批量执行文章分词处理
   * @param articleDto 包含多个ID
   */
  @Put('/splitWord')
  splitWord(@Body() articleDto: ArticleDto): Promise<object> {
    return this.articleService.splitWord(articleDto._ids)
  }
}
