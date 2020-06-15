import { Model, Types } from 'mongoose'
import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Page, PageResult } from '../common/common.dto'
import { Province, ProvinceEntity, ProvinceQc } from '../interface/province.interface'

@Injectable()
export default class ProvinceService {
  constructor(@InjectModel('Province') private readonly provinceModel: Model<Province>) {}

  /**
   * 查询行政区划列表
   * @param provinceEntity 查询条件
   */
  async listAll(provinceEntity: ProvinceEntity): Promise<Province[]> {
    const searchParam = new ProvinceQc(provinceEntity, true)
    return this.provinceModel.find(searchParam).exec()
  }

  /**
   * 查询行政区划列表(分页)
   * @param provinceEntity 查询条件
   * @param page 分页
   */
  async list(provinceEntity: ProvinceEntity, page: Page): Promise<PageResult> {
    const searchParam = new ProvinceQc(provinceEntity, false)
    const total = await this.provinceModel.countDocuments(searchParam).exec()
    const data = await this.provinceModel.find(searchParam).skip(page.start).limit(page.limit).exec()
    return new PageResult(total, data)
  }
}
