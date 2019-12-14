import { Document, Types } from 'mongoose'
import CommonUtils from '../common/common.util'

export interface ProvinceEntity {
  _id?: Types.ObjectId
  code?: string // 编码
  name?: string // 名称
  province?: string // 省
  city?: string // 市
  area?: string // 县/区
  town?: string // 乡镇
}

export interface Province extends Document, ProvinceEntity {
  _id: Types.ObjectId
}

export class ProvinceQc {
  name?: {$regex: RegExp}
  province?: string
  city?: {$exists: boolean} | string
  area?: {$exists: boolean} | string
  town?: {$exists: boolean} | string
  /**
   * 构造符合mongodb格式的查询条件
   * @param provinceEntity 查询条件
   * @param isDirect 是否只查询直属下级
   */
  constructor(provinceEntity: ProvinceEntity, isDirect: boolean) {
    if (provinceEntity.name) { // mongodb的模糊搜索使用正则形式
      this.name = {$regex: new RegExp(CommonUtils.escapeRegexStr(provinceEntity.name))}
    }
    if (!provinceEntity.province && isDirect) {
      // 只查询所有省/直辖市列表
      this.city = {$exists: false}
    } else if (provinceEntity.province && !provinceEntity.city && !provinceEntity.area) {
      // 查询指定省份下的市列表
      this.province = provinceEntity.province
      if (isDirect) {
        this.city = {$exists: true}
        this.area = {$exists: false}
      }
    } else if (provinceEntity.province && provinceEntity.city && !provinceEntity.area) {
      // 查询指定市下的县/区列表
      this.province = provinceEntity.province
      this.city = provinceEntity.city
      if (isDirect) {
        this.area = {$exists: true}
        this.town = {$exists: false}
      }
    } else {
      this.province = provinceEntity.province
      this.city = provinceEntity.city
      this.area = provinceEntity.area
    }
  }
}
