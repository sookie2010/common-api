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
    private readonly appService: AppService,
  ) {}

  @Post('/login')
  login(@Body() systemUser: SystemUser): Promise<object> {
    return this.appService.login(systemUser)
  }

  @Post('/verifyToken')
  verifyToken(@Body() tokenObj: {token: string}): Promise<object> {
    if (!tokenObj.token) {
      return Promise.resolve({status: false, msg: '未获得Token'})
    }
    return this.appService.verifyToken(tokenObj.token)
  }

  @Get('/hitokoto')
  getHitokoto(@Query() hitokotoDto: HitokotoDto): Promise<Hitokoto> {
    return this.hitokotoService.findOne(hitokotoDto)
  }

  @Get('/photos')
  getPhotos(@Query() page: Page): Promise<Page> {
    return this.photoWallService.queryPage(page)
  }

  @Get('/hitokotoTypes')
  listHitokotoTypes(): Promise<object[]> {
    return this.hitokotoService.listTypes()
  }

  @Get('/pictureCdn')
  getPictureCdn(): Promise<string> {
    return this.photoWallService.getPictureCdn()
  }
}
