import { Model, Types } from 'mongoose'
import { Injectable, Logger } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { SystemConfig, SystemConfigEntity, ConfigValue } from '../interface/system-config.interface'
import { SystemUser, SystemUserEntity } from '../interface/system-user.interface'
import { SystemRole, SystemRoleEntity } from '../interface/system-role.interface'
import BaseQc from '../../common/base.qc'
import CommonUtils from '../../common/common.util'
import { Page, MsgResult, PageResult, TokenUserInfo } from '../../common/common.dto'

import * as jwt from 'jsonwebtoken'
import * as child_process from 'child_process'
import * as fs from 'fs'

@Injectable()
export default class SystemService {
  constructor(@InjectModel('SystemUser') private readonly systemUserModel: Model<SystemUser>,
              @InjectModel('SystemRole') private readonly systemRoleModel: Model<SystemRole>,
              @InjectModel('SystemConfig') private readonly systemConfigModel: Model<SystemConfig>) {}

  /**
   * 解析token并查询用户信息
   * @param token token字符串
   */
  async decryptUserInfo(token: string): Promise<SystemUser | null> {
    const privateKeyConfig: SystemConfig = await this.systemConfigModel.findOne({name: 'token_private_key'}).exec()
    const userId: string | Types.ObjectId = (jwt.verify(token, privateKeyConfig.value as string) as TokenUserInfo)._id
    if (userId) {
      return await this.systemUserModel.findById(userId)
    } else {
      return null
    }
  }
  /**
   * 查询用户列表
   * @param systemUser 查询条件
   * @param page 分页条件
   */
  async listUser(systemUser: SystemUserEntity, page: Page): Promise<PageResult> {
    const qc: BaseQc = {}
    if (systemUser.username) {
      const reg = new RegExp(CommonUtils.escapeRegexStr(systemUser.username))
      qc.$or = [{username: reg}, {realname: reg}]
    }
    const total = await this.systemUserModel.countDocuments(qc).exec()
    const data = await this.systemUserModel.find(qc, {password: 0}).skip(page.start).limit(page.limit).exec()
    return new PageResult(total, data)
  }
  /**
   * 校验用户是否存在
   * @param username 用户名
   * @param id 需要排除掉的用户ID
   */
  async checkUserExists(username: string, id: string): Promise<MsgResult> {
    interface ExistsQc { username: string, _id?: {$ne: string} }
    const qc: ExistsQc = { username }
    if (id) {
      qc._id = {$ne: id}
    }
    const cnt: number = await this.systemUserModel.countDocuments(qc).exec()
    return new MsgResult(true, null, {exists: !!cnt})
  }
  /**
   * 保存用户
   * @param systemUser 用户对象
   */
  async saveUser(systemUser: SystemUserEntity): Promise<MsgResult> {
    systemUser.password = CommonUtils.dataHash(systemUser.password, 'sha1')
    if (systemUser.role_ids) {
      systemUser.role_ids = systemUser.role_ids.map(roleId => new Types.ObjectId(roleId))
    }
    if (systemUser._id) { // 更新
      const userId = systemUser._id
      delete systemUser._id
      await this.systemUserModel.updateOne({_id: userId}, {$set: systemUser})
      return new MsgResult(true, '修改成功')
    } else { // 新增
      systemUser._id = new Types.ObjectId()
      await this.systemUserModel.create(systemUser)
      return new MsgResult(true, '保存成功')
    }
  }
  /**
   * 删除用户
   * @param _id 用户ID
   */
  async deleteUser(_id: string): Promise<MsgResult> {
    if (!_id) {
      return new MsgResult(false, '删除失败，未获得ID')
    }
    await this.systemUserModel.deleteOne({_id}).exec()
    return new MsgResult(true, '删除成功')
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
  async listRole(systemRole: SystemRole, page: Page): Promise<PageResult> {
    const qc: BaseQc = {}
    if (systemRole.name) {
      const reg = new RegExp(CommonUtils.escapeRegexStr(systemRole.name))
      qc.$or = [{name: reg}, {description: reg}]
    }
    const total = await this.systemRoleModel.countDocuments(qc).exec()
    const data = await this.systemRoleModel.find(qc).skip(page.start).limit(page.limit).exec()
    return new PageResult(total, data)
  }
  /**
   * 保存角色
   * @param systemRole 角色对象
   */
  async saveRole(systemRole: SystemRoleEntity): Promise<MsgResult> {
    if (systemRole._id) { // 更新
      const roleId = systemRole._id
      delete systemRole._id
      await this.systemRoleModel.updateOne({_id: roleId}, {$set: systemRole})
      return new MsgResult(true, '修改成功')
    } else { // 新增
      systemRole._id = new Types.ObjectId()
      await this.systemRoleModel.create(systemRole)
      return new MsgResult(true, '保存成功')
    }
  }
  /**
   * 删除角色
   * @param _id 角色ID
   */
  async deleteRole(_id: string): Promise<MsgResult> {
    if (!_id) {
      return new MsgResult(false, '删除失败，未获得ID')
    }
    await this.systemRoleModel.deleteOne({_id}).exec()
    return new MsgResult(true, '删除成功')
  }
  /**
   * 列出所有的配置项
   * @param systemConfig 查询条件
   * @param isPublic 是否只查询公开的配置项
   */
  async listConfig(systemConfig: SystemConfigEntity, isPublic: boolean): Promise<SystemConfig[]> {
    const qc: BaseQc = {}
    if (systemConfig.name) {
      qc.$or = [
        {name: new RegExp(CommonUtils.escapeRegexStr(systemConfig.name))},
        {description: new RegExp(CommonUtils.escapeRegexStr(systemConfig.name))},
      ]
    }
    if (isPublic) {
      qc.$where = function() { return this.is_public }
    }
    return this.systemConfigModel.find(qc).exec()
  }
  /**
   * 校验配置项名称是否存在
   * @param name 配置项名称
   * @param id 需要排除的ID(适用于修改)
   */
  async checkConfigExists(name: string, id: string): Promise<MsgResult> {
    interface ExistsQc { name: string, _id?: {$ne: string} }
    const qc: ExistsQc = { name }
    if (id) {
      qc._id = {$ne: id}
    }
    const cnt: number = await this.systemConfigModel.countDocuments(qc).exec()
    return new MsgResult(true, null, {exists: !!cnt})
  }
  /**
   * 新增或更新配置项
   * @param systemConfig 配置项内容
   */
  async saveConfig(systemConfig: SystemConfigEntity): Promise<MsgResult> {
    if (systemConfig._id) { // 更新
      const configId = systemConfig._id
      delete systemConfig._id
      await this.systemConfigModel.updateOne({_id: configId}, {$set: systemConfig})
      return new MsgResult(true, '修改成功')
    } else { // 新增
      systemConfig._id = new Types.ObjectId()
      await this.systemConfigModel.create(systemConfig)
      return new MsgResult(true, '保存成功')
    }
  }
  /**
   * 删除配置项
   * @param _id 配置项ID
   */
  async deleteConfig(_id: string): Promise<MsgResult> {
    if (!_id) {
      return new MsgResult(false, '删除失败，未获得ID')
    }
    await this.systemConfigModel.deleteOne({_id}).exec()
    return new MsgResult(true, '删除成功')
  }

  /**
   * 获取单个配置项
   * @param name 配置项名称
   * @param isPublic 是否为公开配置项
   */
  async getConfig(name: string, isPublic: boolean): Promise<ConfigValue> {
    const systemConfig: SystemConfig = await this.systemConfigModel.findOne({name, is_public: isPublic}).exec()
    if (systemConfig) {
      return systemConfig.value
    } else {
      return {}
    }
  }
  /**
   * 发布博客
   * @param blogZip zip压缩文件
   */
  async deployBlogZip(blogZip: Buffer): Promise<MsgResult> {
    const deployConfig = (await this.systemConfigModel.findOne({name: 'deploy_config'}).exec()).value as DeployConfig
    const tempPath: string = deployConfig.temp || '/tmp/blog'
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
    const deployPath: string = deployConfig.path

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

interface DeployConfig {
  temp?: string
  path: string
}
