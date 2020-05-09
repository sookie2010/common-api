import { Controller, Get, Post, Delete, Query, Body, UseInterceptors } from '@nestjs/common'
import MusicLibService from '../service/music-lib.service'
import { MusicLib, MusicLibDto } from '../interface/music-lib.interface'
import { Page, MsgResult } from '../common/common.dto'
import LoginInterceptor from '../common/login.interceptor'
import PageTransform from '../common/page.transform'

@UseInterceptors(LoginInterceptor)
@Controller('/music-lib')
export default class MusicLibController {
  constructor(
    private readonly musicLibService: MusicLibService,
  ) {}
  /**
   * 查询歌曲列表
   * @param hitokotoDto 查询条件
   * @param page 分页
   */
  @Get('/list')
  list(@Query() musicLibDto: MusicLibDto, @Query(PageTransform) page: Page): Promise<Page> {
    return this.musicLibService.list(musicLibDto, page)
  }
  /**
   * 列出所有类型
   */
  @Get('/listExts')
  listTags(): Promise<string[]> {
    return this.musicLibService.listExts()
  }
}