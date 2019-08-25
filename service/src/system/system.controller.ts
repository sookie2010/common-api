import { Controller, Get, Post, Delete, Query, Body, UseInterceptors } from '@nestjs/common'
import LoginInterceptor from '../common/login.interceptor'
import SystemService from './system.service'
import SystemConfig from './system-config.interface'
import SystemUser from './system-user.interface';
import { Page, MsgResult } from '../common/common.dto'
import PageTransform from '../common/page.transform'

@UseInterceptors(LoginInterceptor)
@Controller('/system')
export default class SystemController {

  constructor(private readonly systemService: SystemService) {}

  /**
   * 查询用户列表
   * @param systemUser 查询条件
   * @param page 分页
   */
  @Get('/user/list')
  listUser(@Query() systemUser: SystemUser, @Query(PageTransform) page: Page): Promise<Page> {
    return this.systemService.listUser(systemUser, page)
  }
  /**
   * 新增用户
   * @param systemUser 用户对象
   */
  @Post('/user/save')
  saveUser(@Body() systemUser: SystemUser): Promise<MsgResult> {
    return this.systemService.saveUser(systemUser)
  }
  /**
   * 删除用户
   * @param id 配置项ID
   */
  @Delete('/user/delete')
  deleteUser(@Query('id')id: string): Promise<MsgResult> {
    return this.systemService.deleteUser(id)
  }
  /**
   * 查询配置列表
   * @param systemConfig 查询条件
   */
  @Get('/config/list')
  listConfig(@Query() systemConfig: SystemConfig): Promise<SystemConfig[]> {
    return this.systemService.listConfig(systemConfig);
  }
  /**
   * 新增或更新配置项
   * @param systemConfig 配置项内容
   */
  @Post('/config/save')
  saveConfig(@Body() systemConfig: SystemConfig): Promise<MsgResult> {
    if(typeof systemConfig.value !== 'object') {
      try {
        systemConfig.value = JSON.parse(systemConfig.value)
      } catch(e) {
        return Promise.resolve(new MsgResult(false, 'value无法解析为JSON格式'))
      }
    }
    return this.systemService.saveConfig(systemConfig)
  }
  /**
   * 删除配置项
   * @param id 配置项ID
   */
  @Delete('/config/delete')
  deleteConfig(@Query('id')id: string): Promise<MsgResult> {
    return this.systemService.deleteConfig(id)
  }
}
