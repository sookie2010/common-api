import { Model, Types } from 'mongoose'
import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { MusicLib, MusicLibDto, MusicLibQc } from '../interface/music-lib.interface'
import { Page, MsgResult } from '../common/common.dto'

@Injectable()
export default class MusicLibService {
  constructor(@InjectModel('Music') private readonly musicLibModel: Model<MusicLib>) {}

  private listColumns = {_id: 1, name: 1, size: 1, title: 1, album: 1, artist: 1}
  /**
   * 查询歌曲列表
   * @param musicLibDto 查询条件
   * @param page 分页
   */
  async list(musicLibDto: MusicLibDto, page: Page): Promise<Page> {
    const searchParam = new MusicLibQc(musicLibDto)
    return this.musicLibModel.countDocuments(searchParam).exec().then((cnt: number) => {
      page.total = cnt
      return this.musicLibModel.find(searchParam, this.listColumns).skip(page.start).limit(page.limit).exec()
    }).then((musicLibs: MusicLib[]) => {
      page.data = musicLibs
      return page
    })
  }
  /**
   * 获取所有类型
   */
  async listExts(): Promise<string[]> {
    return (await this.musicLibModel.aggregate([
      {$unwind: '$ext'},
      {$group: {_id: '$ext'}},
    ])).map((item: {_id: string}) => item._id)
  }
}