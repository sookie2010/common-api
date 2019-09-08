import { Controller, Get, Post, Delete, Query, UseInterceptors, UploadedFile } from '@nestjs/common'
import { FileInterceptor } from '@nestjs/platform-express/index'
import BackgroundImgService from './background-img.service'
import { BackgroundImgEntity } from './background-img.interface'
import { Page, MsgResult, FileEntity } from '../common/common.dto'
import LoginInterceptor from '../common/login.interceptor'
import PageTransform from '../common/page.transform'

@UseInterceptors(LoginInterceptor)
@Controller('/background-img')
export default class BackgroundImgController {
  constructor(
    private readonly backgroundImgService: BackgroundImgService,
  ) {}
  /**
   * 查询背景图列表
   * @param page 分页
   */
  @Get('/list')
  list(@Query(PageTransform) page: Page): Promise<Page> {
    return this.backgroundImgService.list(page)
  }
  /**
   * 删除背景图
   * @param ids 需要删除的多个ID
   */
  @Delete('/delete')
  delete(@Query('_ids') ids: string[]): Promise<MsgResult> {
    return this.backgroundImgService.delete(ids)
  }

  /**
   * 上传背景图
   * @param image 上传的图片文件
   */
  @Post('/upload')
  @UseInterceptors(FileInterceptor('image'))
  uploadFile(@UploadedFile() image: FileEntity): Promise<object> {
    const backgroundImgEntity: BackgroundImgEntity = {
      size: image.size,
      mime: image.mimetype,
      img: image.buffer,
    }
    return this.backgroundImgService.save(backgroundImgEntity)
  }
}
