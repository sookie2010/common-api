import { Model } from 'mongoose'
import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import SystemConfig from '../system/system-config.interface'
import SystemUser from './system-user.interface'
import { Page }  from '../common/common.dto'

@Injectable()
export default class SystemService {
  constructor(@InjectModel('SystemUser') private readonly systemUserModel: Model<SystemUser>,
              @InjectModel('SystemConfig') private readonly systemConfigModel: Model<SystemConfig>) {}

  async listConfig(systemConfig: SystemConfig): Promise<Array<SystemConfig>> {
    return this.systemConfigModel.find(systemConfig).exec()
  }
}