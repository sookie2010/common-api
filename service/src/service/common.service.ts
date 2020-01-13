import { Model } from 'mongoose'
import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import SystemConfig from '../interface/system-config.interface'
import SystemUser from '../interface/system-user.interface'
import { MsgResult } from '../common/common.dto'
import CommonUtils from '../common/common.util'

import * as jwt from 'jsonwebtoken'

@Injectable()
export default class CommonService {

  constructor(@InjectModel('SystemConfig') private readonly systemConfigModel: Model<SystemConfig>,
              @InjectModel('SystemUser') private readonly systemUserModel: Model<SystemUser>,
  ) {}

  private tokenField = {_id: 1, username: 1, realname: 1, role_ids: 1}
  /**
   * 登录
   * @param systemUser 用户信息
   */
  async login(systemUser: SystemUser): Promise<object> {
    systemUser.password = CommonUtils.dataHash(systemUser.password, 'sha1')
    const signUser = await this.systemUserModel.findOne(systemUser, this.tokenField).exec()
    if(!signUser) {
      return Promise.reject({statusCode: 401, msg: '用户名/密码错误'})
    }
    const tokenKeyConfig: SystemConfig = await this.systemConfigModel.findOne({name: 'token_private_key'}).exec()
    const token = jwt.sign(signUser, tokenKeyConfig.value.toString()/*秘钥*/, {
      expiresIn: '7d' /*过期时间*/
    })
    return Promise.resolve({token, userInfo: signUser})
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
        const userInfo = jwt.verify(token, systemConfig.value.toString(), {ignoreExpiration: true})
        const curUserInfo = await this.systemUserModel.findById(userInfo['_id'], this.tokenField).exec()
        const newToken = jwt.sign(curUserInfo, systemConfig.value.toString(), {expiresIn: '7d'})
        return {status: true, userInfo, newToken}
      } else if (err instanceof jwt.JsonWebTokenError) {
        return new MsgResult(false, 'Token无效，请重新登录')
      }
    }
  }
}
