import { Model, Types } from 'mongoose'
import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { SourceImage, SourceImageEntity } from '../interface/source-image.interface'
import { Page, MsgResult } from '../common/common.dto'
import CommonUtils from '../common/common.util'

@Injectable()
export default class SourceImageService {
  constructor(@InjectModel('SourceImage') private readonly sourceImageModel: Model<SourceImage>) {}

  /**
   * 随机获取一张背景图
   * @param id 图片ID(不传则随机获取一张)
   * @param label 图片标签
   */
  async findOne(id: string, label: string): Promise<SourceImage> {
    if (id) {
      return await this.sourceImageModel.findOne({_id: id}).exec()
    }
    if (!label) {
      throw new Error('未获取到图片label')
    }
    const cnt = await this.sourceImageModel.countDocuments({label}).exec()
    if (cnt === 0) {
      throw new Error('无匹配的图片数据')
    }
    const skipNum = Math.floor(Math.random() * cnt)
    const sourceImages = await this.sourceImageModel.find({label}).sort({created_at: 1}).skip(skipNum).limit(1).exec()
    return sourceImages[0]
  }
  /**
   * 查询背景图列表
   * @param page 分页
   */
  async list(page: Page): Promise<Page> {
    return this.sourceImageModel.countDocuments().exec().then((cnt: number) => {
      page.total = cnt
      return this.sourceImageModel.find({}, {img: 0}).skip(page.start).limit(page.limit).exec()
    }).then((sourceImages: SourceImage[]) => {
      page.data = sourceImages
      return page
    })
  }

  /**
   * 保存背景图
   * @param sourceImageEntity 背景图
   */
  async save(sourceImageEntity: SourceImageEntity): Promise<MsgResult> {
    sourceImageEntity.hash = CommonUtils.dataHash(sourceImageEntity.img, 'md5')
    sourceImageEntity._id = new Types.ObjectId()
    return this.sourceImageModel.create(sourceImageEntity).then(() => {
      return new MsgResult(true, '保存成功')
    })
  }

  /**
   * 批量删除背景图
   * @param ids 删除数据的ID们
   */
  async delete(ids: string[]): Promise<MsgResult> {
    return this.sourceImageModel.deleteMany({_id: {$in: ids}}).exec().then(() => {
      return new MsgResult(true, '删除成功')
    })
  }

  /**
   * 修改图片标签
   * @param id 图片ID
   * @param label 图片标签数组
   */
  async updateLabel(id: string, label: string[]): Promise<MsgResult> {
    /*
    mongodb数组添加元素  $addToSet
    删除元素  $pull
    */
    return this.sourceImageModel.updateOne({_id: id}, { $set: { label }}).then(() => {
      return new MsgResult(true, '修改标签成功')
    })
  }
}
