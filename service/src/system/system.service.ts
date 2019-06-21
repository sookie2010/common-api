import { Model } from 'mongoose'
import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import SystemConfig from '../system/system-config.interface'
import SystemUser from './system-user.interface'

@Injectable()
export default class SystemService {
  constructor(@InjectModel('SystemUser') private readonly systemUserModel: Model<SystemUser>,
              @InjectModel('SystemConfig') private readonly systemConfigModel: Model<SystemConfig>) {}

  async listConfig(systemConfig: SystemConfig): Promise<SystemConfig[]> {
    return this.systemConfigModel.find(systemConfig).exec()
  }
}
