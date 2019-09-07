import { Controller, Get, Query, Param, Post, Body, Res } from '@nestjs/common'
import AppService from './app.service'
import HitokotoService from './hitokoto/hitokoto.service'
import PhotoWallService from './photo-wall/photo-wall.service'
import ArticleService from './article/article.service'
import BackgroundImgService from './backgroud-img/background-img.service'
import { Hitokoto, HitokotoDto } from './hitokoto/hitokoto.interface'
import { ArticleDto } from './article/article.interface'
import { BackgroundImg } from './backgroud-img/background-img.interface'
import { Page, MsgResult } from './common/common.dto'
import SystemUser from './system/system-user.interface'
import PageTransform from './common/page.transform'
import SystemService from './system/system.service';
import { Response } from 'express'

import { Readable } from 'stream'

@Controller('/common')
export default class AppController {
  constructor(
    private readonly hitokotoService: HitokotoService,
    private readonly photoWallService: PhotoWallService,
    private readonly articleService: ArticleService,
    private readonly systemService: SystemService,
    private readonly appService: AppService,
    private readonly backgroundImgService: BackgroundImgService
  ) {}
  /**
   * 登录
   * @param systemUser 用户名 密码
   */
  @Post('/login')
  login(@Body() systemUser: SystemUser): Promise<object> {
    return this.appService.login(systemUser)
  }

  /**
   * 校验Token
   * @param tokenObj Token字符串
   */
  @Post('/verifyToken')
  verifyToken(@Body() tokenObj: {token: string}): Promise<object> {
    if (!tokenObj.token) {
      return Promise.resolve(new MsgResult(false, '未获得Token'))
    }
    return this.appService.verifyToken(tokenObj.token)
  }

  /**
   * 随机获取一条一言
   * @param hitokotoDto 筛选条件
   */
  @Get('/hitokoto')
  getHitokoto(@Query() hitokotoDto: HitokotoDto): Promise<string | Hitokoto | MsgResult> {
    return this.hitokotoService.findOne(hitokotoDto)
  }

  /**
   * 分页查询照片
   */
  @Get('/photos')
  getPhotos(@Query(PageTransform) page: Page): Promise<Page | MsgResult> {
    return this.photoWallService.queryPage(page)
  }

  /**
   * 获取公开的配置项
   */
  @Get('/config/:name')
  getPublicConfig(@Param('name')name: string): Promise<object> {
    return this.systemService.getConfig(name)
  }

  /**
   * 博客文章内容全文检索
   * @param articleDto 查询关键词
   * @param page 分页信息
   */
  @Get('/search')
  search(@Query() articleDto: ArticleDto, @Query(PageTransform) page: Page): Promise<Page> {
    if (!articleDto.words) {
      return Promise.resolve(page)
    }
    return this.articleService.search(articleDto.words, page)
  }
  /**
   * 随机获取一张背景图
   */
  @Get('/randomBg')
  randomBg(@Query('id') id: string, @Res() res: Response): void {
    this.backgroundImgService.findOne(id).then((backgroundImg: BackgroundImg) => {
      const stream = new Readable();
      stream.push(backgroundImg.img)
      stream.push(null)
      res.set({
        'Content-Type': backgroundImg.mime,
        'Content-Length': backgroundImg.size,
      })
      stream.pipe(res)
    })
  }
}
