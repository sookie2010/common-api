import { Model, Types } from 'mongoose'
import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common'
// import { Observable } from 'rxjs'
import { InjectModel } from '@nestjs/mongoose'
import SystemConfig from '../interface/system-config.interface'
import SystemRole from '../interface/system-role.interface'
import { ServerResponse } from 'http'

import * as jwt from 'jsonwebtoken'

@Injectable()
export default class LoginInterceptor implements NestInterceptor {
  constructor(@InjectModel('SystemConfig') private readonly systemConfigModel: Model<SystemConfig>,
              @InjectModel('SystemRole') private readonly systemRoleModel: Model<SystemRole>) {}

  async intercept(context: ExecutionContext, next: CallHandler): Promise<any> {
    const token = context.getArgs()[0].headers.token
    if (!token) {
      this.responseHandler(context.switchToHttp().getResponse(), 403, '请先登录')
      return
    }
    const systemConfig: SystemConfig = await this.systemConfigModel.findOne({name: 'token_private_key'}).exec()
    try {
      const userInfo = jwt.verify(token, systemConfig.value.toString())['_doc']
      if(userInfo['role_ids'] && Array.isArray(userInfo['role_ids'])) {
        // 校验用户角色具备的权限
        let method = context.getArgs()[0].method // 请求类型
        let uri = context.getArgs()[0].route.path // 请求URI
        let cnt = await this.systemRoleModel.countDocuments({
          _id: {$in: userInfo['role_ids'].map(roleId => new Types.ObjectId(roleId))},
          $or: [{methods: method}, {include_uri: uri}],
          exclude_uri: {$ne: uri}
        }).exec()
        if(!cnt) {
          this.responseHandler(context.switchToHttp().getResponse(), 400, '无访问权限')
          return
        }
      }
      return next.handle()
    } catch (err) {
      let msg = null
      if (err instanceof jwt.TokenExpiredError) {
        msg = '登录超时，请重新登录'
      } else if (err instanceof jwt.JsonWebTokenError) {
        msg = 'Token无效，请重新登录'
      }
      this.responseHandler(context.switchToHttp().getResponse(), 403, msg)
    }
  }

  private responseHandler(response: ServerResponse, statusCode: number, msg: string): void {
    try {
      response.statusCode = statusCode
      response.setHeader('Content-Type', 'application/json')
      response.end(JSON.stringify({statusCode, msg}))
    } catch (err) {}
  }
}
