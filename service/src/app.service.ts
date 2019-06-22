import * as mongoose from 'mongoose'
import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import SystemConfig from './system/system-config.interface'
import SystemUser from './system/system-user.interface'

const jwt = require('jsonwebtoken')
const crypto = require('crypto')

@Injectable()
export default class AppService {

  constructor(@InjectModel('SystemConfig') private readonly systemConfigModel: mongoose.Model<SystemConfig>,
              @InjectModel('SystemUser') private readonly systemUserModel: mongoose.Model<SystemUser>,
  ) {}
  /**
   * 登录
   * @param systemUser 用户信息
   */
  async login(systemUser: SystemUser): Promise<object> {
    const pwdHashed = crypto.createHash('sha1')
        .update(systemUser.password)
        .digest('hex')
    systemUser.password = pwdHashed
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
      const token = jwt.sign(signUser, systemConfig.value/*秘钥*/, {
        expiresIn: '1h', /*过期时间*/
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
    return this.systemConfigModel.findOne({name: 'token_private_key'}).exec().then((systemConfig: SystemConfig) => {
      const userInfo = jwt.verify(token, systemConfig.value)
      return {status: true, userInfo}
    }).catch(err => {
      let msg = null
      if (err instanceof jwt.TokenExpiredError) {
        msg = '登录超时，请重新登录'
      } else if (err instanceof jwt.JsonWebTokenError) {
        msg = 'Token无效，请重新登录'
      }
      return {status: false, msg}
    })
  }
}
