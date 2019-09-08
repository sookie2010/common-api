import { Model, Types } from 'mongoose'
import { Injectable, Logger } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { PhotoWall, PhotoWallEntity, PhotoWallDto, PhotoWallQc } from './photo-wall.interface'
import SystemConfig from '../system/system-config.interface'
import { FileEntity, Page, MsgResult } from '../common/common.dto'
import CommonUtils from '../common/common.util'

import { NosClient, NosClientOptions } from '@xgheaven/nos-node-sdk'
import * as sharp from 'sharp'

@Injectable()
export default class PhotoWallService {
  private client: NosClient

  constructor(@InjectModel('PhotoWall') private readonly photoWallModel: Model<PhotoWall>,
              @InjectModel('SystemConfig') private readonly systemConfigModel: Model<SystemConfig>) {

    systemConfigModel.findOne({name: 'nos_setting'}).exec().then((systemConfig: SystemConfig) => {
      // 网易云对象存储接口
      this.client = new NosClient(systemConfig.value as NosClientOptions)
    })
  }

  /**
   * 分页查询照片墙图片数据
   * @param start 起始数据行数(第一行是0)
   * @param limit 每页数据条数
   */
  async queryPage(page: Page): Promise<Page | MsgResult> {
    return this.photoWallModel.countDocuments({}).exec().then((cnt: number) => {
      if (cnt === 0) {
        throw new Error('没有图片数据')
      }
      page.total = cnt
      return this.photoWallModel.find({}).skip(page.start).limit(page.limit).exec()
    }).then((photoWalls: PhotoWall[]) => {
      page.data = photoWalls
      return page
    }).catch((err: Error) => {
      return new MsgResult(false, err.message)
    })
  }

  /**
   * 管理端分页查询
   * @param photoWallDto 查询条件
   * @param page 分页信息
   */
  async list(photoWallDto: PhotoWallDto, page: Page): Promise<Page> {
    const searchParam = new PhotoWallQc(photoWallDto)
    return this.photoWallModel.countDocuments(searchParam).exec().then((cnt: number) => {
      page.total = cnt
      return this.photoWallModel.find(searchParam).skip(page.start).limit(page.limit).exec()
    }).then((photoWalls: PhotoWall[]) => {
      page.data = photoWalls
      return page
    })
  }
  /**
   * 保存照片信息
   * @param photowall 照片信息
   */
  async save(image: FileEntity): Promise<MsgResult> {
    const imgSharp = sharp(image.buffer)
    const imgMeta = await imgSharp.metadata()
    const ext = imgMeta.format // 文件扩展名
    // 获取图片宽高
    const photowall: PhotoWallEntity = {
      width: imgMeta.width,
      height: imgMeta.height,
    }
    // 获取图片MD5值
    photowall.md5 = CommonUtils.dataHash(image.buffer, 'md5')

    const md5Check: number = await this.photoWallModel.countDocuments({md5: photowall.md5}).exec()
    if (md5Check > 0) {
      return Promise.resolve(new MsgResult(false, '图片已存在'))
    }
    const thumbnailWidth: SystemConfig = await this.systemConfigModel.findOne({name: 'thumbnail_width'}).exec()
    // 生成缩略图
    let thumbnailBuffer: Buffer
    if (photowall.width > ~~thumbnailWidth.value) {
      thumbnailBuffer = await imgSharp.resize(~~thumbnailWidth.value).toBuffer()
    } else {
      thumbnailBuffer = image.buffer
    }
    const maxIndex: PhotoWall[] = await this.photoWallModel.aggregate([{$group: {
      _id: 'max_index',
      index: { $max: '$index' },
    }}])
    const lastIndex = maxIndex[0].index
    const groupId = Math.floor(lastIndex / 50) + 1 // 当前分组
    const len = (lastIndex + 1).toString().length // 编号
    let num = ''
    for (let i = 0 ; i < 5 - len ; i++) {
      num += '0'
    }
    photowall.name = `photo-wall/${groupId}/pic_${num}${lastIndex + 1}.${ext}`
    photowall.thumbnail = `photo-wall/${groupId}/pic_${num}${lastIndex + 1}_thumbnail.${ext}`
    photowall.index = lastIndex + 1

    const putResult: {eTag?: string} = await this.client.putObject({
      objectKey: photowall.name,
      body: image.buffer,
    })
    const eTag = putResult.eTag.replace(/"/g, '')
    if (photowall.md5 === eTag) {
      Logger.log(`${photowall.name} 上传成功, md5:${eTag}`)
      // 上传缩略图
      await this.client.putObject({
        objectKey: photowall.thumbnail,
        body: thumbnailBuffer,
      })
    } else {
      Logger.warn(`${photowall.name} 上传出错, md5值不一致`)
      Logger.warn(`===> 本地文件: ${photowall.md5}, 接口返回: ${eTag}`)
      return Promise.resolve(new MsgResult(false, `${photowall.name} 上传出错, md5值不一致`))
    }
    photowall._id = new Types.ObjectId()
    await this.photoWallModel.create(photowall)
    return Promise.resolve(new MsgResult(true, '上传成功'))
  }

  /**
   * 批量删除照片信息
   * @param ids 删除数据的ID们
   */
  async delete(ids: string[]): Promise<MsgResult> {
    return this.photoWallModel.find({_id: {$in: ids}}).exec().then((photoWalls: PhotoWall[]) => {
      const deleteFileNames = []
      photoWalls.forEach((photoWall: PhotoWall) => {
        deleteFileNames.push(photoWall.name)
        deleteFileNames.push(photoWall.thumbnail)
      })
      return this.client.deleteMultiObject({objectKeys: deleteFileNames})
    }).then(err => {
      if (err) { Logger.error(err) }
      return this.photoWallModel.deleteMany({_id: {$in: ids}}).exec()
    }).then(() => {
      return Promise.resolve(new MsgResult(true, '删除成功'))
    })
  }
}
