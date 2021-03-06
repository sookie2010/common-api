import { Model, Types } from 'mongoose'
import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common'
import { HttpArgumentsHost } from '@nestjs/common/interfaces'
import { Observable } from 'rxjs'
import { InjectModel } from '@nestjs/mongoose'
import { TokenUserInfo } from './common.dto'
import { SystemConfig } from '../system/interface/system-config.interface'
import { SystemRole } from '../system/interface/system-role.interface'
import { ServerResponse } from 'http'
import { Request } from 'express'

import * as jwt from 'jsonwebtoken'

@Injectable()
export default class LoginInterceptor implements NestInterceptor {
  constructor(@InjectModel('SystemConfig') private readonly systemConfigModel: Model<SystemConfig>,
              @InjectModel('SystemRole') private readonly systemRoleModel: Model<SystemRole>) {}

  async intercept(context: ExecutionContext, next: CallHandler): Promise<Observable<any>> {
    const http: HttpArgumentsHost = context.switchToHttp()
    const request: Request = http.getRequest()
    const token = request.header('token')
    if (!token) {
      this.responseHandler(http.getResponse(), 403, '请先登录')
      return
    }
    const privateKeyConfig: SystemConfig = await this.systemConfigModel.findOne({name: 'token_private_key'}).exec()
    try {
      const userInfo = jwt.verify(token, privateKeyConfig.value as string) as TokenUserInfo
      if (userInfo.role_ids && Array.isArray(userInfo.role_ids)) {
        // 校验用户角色具备的权限
        const method = request.method // 请求类型
        const uri = request.route.path // 请求URI
        const cnt = await this.systemRoleModel.countDocuments({
          _id: {$in: userInfo.role_ids},
          $or: [{methods: method}, {include_uri: uri}],
          exclude_uri: {$ne: uri},
        }).exec()
        if (!cnt) {
          this.responseHandler(http.getResponse(), 401, '无访问权限')
          return
        }
      }
      return next.handle()
    } catch (err) {
      let message = null
      if (err instanceof jwt.TokenExpiredError) {
        message = '登录超时，请重新登录'
      } else if (err instanceof jwt.JsonWebTokenError) {
        message = 'Token无效，请重新登录'
      }
      this.responseHandler(context.switchToHttp().getResponse(), 403, message)
    }
  }

  private responseHandler(response: ServerResponse, statusCode: number, message: string): void {
    try {
      response.statusCode = statusCode
      response.setHeader('Content-Type', 'application/json')
      response.end(JSON.stringify({statusCode, message}))
    } catch (err) {}
  }
}
