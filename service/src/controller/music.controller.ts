import { Controller, Get, Post, Delete, Query, Body, UseInterceptors } from '@nestjs/common'
import MusicService from '../service/music.service'
import { Music, MusicDto, MusicLib } from '../interface/music.interface'
import { Page, MsgResult } from '../common/common.dto'
import LoginInterceptor from '../common/login.interceptor'
import PageTransform from '../common/page.transform'

@UseInterceptors(LoginInterceptor)
@Controller('/music')
export default class MusicController {
  constructor(
    private readonly musicService: MusicService,
  ) {}
  /**
   * 查询歌曲列表
   * @param hitokotoDto 查询条件
   * @param page 分页
   */
  @Get('/list')
  list(@Query() musicDto: MusicDto, @Query(PageTransform) page: Page): Promise<Page> {
    return this.musicService.list(musicDto, page)
  }
  /**
   * 列出所有类型
   */
  @Get('/listExts')
  listTags(): Promise<string[]> {
    return this.musicService.listExts()
  }

  /**
   * 获取所有歌单
   */
  @Get('/listLibs')
  listLibs(): Promise<MusicLib[]> {
    return this.musicService.listLibs()
  }
}