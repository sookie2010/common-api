import { Model } from 'mongoose'
import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Hitokoto, HitokotoDto, HitokotoQc } from './hitokoto.interface'
import { Page, MsgResult } from '../common/common.dto'

@Injectable()
export default class HitokotoService {
  constructor(@InjectModel('Hitokoto') private readonly hitokotoModel: Model<Hitokoto>) {}

  /**
   * 随机获取一条一言
   * @param hitokotoDto 查询条件
   */
  async findOne(hitokotoDto: HitokotoDto): Promise<string | Hitokoto | MsgResult> {
    const searchParam = new HitokotoQc(hitokotoDto)
    return this.hitokotoModel.countDocuments(searchParam).exec().then((cnt: number) => {
      if (cnt === 0) {
        throw new Error('没有匹配的一言')
      }
      const skipNum = Math.floor(Math.random() * cnt)
      return this.hitokotoModel.find(searchParam).sort({number: 1}).skip(skipNum).limit(1).exec()
    }).then((hitokotos: Hitokoto[]) => {
      switch (hitokotoDto.format) {
        case 'text':
          return hitokotos[0].hitokoto
        case 'json':
        default:
          return hitokotos[0]
      }
    }).catch((err: Error) => {
      return new MsgResult(false, err.message)
    })
  }
  /**
   * 查询一言列表
   * @param hitokotoDto 查询条件
   * @param page 分页
   */
  async list(hitokotoDto: HitokotoDto, page: Page): Promise<Page> {
    const searchParam = new HitokotoQc(hitokotoDto)
    return this.hitokotoModel.countDocuments(searchParam).exec().then((cnt: number) => {
      page.total = cnt
      return this.hitokotoModel.find(searchParam).skip(page.start).limit(page.limit).exec()
    }).then((hitokotos: Hitokoto[]) => {
      page.data = hitokotos
      return page
    })
  }

  /**
   * 保存一言
   * @param hitokoto 一言
   */
  async save(hitokoto: Hitokoto): Promise<MsgResult> {
    return this.hitokotoModel.aggregate([{$group: {
      _id: 'max_number',
      number: { $max: '$number' },
    }}]).then((hitokotoMax: Hitokoto[]) => {
      if (hitokotoMax && hitokotoMax.length) {
        hitokoto.number = hitokotoMax[0].number + 1
      } else {
        hitokoto.number = 1
      }
      return this.hitokotoModel.create(hitokoto)
    }).then(() => {
      return new MsgResult(true, '保存成功')
    })
  }

  /**
   * 批量删除一言
   * @param ids 删除数据的ID们
   */
  async delete(ids: string[]): Promise<MsgResult> {
    return this.hitokotoModel.deleteMany({_id: {$in: ids}}).exec().then(() => {
      return new MsgResult(true, '删除成功')
    })
  }
}
