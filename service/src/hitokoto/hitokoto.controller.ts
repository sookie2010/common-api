import { Controller, Get, Post, Delete, Query, Body } from '@nestjs/common';
import { HitokotoService } from './hitokoto.service';
import { Hitokoto } from './hitokoto.interface';
import { HitokotoDto } from './hitokoto.dto';
import { Page } from '../common/page.dto';

@Controller()
export class HitokotoController {
  constructor(
    private readonly hitokotoService: HitokotoService
  ) {}

  @Get('/hitokoto/list')
  list(@Query() hitokotoDto: HitokotoDto, @Query() page: Page): Promise<Page> {
    if(page.pageNum && page.limit) {
      page.start = ~~page.limit * (~~page.pageNum - 1);
    }
    return this.hitokotoService.list(hitokotoDto, page);
  }

  @Post('/hitokoto/save')
  save(@Body() hitokoto: Hitokoto): Promise<String> {
    console.log()
    return this.hitokotoService.save(hitokoto);
  }

  @Delete('/hitokoto/delete')
  delete(@Query() hitokotoDto: HitokotoDto): Promise<String> {
    return this.hitokotoService.delete(hitokotoDto._ids);
  }
}
