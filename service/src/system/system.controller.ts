import { Controller, Get, Post, Delete, Query, UseInterceptors } from '@nestjs/common'
import LoginInterceptor from '../common/login.interceptor'
import SystemService from './system.service'
import SystemConfig from './system-config.interface'

@UseInterceptors(LoginInterceptor)
@Controller('/system')
export default class SystemController {

  constructor(private readonly systemService: SystemService) {}
  /**
   * 查询配置列表
   * @param systemConfig 查询条件
   */
  @Get('/config/list')
  list(@Query() systemConfig: SystemConfig): Promise<SystemConfig[]> {
    return this.systemService.listConfig(systemConfig);
  }
}
