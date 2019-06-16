import { Controller, Get, Post, Delete, Query, Body } from '@nestjs/common';
import { PhotoWallService } from './photo-wall.service';
import { PhotoWall } from './photo-wall.interface';
import { PhotoWallDto } from './photo-wall.dto';
import { Page } from '../common/page.dto';

@Controller()
export class PhotoWallController {
  constructor(
    private readonly photoWallService: PhotoWallService
  ) {}

  @Get('/photowall/list')
  list(@Query() photoWallDto: PhotoWallDto, @Query() page: Page): Promise<Page> {
    if(page.pageNum && page.limit) {
      page.start = ~~page.limit * (~~page.pageNum - 1);
    }
    return this.photoWallService.list(photoWallDto, page);
  }

  @Post('/photowall/save')
  save(@Body() hitokoto: PhotoWall): Promise<String> {
    return this.photoWallService.save(hitokoto);
  }

  @Delete('/photowall/delete')
  delete(@Query() hitokotoDto: PhotoWallDto): Promise<String> {
    return this.photoWallService.delete(hitokotoDto._ids);
  }
}
