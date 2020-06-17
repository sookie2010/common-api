import { Controller, Get, Query, UseInterceptors } from '@nestjs/common'
import { Page, PageResult } from '../../common/common.dto'
import LoginInterceptor from '../../common/login.interceptor'
import PageTransform from '../../common/page.transform'
import ProvinceService from '../service/province.service'
import { Province, ProvinceEntity } from '../interface/province.interface'

@UseInterceptors(LoginInterceptor)
@Controller('/province')
export default class ProvinceController {
  constructor(
    private readonly provinceService: ProvinceService,
  ) {}
  /**
   * 查询行政区划列表
   * @param provinceEntity 查询条件
   */
  @Get('/listAll')
  listAll(@Query() provinceEntity: ProvinceEntity): Promise<Province[]> {
    return this.provinceService.listAll(provinceEntity)
  }

  /**
   * 查询一言列表(分页)
   * @param provinceEntity 查询条件
   * @param page 分页
   */
  @Get('/list')
  list(@Query() provinceEntity: ProvinceEntity, @Query(PageTransform) page: Page): Promise<PageResult> {
    return this.provinceService.list(provinceEntity, page)
  }
}
