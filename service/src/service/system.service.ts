import { Model, Types } from 'mongoose'
import { Injectable, Logger } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import SystemConfig from '../interface/system-config.interface'
import SystemUser from '../interface/system-user.interface'
import SystemRole from '../interface/system-role.interface'
import BaseQc from '../common/base.qc'
import CommonUtils from '../common/common.util'
import { Page, MsgResult } from '../common/common.dto'

import * as child_process from 'child_process'
import * as fs from 'fs'

@Injectable()
export default class SystemService {
  constructor(@InjectModel('SystemUser') private readonly systemUserModel: Model<SystemUser>,
              @InjectModel('SystemRole') private readonly systemRoleModel: Model<SystemRole>,
              @InjectModel('SystemConfig') private readonly systemConfigModel: Model<SystemConfig>) {}

  /**
   * 查询用户列表
   * @param systemUser 查询条件
   * @param page 分页条件
   */
  async listUser(systemUser: SystemUser, page: Page): Promise<Page> {
    const qc: BaseQc = {}
    if (systemUser.username) {
      let reg = new RegExp(CommonUtils.escapeRegexStr(systemUser.username))
      qc.$or = [{username: reg},{realname: reg}]
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
    systemUser.password = CommonUtils.dataHash(systemUser.password, 'sha1')
    if(systemUser.role_ids) {
      systemUser.role_ids = systemUser.role_ids.map(roleId => new Types.ObjectId(roleId))
    }
    if (systemUser._id) { // 更新
      const userId = systemUser._id
      delete systemUser._id
      await this.systemUserModel.updateOne({_id: userId}, {$set: systemUser})
      return Promise.resolve(new MsgResult(true, '修改成功'))
    } else { // 新增
      systemUser._id = new Types.ObjectId()
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
   * 查询角色(无分页)
   */
  async listRoleAll(): Promise<SystemRole[]> {
    return await this.systemRoleModel.find().exec()
  }
  /**
   * 查询角色列表
   * @param systemUser 查询条件
   * @param page 分页条件
   */
  async listRole(systemRole: SystemRole, page: Page): Promise<Page> {
    const qc: BaseQc = {}
    if (systemRole.name) {
      let reg = new RegExp(CommonUtils.escapeRegexStr(systemRole.name))
      qc.$or = [{name: reg},{description: reg}]
    }
    return this.systemRoleModel.countDocuments(qc).exec().then((cnt: number) => {
      page.total = cnt
      return this.systemRoleModel.find(qc).skip(page.start).limit(page.limit).exec()
    }).then((systemRoles: SystemRole[]) => {
      page.data = systemRoles
      return page
    })
  }
  /**
   * 保存角色
   * @param systemUser 角色对象
   */
  async saveRole(systemRole: SystemRole): Promise<MsgResult> {
    if (systemRole._id) { // 更新
      const roleId = systemRole._id
      delete systemRole._id
      await this.systemRoleModel.updateOne({_id: roleId}, {$set: systemRole})
      return Promise.resolve(new MsgResult(true, '修改成功'))
    } else { // 新增
      systemRole._id = new Types.ObjectId()
      await this.systemRoleModel.create(systemRole)
      return Promise.resolve(new MsgResult(true, '保存成功'))
    }
  }
  /**
   * 删除角色
   * @param _id 角色ID
   */
  async deleteRole(_id: string): Promise<MsgResult> {
    if (!_id) {
      return Promise.resolve(new MsgResult(false, '删除失败，未获得ID'))
    }
    await this.systemRoleModel.deleteOne({_id}).exec()
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
    if (!_id) {
      return Promise.resolve(new MsgResult(false, '删除失败，未获得ID'))
    }
    await this.systemConfigModel.deleteOne({_id}).exec()
    return Promise.resolve(new MsgResult(true, '删除成功'))
  }

  /**
   * 获取单个配置项
   * @param name 配置项名称
   * @param isPublic 是否为公开配置项
   */
  async getConfig(name: string, isPublic: boolean): Promise<object> {
    const systemConfig: SystemConfig = await this.systemConfigModel.findOne({name, is_public: isPublic}).exec()
    if (systemConfig) {
      return Promise.resolve(systemConfig.value)
    } else {
      return Promise.resolve({})
    }
  }
  /**
   * 发布博客
   * @param blogZip zip压缩文件
   */
  async deployBlogZip(blogZip: Buffer): Promise<MsgResult> {

    const deployConfig = await this.systemConfigModel.findOne({name: 'deploy_config'}).exec()
    const tempPath: string = deployConfig.value['temp'] || '/tmp/blog'
    // 删除可能存在的解压后的目录
    CommonUtils.deleteFolderRecursive(tempPath)
    // 创建临时目录
    fs.mkdirSync(tempPath, {recursive: true})
    fs.writeFileSync(`${tempPath}/BlogDeploy.zip`, blogZip)
    try {
      child_process.execSync('unzip -q BlogDeploy.zip -d BlogDeploy', {cwd: tempPath})
    } catch (err) {
      Logger.error(`解压出错 ${err.toString()}`)
      return new MsgResult(false, `解压出错 ${err.toString()}`)
    }
    const deployPath: string = deployConfig.value['path']

    if (!deployPath) {
      return new MsgResult(false, '未配置deploy_config.path(发布路径)')
    }
    // 删除目前已发布的文件
    CommonUtils.deleteFolderRecursive(deployPath)
    // 拷贝解压后的文件到发布目录
    CommonUtils.copyFolderRecursive(`${tempPath}/BlogDeploy`, deployPath)

    return new MsgResult(true, '发布成功')
  }
}
