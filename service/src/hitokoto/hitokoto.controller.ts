import { Controller, Get, Post, Delete, Query, Body, UseInterceptors } from '@nestjs/common'
import HitokotoService from './hitokoto.service'
import { Hitokoto } from './hitokoto.interface'
import { HitokotoDto } from './hitokoto.interface'
import { Page } from '../common/common.dto'
import LoginInterceptor from '../common/login.interceptor'

@UseInterceptors(LoginInterceptor)
@Controller('/hitokoto')
export default class HitokotoController {
  constructor(
    private readonly hitokotoService: HitokotoService,
  ) {}
  /**
   * 查询一言列表
   * @param hitokotoDto 查询条件
   * @param page 分页
   */
  @Get('/list')
  list(@Query() hitokotoDto: HitokotoDto, @Query() page: Page): Promise<Page> {
    if (page.pageNum && page.limit) {
      page.start = ~~page.limit * (~~page.pageNum - 1)
    }
    return this.hitokotoService.list(hitokotoDto, page)
  }
  /**
   * 保存一言
   * @param hitokoto 一言
   */
  @Post('/save')
  save(@Body() hitokoto: Hitokoto): Promise<string> {
    return this.hitokotoService.save(hitokoto)
  }
  /**
   * 删除一言
   * @param hitokotoDto 需要删除的多个ID
   */
  @Delete('/delete')
  delete(@Query() hitokotoDto: HitokotoDto): Promise<string> {
    return this.hitokotoService.delete(hitokotoDto._ids)
  }
}
