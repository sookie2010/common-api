import { Controller, Get, Post, Delete, Query, Body, UseInterceptors } from '@nestjs/common'
import HitokotoService from '../service/hitokoto.service'
import { Hitokoto, HitokotoDto } from '../interface/hitokoto.interface'
import { Page, MsgResult } from '../common/common.dto'
import LoginInterceptor from '../common/login.interceptor'
import PageTransform from '../common/page.transform'

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
  list(@Query() hitokotoDto: HitokotoDto, @Query(PageTransform) page: Page): Promise<Page> {
    return this.hitokotoService.list(hitokotoDto, page)
  }
  /**
   * 保存一言
   * @param hitokoto 一言
   */
  @Post('/save')
  save(@Body() hitokoto: Hitokoto): Promise<MsgResult> {
    return this.hitokotoService.save(hitokoto)
  }
  /**
   * 删除一言
   * @param ids 需要删除的多个ID
   */
  @Delete('/delete')
  delete(@Query('_ids') ids: string[]): Promise<MsgResult> {
    return this.hitokotoService.delete(ids)
  }
}
