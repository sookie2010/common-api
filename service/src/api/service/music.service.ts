import { Model, Types } from 'mongoose'
import { Injectable, Logger } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Music, MusicDto, MusicQc, MusicLib } from '../interface/music.interface'
import { SystemConfig } from '../../system/interface/system-config.interface'
import { Page, PageResult, MsgResult } from '../../common/common.dto'
import { Writable } from 'stream'

const COS = require('cos-nodejs-sdk-v5')

@Injectable()
export default class MusicService {
  private tencentCosClient: any // 腾讯云对象存储调用客户端
  private cosSetting: TencentCosSetting
  constructor(@InjectModel('Music') private readonly musicModel: Model<Music>,
              @InjectModel('MusicLib') private readonly musicLibModel: Model<MusicLib>,
              @InjectModel('SystemConfig') systemConfigModel: Model<SystemConfig>) {
    systemConfigModel.findOne({name: 'tencent_cos_setting'}).exec().then((systemConfig: SystemConfig) => {
      this.cosSetting = systemConfig.value as TencentCosSetting
      this.tencentCosClient = new COS(this.cosSetting.setting)
    })
  }

  private listColumns = {_id: 1, name: 1, ext: 1, size: 1, title: 1, album: 1, artist: 1, lib_id: 1}
  /**
   * 分页查询歌曲列表
   * @param musicDto 查询条件
   * @param page 分页
   */
  async list(musicDto: MusicDto, page: Page): Promise<PageResult> {
    const searchParam = new MusicQc(musicDto)
    const total = await this.musicModel.countDocuments(searchParam).exec()
    const data = await this.musicModel.find(searchParam, this.listColumns).skip(page.start).limit(page.limit).exec()
    return new PageResult(total, data)
  }
  /**
   * 查询歌曲列表
   * @param musicDto 查询条件
   */
  async listAll(musicDto: MusicDto): Promise<Music[]> {
    const searchParam = new MusicQc(musicDto)
    return this.musicModel.find(searchParam, this.listColumns).exec()
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
    return (await this.musicModel.findById(id).exec()).album_image
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
      Bucket: this.cosSetting.Bucket,
      Region: this.cosSetting.Region,
      Key: musicLib.path + music.name,
      Output: writer,
    }, (err: object, data: object) => {
      if (err) { Logger.error(err) }
    })
  }

  /**
   * 修改所属歌单
   * @param id 歌曲ID
   * @param libId 歌单ID
   */
  async updateLib(id: string, libId: string): Promise<MsgResult> {
    const cnt: number = await this.musicLibModel.countDocuments({_id: libId}).exec()
    if (!cnt) {
      return new MsgResult(false, '歌单不存在')
    }
    await this.musicModel.updateOne({_id: id}, {$set: {lib_id: new Types.ObjectId(libId)}})
    return new MsgResult(true, '修改成功')
  }
}
/**
 * 腾讯云对象存储配置
 */
interface TencentCosSetting {
  Bucket: string // 存储桶名称
  Region: string // 所在地区简称
  setting: {
    Proxy?: string // 代理
    SecretId: string
    SecretKey: string
  }
}