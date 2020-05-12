import { Model, Types } from 'mongoose'
import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Music, MusicDto, MusicQc, MusicLib } from '../interface/music.interface'
import { Page, MsgResult } from '../common/common.dto'

@Injectable()
export default class MusicService {
  constructor(@InjectModel('Music') private readonly musicModel: Model<Music>,
              @InjectModel('MusicLib') private readonly musicLibModel: Model<MusicLib>) {}

  private listColumns = {_id: 1, name: 1, ext: 1, size: 1, title: 1, album: 1, artist: 1, lib_id: 1}
  /**
   * 查询歌曲列表
   * @param musicDto 查询条件
   * @param page 分页
   */
  async list(musicDto: MusicDto, page: Page): Promise<Page> {
    const searchParam = new MusicQc(musicDto)
    return this.musicModel.countDocuments(searchParam).exec().then((cnt: number) => {
      page.total = cnt
      return this.musicModel.find(searchParam, this.listColumns).skip(page.start).limit(page.limit).exec()
    }).then((musics: Music[]) => {
      page.data = musics
      return page
    })
  }
  /**
   * 获取所有类型
   */
  async listExts(): Promise<string[]> {
    return (await this.musicModel.aggregate([
      {$unwind: '$ext'},
      {$group: {_id: '$ext'}},
    ])).map((item: {_id: string}) => item._id)
  }

  /**
   * 获取所有歌单
   */
  async listLibs(): Promise<MusicLib[]> {
    return this.musicLibModel.find().exec()
  }
}