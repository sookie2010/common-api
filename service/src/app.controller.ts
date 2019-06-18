import { Controller, Get, Query } from '@nestjs/common/index';
import { HitokotoService } from './hitokoto/hitokoto.service';
import { PhotoWallService } from './photo-wall/photo-wall.service';
import { Hitokoto } from './hitokoto/hitokoto.interface';
import { HitokotoDto } from './hitokoto/hitokoto.dto';
import { Page } from './common/page.dto';

@Controller('/common')
export class AppController {
  constructor(
    private readonly hitokotoService: HitokotoService,
    private readonly photoWallService: PhotoWallService
  ) {}

  @Get('/hitokoto')
  getHitokoto(@Query() hitokotoDto : HitokotoDto): Promise<Hitokoto> {
    return this.hitokotoService.findOne(hitokotoDto);
  }

  @Get('/photos')
  getPhotos(@Query() page: Page): Promise<Page> {
    return this.photoWallService.queryPage(page);
  }

  @Get('/hitokotoTypes')
  listHitokotoTypes(): Promise<Array<Object>> {
    return this.hitokotoService.listTypes();
  }

  @Get('/pictureCdn')
  getPictureCdn(): Promise<String> {
    return this.photoWallService.getPictureCdn();
  }
}