import { Model, Types } from 'mongoose'
import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { PhotoWallDto, PhotoWallQc } from './photo-wall.interface'
import { PhotoWall } from './photo-wall.interface'
import SystemConfig from '../system/system-config.interface'
import { FileDto, Page } from '../common/common.dto'

const images = require('images')
const nos = require('@xgheaven/nos-node-sdk')
const crypto = require('crypto')

@Injectable()
export default class PhotoWallService {
  client: {
    putObject({objectKey: string, body: Buffer}) : Promise<object>
    deleteMultiObject({objectKeys: any}) : Promise<object>}

  constructor(@InjectModel('PhotoWall') private readonly photoWallModel: Model<PhotoWall>,
              @InjectModel('SystemConfig') private readonly systemConfigModel: Model<SystemConfig>) {

    systemConfigModel.findOne({name: 'nos_setting'}).exec().then((systemConfig: SystemConfig) => {
      // 网易云对象存储接口
      this.client = new nos.NosClient(systemConfig.value)
    })
  }

  /**
   * 分页查询照片墙图片数据
   * @param start 起始数据行数(第一行是0)
   * @param limit 每页数据条数
   */
  async queryPage(page: Page): Promise<Page> {
    return this.photoWallModel.countDocuments({}).exec().then((cnt: number) => {
      if (cnt === 0) {
        throw new Error('没有图片数据')
      }
      page.total = cnt
      return this.photoWallModel.find({}).skip(~~page.start).limit(~~page.limit).exec()
    }).then((photoWalls: PhotoWall[]) => {
      page.data = photoWalls
      return page
    }).catch((err: Error) => {
      return {msg: err.message}
    })
  }

  /**
   * 管理端分页查询
   * @param photoWallDto 查询条件
   * @param page 分页信息
   */
  async list(photoWallDto: PhotoWallDto, page: Page): Promise<Page> {
    const searchParam: PhotoWallQc = {}
    if (photoWallDto.name) { // mongodb的模糊搜索使用正则形式
      searchParam.name = {$regex: new RegExp(photoWallDto.name)}
    }
    if (~~photoWallDto.widthMin || ~~photoWallDto.widthMax) {
      searchParam.width = {}
      if (~~photoWallDto.widthMin) {
        searchParam.width.$gte = ~~photoWallDto.widthMin
      }
      if (~~photoWallDto.widthMax) {
        searchParam.width.$lte = ~~photoWallDto.widthMax
      }
    }
    if (~~photoWallDto.heightMin || ~~photoWallDto.heightMax) {
      searchParam.height = {}
      if (~~photoWallDto.heightMin) {
        searchParam.height.$gte = ~~photoWallDto.heightMin
      }
      if (~~photoWallDto.heightMax) {
        searchParam.height.$lte = ~~photoWallDto.heightMax
      }
    }
    return this.photoWallModel.countDocuments(searchParam).exec().then((cnt: number) => {
      page.total = cnt
      return this.photoWallModel.find(searchParam).skip(~~page.start).limit(~~page.limit).exec()
    }).then((photoWalls: PhotoWall[]) => {
      page.data = photoWalls
      return page
    })
  }
  /**
   * 保存照片信息
   * @param photowall 照片信息
   */
  async save(image: FileDto): Promise<object> {
    const ext = image.originalname.substr(image.originalname.indexOf('.') + 1) // 文件扩展名
    const photowall: PhotoWall = {}
    photowall._id = new Types.ObjectId()
    const img = images(image.buffer)
    // 获取图片宽高
    photowall.width = img.width()
    photowall.height = img.height()

    // 获取图片MD5值
    const fsHash = crypto.createHash('md5')
    fsHash.update(image.buffer)
    photowall.md5 = fsHash.digest('hex')
    
    const md5Check: number = await this.photoWallModel.countDocuments({md5: photowall.md5}).exec()
    if(md5Check > 0) {
      return Promise.resolve({status: false, msg: '图片已存在'})
    }
    const thumbnailWidth: SystemConfig = await this.systemConfigModel.findOne({name: 'thumbnail_width'}).exec()
    // 生成缩略图
    img.resize(thumbnailWidth.value)
    const thumbnailBuffer = img.encode(ext, {operation: 50})
    const maxIndex: PhotoWall[] = await this.photoWallModel.aggregate([{$group: {
      _id: 'max_index',
      index: { $max: '$index' },
    }}])
    const lastIndex = maxIndex[0].index,
      groupId = Math.floor(lastIndex / 50) + 1, // 当前分组
      len = (lastIndex + 1).toString().length // 编号
    let num = ''
    for (let i = 0 ; i < 5 - len ; i++) {
      num += '0'
    }
    photowall.name = `photo-wall/${groupId}/pic_${num}${lastIndex + 1}.${ext}`
    photowall.thumbnail = `photo-wall/${groupId}/pic_${num}${lastIndex + 1}_thumbnail.${ext}`
    photowall.index = lastIndex + 1

    const putResult:{eTag?: string} = await this.client.putObject({
      objectKey: photowall.name,
      body: image.buffer,
    })
    const eTag = putResult.eTag.replace(/"/g, '')
    if (photowall.md5 === eTag) {
      console.log(`${photowall.name} 上传成功, md5:${eTag}`)
      // 上传缩略图
      await this.client.putObject({
        objectKey: photowall.thumbnail,
        body: thumbnailBuffer,
      })
    } else {
      console.warn(`${photowall.name} 上传出错, md5值不一致`)
      console.warn(`===> 本地文件: ${photowall.md5}, 接口返回: ${eTag}`)
      return Promise.resolve({status: false, msg: `${photowall.name} 上传出错, md5值不一致`})
    }
    await this.photoWallModel.create(photowall)
    return Promise.resolve({status: true, msg: '上传成功'})
  }

  /**
   * 批量删除照片信息
   * @param ids 删除数据的ID们
   */
  async delete(ids: string[]): Promise<string> {
    return this.photoWallModel.find({_id: {$in: ids}}).exec().then((photoWalls: PhotoWall[]) => {
      const deleteFileNames = []
      photoWalls.forEach((photoWall: PhotoWall) => {
        deleteFileNames.push(photoWall.name)
        deleteFileNames.push(photoWall.thumbnail)
      })
      return this.client.deleteMultiObject({objectKeys: deleteFileNames})
    }).then(err => {
      if (err) { console.error(err) }
      return this.photoWallModel.deleteMany({_id: {$in: ids}}).exec()
    })
  }
  /**
   * 获取图片存储CDN地址
   */
  async getPictureCdn(): Promise<string> {
    const pictureCdnConfig: SystemConfig = await this.systemConfigModel.findOne({name: 'picture_cdn'}).exec()
    return Promise.resolve(pictureCdnConfig.value.toString())
  }
}
