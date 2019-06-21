import { Controller, Get, Query, Post, Body } from '@nestjs/common'
import AppService from './app.service'
import HitokotoService from './hitokoto/hitokoto.service'
import PhotoWallService from './photo-wall/photo-wall.service'
import { Hitokoto } from './hitokoto/hitokoto.interface'
import { HitokotoDto } from './hitokoto/hitokoto.interface'
import { Page } from './common/common.dto'
import SystemUser from './system/system-user.interface'


@Controller('/common')
export default class AppController {
  constructor(
    private readonly hitokotoService: HitokotoService,
    private readonly photoWallService: PhotoWallService,
    private readonly appService: AppService
  ) {}

  @Post('/login')
  login(@Body() systemUser: SystemUser): Promise<Object> {
    return this.appService.login(systemUser)
  }

  @Get('/hitokoto')
  getHitokoto(@Query() hitokotoDto : HitokotoDto): Promise<Hitokoto> {
    return this.hitokotoService.findOne(hitokotoDto)
  }

  @Get('/photos')
  getPhotos(@Query() page: Page): Promise<Page> {
    return this.photoWallService.queryPage(page)
  }

  @Get('/hitokotoTypes')
  listHitokotoTypes(): Promise<Array<Object>> {
    return this.hitokotoService.listTypes()
  }

  @Get('/pictureCdn')
  getPictureCdn(): Promise<String> {
    return this.photoWallService.getPictureCdn()
  }
}