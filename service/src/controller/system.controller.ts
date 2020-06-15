import { Controller, Get, Post, Delete, Query, Body, Headers, UseInterceptors, UploadedFile, ValidationPipe } from '@nestjs/common'
import { FileInterceptor } from '@nestjs/platform-express'
import LoginInterceptor from '../common/login.interceptor'
import SystemService from '../service/system.service'
import { SystemConfigEntity, SystemConfig } from '../interface/system-config.interface'
import { SystemUserEntity } from '../interface/system-user.interface'
import { SystemRoleEntity, SystemRole } from '../interface/system-role.interface'
import { Page, MsgResult, FileEntity, PageResult } from '../common/common.dto'
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
  listUser(@Query() systemUser: SystemUserEntity, @Query(PageTransform) page: Page): Promise<PageResult> {
    return this.systemService.listUser(systemUser, page)
  }
  /**
   * 校验用户名是否存在
   * @param username 用户名
   * @param id 需要排除掉的用户ID
   */
  @Get('/user/exists')
  checkUserExists(@Query('username') username: string, @Query('id')id: string): Promise<MsgResult> {
    return this.systemService.checkUserExists(username, id)
  }
  /**
   * 新增用户
   * @param systemUser 用户对象
   */
  @Post('/user/save')
  saveUser(@Body(new ValidationPipe()) systemUser: SystemUserEntity): Promise<MsgResult> {
    return this.systemService.saveUser(systemUser)
  }
  /**
   * 删除用户
   * @param id 用户ID
   */
  @Delete('/user/delete')
  deleteUser(@Query('id')id: string): Promise<MsgResult> {
    return this.systemService.deleteUser(id)
  }
  /**
   * 查询角色列表(无分页)
   * @param systemRole 查询条件
   * @param page 分页
   */
  @Get('/role/listAll')
  listRoleAll(): Promise<SystemRole[]> {
    return this.systemService.listRoleAll()
  }
  /**
   * 查询角色列表
   * @param systemRole 查询条件
   * @param page 分页
   */
  @Get('/role/list')
  listRole(@Query() systemRole: SystemRole, @Query(PageTransform) page: Page): Promise<PageResult> {
    return this.systemService.listRole(systemRole, page)
  }
  /**
   * 新增角色
   * @param systemRole 角色对象
   */
  @Post('/role/save')
  saveRole(@Body(new ValidationPipe()) systemRole: SystemRoleEntity): Promise<MsgResult> {
    return this.systemService.saveRole(systemRole)
  }
  /**
   * 删除角色
   * @param id 角色ID
   */
  @Delete('/role/delete')
  deleteRole(@Query('id')id: string): Promise<MsgResult> {
    return this.systemService.deleteRole(id)
  }
  /**
   * 查询配置列表
   * @param systemConfig 查询条件
   */
  @Get('/config/list')
  async listConfig(@Query() systemConfig: SystemConfigEntity, @Headers('token') token: string): Promise<SystemConfig[]> {
    const user = await this.systemService.decryptUserInfo(token)
    // 如果用户并不存在 代表是访客用户
    return this.systemService.listConfig(systemConfig, !user)
  }
  /**
   * 校验配置项名称是否存在
   * @param name 配置项名称
   * @param id 需要排除的ID(适用于修改)
   */
  @Get('/config/exists')
  checkConfigExists(@Query('name') name: string, @Query('id') id: string): Promise<MsgResult> {
    return this.systemService.checkConfigExists(name, id)
  }
  /**
   * 新增或更新配置项
   * @param systemConfig 配置项内容
   */
  @Post('/config/save')
  saveConfig(@Body(new ValidationPipe()) systemConfig: SystemConfigEntity): Promise<MsgResult> {
    if (typeof systemConfig.value !== 'object') {
      systemConfig.value = JSON.parse(systemConfig.value)
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
  /**
   * 发布博客
   * @param blogZip 博客静态化文件压缩包
   */
  @Post('/deployBlog')
  @UseInterceptors(FileInterceptor('blogZip'))
  deployBlog(@UploadedFile()blogZip: FileEntity): Promise<MsgResult> {
    return this.systemService.deployBlogZip(blogZip.buffer)
  }
}
