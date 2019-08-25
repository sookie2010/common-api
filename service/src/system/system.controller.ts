import { Controller, Get, Post, Delete, Query, Body, UseInterceptors } from '@nestjs/common'
import LoginInterceptor from '../common/login.interceptor'
import SystemService from './system.service'
import SystemConfig from './system-config.interface'
import { MsgResult } from '../common/common.dto'

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
  /**
   * 新增或更新配置项
   * @param systemConfig 配置项内容
   */
  @Post('/config/save')
  save(@Body() systemConfig: SystemConfig): Promise<MsgResult> {
    if(typeof systemConfig.value !== 'object') {
      try {
        systemConfig.value = JSON.parse(systemConfig.value)
      } catch(e) {
        return Promise.resolve(new MsgResult(false, 'value无法解析为JSON格式'))
      }
    }
    return this.systemService.updateConfig(systemConfig)
  }
  /**
   * 删除配置项
   * @param id 配置项ID
   */
  @Delete('/config/delete')
  delete(@Query('id')id: string): Promise<MsgResult> {
    return this.systemService.deleteConfig(id)
  }
}
