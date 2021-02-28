import { Controller, Get, Query, Body, UseInterceptors, Post, ValidationPipe } from '@nestjs/common'
import MusicService from '../service/music.service'
import { Music, MusicDto, MusicLib } from '../interface/music.interface'
import { Page, PageResult, MsgResult } from '../../common/common.dto'
import LoginInterceptor from '../../common/login.interceptor'
import PageTransform from '../../common/page.transform'
import { MusicLyric } from 'dist/api/interface/music.interface'

@UseInterceptors(LoginInterceptor)
@Controller('/music')
export default class MusicController {
  constructor(
    private readonly musicService: MusicService,
  ) {}
  /**
   * 分页查询歌曲列表
   * @param hitokotoDto 查询条件
   * @param page 分页
   */
  @Get('/list')
  list(@Query() musicDto: MusicDto, @Query(PageTransform) page: Page): Promise<PageResult> {
    return this.musicService.list(musicDto, page)
  }
  /**
   * 查询歌曲列表
   * @param musicDto 查询条件
   */
  @Get('/list/all')
  listAll(@Query() musicDto: MusicDto): Promise<Music[]> {
    return this.musicService.listAll(musicDto)
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

  /**
   * 修改所属歌单
   * @param id 歌曲ID
   * @param libId 歌单ID
   */
  @Post('/updateLib')
  updateLib(@Body('id') id: string, @Body('libId') libId: string): Promise<MsgResult> {
    return this.musicService.updateLib(id, libId)
  }

  /**
   * 获取歌词
   * @param lyricId 歌词ID
   */
  @Get('/lyric/get')
  getLyric(@Query('lyricId') lyricId: string): Promise<MusicLyric> {
    return this.musicService.findLyric(lyricId)
  }
  /**
   * 保存歌词
   * @param musicLyric 歌词信息
   * @param musicId 歌曲ID
   */
  @Post('/lyric/save')
  saveLyric(@Body(new ValidationPipe()) musicLyric: MusicLyric, @Query('musicId') musicId: string): Promise<MsgResult>{
    return this.musicService.saveLyric(musicLyric, musicId)
  }
}
