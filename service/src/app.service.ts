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


  async login(systemUser: SystemUser) {
    let pwdHashed = crypto.createHash('sha1')
        .update(systemUser.password)
        .digest('hex')
    systemUser.password = pwdHashed
    var signUser = null
    return this.systemUserModel.findOne(systemUser).exec().then((user: SystemUser) => {
      if(!user) {
        return Promise.reject({statusCode:401, msg:'用户名/密码错误'})
      }
      signUser = {
        _id: user._id.toString(),
        username: user.username,
        realname: user.realname
      }
      return this.systemConfigModel.findOne({name:'token_private_key'}).exec()
    }).then((systemConfig : SystemConfig) => {
      const token = jwt.sign(signUser, systemConfig.value/*秘钥*/, {
        expiresIn: '1h' /*过期时间*/
      })
      return Promise.resolve({token})
    }).catch(result => {
      return result
    })
  }
}