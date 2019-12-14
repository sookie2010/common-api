import * as mongoose from 'mongoose'
import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common'
// import { Observable } from 'rxjs'
import { InjectModel } from '@nestjs/mongoose'
import SystemConfig from '../interface/system-config.interface'
import { ServerResponse } from 'http'

import * as jwt from 'jsonwebtoken'

@Injectable()
export default class LoginInterceptor implements NestInterceptor {
  constructor(@InjectModel('SystemConfig') private readonly systemConfigModel: mongoose.Model<SystemConfig>) {}

  async intercept(context: ExecutionContext, next: CallHandler): Promise<any> {
    const token = context.getArgs()[0].headers.token
    if (!token) {
      this.responseHandler(context.switchToHttp().getResponse(), 403, '请先登录')
    }
    return this.systemConfigModel.findOne({name: 'token_private_key'}).exec().then((systemConfig: SystemConfig) => {
      jwt.verify(token, systemConfig.value.toString())
      return next.handle()
    }).catch(err => {
      let msg = null
      if (err instanceof jwt.TokenExpiredError) {
        msg = '登录超时，请重新登录'
      } else if (err instanceof jwt.JsonWebTokenError) {
        msg = 'Token无效，请重新登录'
      }
      this.responseHandler(context.switchToHttp().getResponse(), 403, msg)
    })
  }

  private responseHandler(response: ServerResponse, statusCode: number, msg: string): void {
    try {
      response.statusCode = statusCode
      response.setHeader('Content-Type', 'application/json')
      response.end(JSON.stringify({statusCode, msg}))
    } catch (err) {}
  }
}
