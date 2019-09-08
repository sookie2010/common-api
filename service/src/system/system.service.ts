import { Model } from 'mongoose'
import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import SystemConfig from '../system/system-config.interface'
import SystemUser from './system-user.interface'
import BaseQc from '../common/base.qc';
import CommonUtils from '../common/common.util'
import { Page, MsgResult } from '../common/common.dto';

import * as crypto from 'crypto'

@Injectable()
export default class SystemService {
  constructor(@InjectModel('SystemUser') private readonly systemUserModel: Model<SystemUser>,
              @InjectModel('SystemConfig') private readonly systemConfigModel: Model<SystemConfig>) {}

  /**
   * 查询用户列表
   * @param systemUser 查询条件
   * @param page 分页条件
   */
  async listUser(systemUser: SystemUser, page: Page): Promise<Page> {
    const qc: BaseQc = {}
    if (systemUser.username) {
      qc.$or = [
        {username: new RegExp(CommonUtils.escapeRegexStr(systemUser.username))},
        {realname: new RegExp(CommonUtils.escapeRegexStr(systemUser.username))},
      ]
    }
    return this.systemUserModel.countDocuments(qc).exec().then((cnt: number) => {
      page.total = cnt
      return this.systemUserModel.find(qc, {password: 0}).skip(page.start).limit(page.limit).exec()
    }).then((systemUsers: SystemUser[]) => {
      page.data = systemUsers
      return page
    })
  }
  /**
   * 保存用户
   * @param systemUser 用户对象
   */
  async saveUser(systemUser: SystemUser): Promise<MsgResult> {
    const pwdHashed = crypto.createHash('sha1')
        .update(systemUser.password)
        .digest('hex')
    systemUser.password = pwdHashed
    if (systemUser._id) { // 更新
      const userId = systemUser._id
      delete systemUser._id
      await this.systemUserModel.updateOne({_id: userId}, {$set: systemUser})
      return Promise.resolve(new MsgResult(true, '修改成功'))
    } else { // 新增
      await this.systemUserModel.create(systemUser)
      return Promise.resolve(new MsgResult(true, '保存成功'))
    }
  }
  /**
   * 删除用户
   * @param _id 用户ID
   */
  async deleteUser(_id: string): Promise<MsgResult> {
    if (!_id) {
      return Promise.resolve(new MsgResult(false, '删除失败，未获得ID'))
    }
    await this.systemUserModel.deleteOne({_id}).exec()
    return Promise.resolve(new MsgResult(true, '删除成功'))
  }
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
  async saveConfig(systemConfig: SystemConfig): Promise<MsgResult> {
    if (systemConfig._id) { // 更新
      const configId = systemConfig._id
      delete systemConfig._id
      await this.systemConfigModel.updateOne({_id: configId}, {$set: systemConfig})
      return Promise.resolve(new MsgResult(true, '修改成功'))
    } else { // 新增
      await this.systemConfigModel.create(systemConfig)
      return Promise.resolve(new MsgResult(true, '保存成功'))
    }
  }
  /**
   * 删除配置项
   * @param _id 配置项ID
   */
  async deleteConfig(_id: string): Promise<MsgResult> {
    if (!_id) {
      return Promise.resolve(new MsgResult(false, '删除失败，未获得ID'))
    }
    await this.systemConfigModel.deleteOne({_id}).exec()
    return Promise.resolve(new MsgResult(true, '删除成功'))
  }

  /**
   * 获取单个配置项
   */
  async getConfig(name: string): Promise<object> {
    const systemConfig: SystemConfig = await this.systemConfigModel.findOne({name, is_public: true}).exec()
    if (systemConfig) {
      return Promise.resolve(systemConfig.value)
    } else {
      return Promise.resolve({})
    }
  }
}
