import { Model, Types } from 'mongoose'
import { Injectable, Logger } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Music, MusicDto, MusicQc, MusicLib } from '../interface/music.interface'
import SystemConfig from '../interface/system-config.interface'
import { Page, MsgResult } from '../common/common.dto'
import COS from 'cos-nodejs-sdk-v5'
import { Writable } from 'stream'
import * as path from 'path'

@Injectable()
export default class MusicService {
  private bucket: string // 存储桶名称
  private region: string // 所在地区简称
  private tencentCosClient: any // 腾讯云对象存储调用客户端

  constructor(@InjectModel('Music') private readonly musicModel: Model<Music>,
              @InjectModel('MusicLib') private readonly musicLibModel: Model<MusicLib>,
              @InjectModel('SystemConfig') private readonly systemConfigModel: Model<SystemConfig>) {
                // tencent_cos_setting
    systemConfigModel.findOne({name: 'nos_setting'}).exec().then((systemConfig: SystemConfig) => {
      this.bucket = systemConfig.value['Bucket']
      this.region = systemConfig.value['Region']
      this.tencentCosClient = new COS(systemConfig.value['setting'])
    })
  }

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

  /**
   * 获取音乐专辑封面
   * @param id 音乐ID
   */
  async findAlbumImage(id: string): Promise<Buffer | undefined> {
    const music = await this.musicModel.findById(id).exec()
    return music.album_image
  }
  /**
   * 输出音乐文件 WritableStream
   * @param id 音乐ID
   * @param writer 输出流对象
   */
  async outputMusic(id: string, writer: Writable) {
    const music: Music = await this.musicModel.findById(id).exec()
    const musicLib: MusicLib = await this.musicLibModel.findById(music.lib_id).exec()
    this.tencentCosClient.getObject({
      Bucket: this.bucket,
      Region: this.region,
      Key: path.resolve(musicLib.path, music.name),
      Output: writer,
    }, function(err: object, data: object) {
      if (err) {
        Logger.error(err)
      }
    })
  }
}