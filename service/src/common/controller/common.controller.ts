import { Controller, Get, Query, Param, Post, Body, Res, ValidationPipe } from '@nestjs/common'
import CommonService from '../service/common.service'
import HitokotoService from '../../api/service/hitokoto.service'
import PhotoWallService from '../../api/service/photo-wall.service'
import ArticleService from '../../system/service/article.service'
import SourceImageService from '../../api/service/source-image.service'
import { Hitokoto, HitokotoDto } from '../../api/interface/hitokoto.interface'
import { ArticleDto } from '../../system/interface/article.interface'
import { SourceImage } from '../../api/interface/source-image.interface'
import { Page, MsgResult, PageResult } from '../common.dto'
import { SystemUserEntity } from '../../system/interface/system-user.interface'
import { ConfigValue } from '../../system/interface/system-config.interface'
import PageTransform from '../page.transform'
import SystemService from '../../system/service/system.service'
import MusicService from '../../api/service/music.service'
import { Response } from 'express'

import { Readable } from 'stream'

@Controller('/common')
export default class CommonController {
  constructor(
    private readonly hitokotoService: HitokotoService,
    private readonly photoWallService: PhotoWallService,
    private readonly articleService: ArticleService,
    private readonly systemService: SystemService,
    private readonly commonService: CommonService,
    private readonly sourceImageService: SourceImageService,
    private readonly musicService: MusicService,
  ) {}
  /**
   * 登录
   * @param systemUser 用户名 密码
   */
  @Post('/login')
  login(@Body(new ValidationPipe()) systemUser: SystemUserEntity): Promise<object> {
    return this.commonService.login(systemUser)
  }
  /**
   * 访客登录
   */
  @Post('/guestLogin')
  guestLogin(): Promise<MsgResult> {
    return this.commonService.guestLogin()
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
    return this.commonService.verifyToken(tokenObj.token)
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
  getPhotos(@Query(PageTransform) page: Page): Promise<PageResult | MsgResult> {
    return this.photoWallService.queryPage(page)
  }

  /**
   * 获取公开的配置项
   */
  @Get('/config/:name')
  getPublicConfig(@Param('name')name: string): Promise<ConfigValue> {
    return this.systemService.getConfig(name, true)
  }

  /**
   * 博客文章内容全文检索
   * @param articleDto 查询关键词
   * @param page 分页信息
   */
  @Get('/search')
  search(@Query() articleDto: ArticleDto, @Query(PageTransform) page: Page): Promise<PageResult> {
    if (!articleDto.words) {
      return Promise.resolve(new PageResult())
    }
    return this.articleService.search(articleDto.words, page)
  }
  /**
   * 获取一张背景图
   * @param id 图片ID(不传则根据label随机获取一张)
   * @param label 图片标签
   * @param response HTTP响应
   */
  @Get('/randomBg')
  randomBg(@Query('id') id: string, @Query('label') label: string, @Res() response: Response): void {
    this.sourceImageService.findOne(id, label).then((sourceImage: SourceImage) => {
      const stream = new Readable()
      stream.push(sourceImage.img)
      stream.push(null)
      response.set({
        'Content-Type': sourceImage.mime,
        'Content-Length': sourceImage.size,
      })
      stream.pipe(response)
    }).catch(err => {
      response.set({
        'Content-Type': 'application/json',
      })
      response.end(JSON.stringify(new MsgResult(false, err.message)))
    })
  }
  /**
   * 获取音乐文件
   * @param id 音乐ID
   * @param response HTTP响应
   */
  @Get('/music/get/:musicId')
  getMusic(@Param('musicId') musicId: string, @Res() response: Response): void | MsgResult {
    const music = this.musicService.outputMusic(musicId, response)
    if (!music) return new MsgResult(false, '歌曲未找到')
  }
  /**
   * 下载音乐
   * @param musicId 音乐ID
   * @param response HTTP响应
   */
  @Get('/music/download/:id')
  async downloadMusic(@Param('musicId')musicId: string, @Res() response: Response): Promise<void | MsgResult> {
    const music = await this.musicService.outputMusic(musicId, response)
    if (!music) return new MsgResult(false, '歌曲未找到')
    response.set({
      'Content-Length': music.size,
      'Content-Type': 'application/x-download',
      // 'Content-Disposition': `attachment;filename=${music.name}`
    })
    response.attachment(music.name)
  }
  /**
   * 获取音乐专辑封面
   * @param musicId 音乐ID
   * @param response HTTP响应
   */
  @Get('/music/album/:musicId')
  getMusicAlbumImage(@Param('musicId') musicId: string, @Res() response: Response): void {
    this.musicService.findAlbumImage(musicId).then((albumImage: Buffer) => {
      if (!albumImage) { return }
      const stream = new Readable()
      stream.push(albumImage)
      stream.push(null)
      response.set({
        'Content-Type': 'image/jpeg',
        'Content-Length': albumImage.length,
      })
      stream.pipe(response)
    }).catch(err => {
      response.set({
        'Content-Type': 'application/json',
      })
      response.end(JSON.stringify(new MsgResult(false, err.message)))
    })
  }

  /**
   * 获取歌词
   * @param lyricId 歌词ID
   */
  @Get('/music/lyric/:lyricId')
  getMusicLyric(@Param('lyricId') lyricId: string): Promise<string | MsgResult> {
    return this.musicService.findLyric(lyricId)
  }
}
