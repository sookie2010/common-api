import { Model, Types } from 'mongoose'
import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import SystemConfig from '../system/system-config.interface'
import SystemUser from './system-user.interface'
import BaseQc from '../common/base.qc';
import CommonUtils from '../common/common.util'
import { MsgResult } from '../common/common.dto';

@Injectable()
export default class SystemService {
  constructor(@InjectModel('SystemUser') private readonly systemUserModel: Model<SystemUser>,
              @InjectModel('SystemConfig') private readonly systemConfigModel: Model<SystemConfig>) {}
  /**
   * 列出所有的配置项
   * @param systemConfig 查询条件
   */
  async listConfig(systemConfig: SystemConfig): Promise<SystemConfig[]> {
    const qc: BaseQc = {}
    if (systemConfig.name) {
      qc.$or = [
        {name: new RegExp(CommonUtils.escapeRegexStr(systemConfig.name))},
        {description: new RegExp(CommonUtils.escapeRegexStr(systemConfig.name))},
      ]
    }
    return this.systemConfigModel.find(qc).exec()
  }
  /**
   * 新增或更新配置项
   * @param systemConfig 配置项内容
   */
  async updateConfig(systemConfig: SystemConfig): Promise<MsgResult> {
    if(systemConfig._id) { // 更新
      let configId = systemConfig._id
      delete systemConfig._id
      await this.systemConfigModel.updateOne({_id: configId}, {$set: systemConfig})
      return Promise.resolve(new MsgResult(true, '修改成功'))
    } else { // 新增
      systemConfig._id = new Types.ObjectId()
      await this.systemConfigModel.create(systemConfig)
      return Promise.resolve(new MsgResult(true, '保存成功'))
    }
  }
  /**
   * 删除配置项
   * @param _id 配置项ID
   */
  async deleteConfig(_id: string): Promise<MsgResult> {
    if(!_id) {
      return Promise.resolve(new MsgResult(false, '删除失败，未获得ID'))
    }
    await this.systemConfigModel.deleteOne({_id}).exec()
    return Promise.resolve(new MsgResult(true, '删除成功'))
  }
}
