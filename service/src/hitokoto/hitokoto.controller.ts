import { Controller, Get, Post, Delete, Query, Body } from '@nestjs/common/index';
import { HitokotoService } from './hitokoto.service';
import { Hitokoto } from './hitokoto.interface';
import { HitokotoDto } from './hitokoto.dto';
import { Page } from '../common/page.dto';

@Controller()
export class HitokotoController {
  constructor(
    private readonly hitokotoService: HitokotoService
  ) {}
  /**
   * 查询一言列表
   * @param hitokotoDto 查询条件
   * @param page 分页
   */
  @Get('/hitokoto/list')
  list(@Query() hitokotoDto: HitokotoDto, @Query() page: Page): Promise<Page> {
    if(page.pageNum && page.limit) {
      page.start = ~~page.limit * (~~page.pageNum - 1);
    }
    return this.hitokotoService.list(hitokotoDto, page);
  }
  /**
   * 保存一言
   * @param hitokoto 一言
   */
  @Post('/hitokoto/save')
  save(@Body() hitokoto: Hitokoto): Promise<String> {
    console.log()
    return this.hitokotoService.save(hitokoto);
  }
  /**
   * 删除一言
   * @param hitokotoDto 需要删除的多个ID
   */
  @Delete('/hitokoto/delete')
  delete(@Query() hitokotoDto: HitokotoDto): Promise<String> {
    return this.hitokotoService.delete(hitokotoDto._ids);
  }
}
