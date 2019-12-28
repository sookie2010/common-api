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
  /**
   * 登录
   * @param systemUser 用户信息
   */
  async login(systemUser: SystemUser): Promise<object> {
    systemUser.password = CommonUtils.dataHash(systemUser.password, 'sha1')
    let signUser = null
    return this.systemUserModel.findOne(systemUser).exec().then((user: SystemUser) => {
      if (!user) {
        return Promise.reject({statusCode: 401, msg: '用户名/密码错误'})
      }
      signUser = {
        _id: user._id.toString(),
        username: user.username,
        realname: user.realname,
      }
      return this.systemConfigModel.findOne({name: 'token_private_key'}).exec()
    }).then((systemConfig: SystemConfig) => {
      const token = jwt.sign(signUser, systemConfig.value.toString()/*秘钥*/, {
        expiresIn: '7d' /*过期时间*/
      })
      return Promise.resolve({token, userInfo: signUser})
    }).catch(result => {
      return result
    })
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
      if (err instanceof jwt.JsonWebTokenError) {
        return new MsgResult(false, 'Token无效，请重新登录')
      } else if (err instanceof jwt.TokenExpiredError) {
        // 如果token过期 则按照忽略过期时间再校验一次 并签发新的token
        const userInfo = jwt.verify(token, systemConfig.value.toString(), {ignoreExpiration: false})
        const newToken = jwt.sign(userInfo, systemConfig.value.toString(), {expiresIn: '7d'})
        return {status: true, userInfo, newToken}
      }
    }
  }
}
