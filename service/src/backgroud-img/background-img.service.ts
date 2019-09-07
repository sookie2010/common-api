import { Model, Types } from 'mongoose'
import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { BackgroundImg, BackgroundImgEntity } from './background-img.interface'
import { Page, MsgResult } from '../common/common.dto'

import * as crypto from 'crypto'

@Injectable()
export default class BackgroundImgService {
  constructor(@InjectModel('BackgroundImg') private readonly backgroundImgModel: Model<BackgroundImg>) {}

  /**
   * 随机获取一张背景图
   * @param id 图片ID(不传则随机获取一张)
   */
  async findOne(id?: string): Promise<BackgroundImg | MsgResult> {
    return this.backgroundImgModel.countDocuments().exec().then((cnt: number) => {
      if (cnt === 0) {
        throw new Error('无背景图数据')
      }
      const skipNum = Math.floor(Math.random() * cnt)
      if(id) {
        return this.backgroundImgModel.find({_id: id}).exec()
      } else {
        return this.backgroundImgModel.find().sort({created_at: 1}).skip(skipNum).limit(1).exec()
      }
    }).then((backgroundImgs: BackgroundImg[]) => {
      return backgroundImgs[0]
    }).catch((err: Error) => {
      return new MsgResult(false, err.message)
    })
  }
  /**
   * 查询背景图列表
   * @param page 分页
   */
  async list(page: Page): Promise<Page> {
    return this.backgroundImgModel.countDocuments().exec().then((cnt: number) => {
      page.total = cnt
      return this.backgroundImgModel.find({}, {img: 0}).skip(page.start).limit(page.limit).exec()
    }).then((backgroundImgs: BackgroundImg[]) => {
      page.data = backgroundImgs
      return page
    })
  }

  /**
   * 保存背景图
   * @param backgroundImgEntity 背景图
   */
  async save(backgroundImgEntity: BackgroundImgEntity): Promise<MsgResult> {
    backgroundImgEntity.created_at = new Date()
    backgroundImgEntity._id = new Types.ObjectId()

    const fsHash = crypto.createHash('md5')
    fsHash.update(backgroundImgEntity.img)
    backgroundImgEntity.hash = fsHash.digest('hex')

    return this.backgroundImgModel.create(backgroundImgEntity).then(() => {
      return new MsgResult(true, '保存成功')
    })
  }

  /**
   * 批量删除背景图
   * @param ids 删除数据的ID们
   */
  async delete(ids: string[]): Promise<MsgResult> {
    return this.backgroundImgModel.deleteMany({_id: {$in: ids}}).exec().then(() => {
      return new MsgResult(true, '删除成功')
    })
  }
}
