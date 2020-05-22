import { Model } from 'mongoose'
import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import SystemConfig from '../interface/system-config.interface'
import SystemUser from '../interface/system-user.interface'
import SystemRole from '../interface/system-role.interface'
import { MsgResult } from '../common/common.dto'
import CommonUtils from '../common/common.util'

import * as jwt from 'jsonwebtoken'

@Injectable()
export default class CommonService {

  constructor(@InjectModel('SystemConfig') private readonly systemConfigModel: Model<SystemConfig>,
              @InjectModel('SystemUser') private readonly systemUserModel: Model<SystemUser>,
              @InjectModel('SystemRole') private readonly systemRoleModel: Model<SystemRole>,
  ) {}

  private tokenField = {_id: 1, username: 1, realname: 1, role_ids: 1}
  /**
   * 登录
   * @param systemUser 用户信息
   */
  async login(systemUser: SystemUser): Promise<object> {
    systemUser.password = CommonUtils.dataHash(systemUser.password, 'sha1')
    const loginUser: SystemUser = await this.systemUserModel.findOne(systemUser, this.tokenField).exec()
    if (!loginUser) {
      return Promise.resolve({msg: '用户名/密码错误'})
    }
    const userInfo = {
      _id: loginUser._id,
      username: loginUser.username,
      realname: loginUser.realname,
      role_ids: loginUser.role_ids,
    }
    const tokenKeyConfig: SystemConfig = await this.systemConfigModel.findOne({name: 'token_private_key'}).exec()
    const token = jwt.sign(userInfo, tokenKeyConfig.value.toString()/*秘钥*/, {
      expiresIn: '7d', /*过期时间*/
    })
    return Promise.resolve({token, userInfo})
  }
  /**
   * 访客登陆(无需账号密码, 分配一个只具备GET请求权限的用户)
   */
  async guestLogin(): Promise<MsgResult> {
    const roles: SystemRole[] = await this.systemRoleModel.find({methods: ['GET']}).exec()
    if (!roles.length) {
      return new MsgResult(false, '访客角色未设置')
    }
    const roleIds = roles.map(role => role._id)
    const guestUser = {
      username: 'guest',
      realname: '访客用户',
      role_ids: roleIds,
    }
    const tokenKeyConfig: SystemConfig = await this.systemConfigModel.findOne({name: 'token_private_key'}).exec()
    const token = jwt.sign(guestUser, tokenKeyConfig.value.toString()/*秘钥*/, {
      expiresIn: '1d', /*过期时间*/
    })
    return new MsgResult(true, '访客模式登录', {token, userInfo: guestUser})
  }
  /**
   * 校验Token
   * @param token Token字符串
   */
  async verifyToken(token: string): Promise<object> {
    const systemConfig: SystemConfig = await this.systemConfigModel.findOne({name: 'token_private_key'}).exec()
    try {
      const userInfo = jwt.verify(token, systemConfig.value.toString())
      return {status: true, userInfo}
    } catch (err) {
      if (err instanceof jwt.TokenExpiredError) {
        // 如果token过期 则按照忽略过期时间再校验一次 并签发新的token
        let userInfo = jwt.verify(token, systemConfig.value.toString(), {ignoreExpiration: true})
        const loginUser = await this.systemUserModel.findById(userInfo['_id'], this.tokenField).exec()
        userInfo = {
          _id: loginUser._id,
          username: loginUser.username,
          realname: loginUser.realname,
          role_ids: loginUser.role_ids,
        }
        const newToken = jwt.sign(userInfo, systemConfig.value.toString(), {expiresIn: '7d'})
        /* sign的第一个参数必须是plain object */
        return {status: true, userInfo, newToken}
      } else if (err instanceof jwt.JsonWebTokenError) {
        return new MsgResult(false, 'Token无效，请重新登录')
      }
    }
  }
}
