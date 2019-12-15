import { Controller, Get, Post, Delete, Query, Body, UseInterceptors, UploadedFile } from '@nestjs/common'
import { FileInterceptor } from '@nestjs/platform-express'
import SourceImageService from '../service/source-image.service'
import { SourceImageEntity } from '../interface/source-image.interface'
import { Page, MsgResult, FileEntity } from '../common/common.dto'
import LoginInterceptor from '../common/login.interceptor'
import PageTransform from '../common/page.transform'

@UseInterceptors(LoginInterceptor)
@Controller('/source-image')
export default class SourceImageController {
  constructor(
    private readonly sourceImageService: SourceImageService,
  ) {}
  /**
   * 查询图片资源列表
   * @param page 分页
   */
  @Get('/list')
  list(@Query(PageTransform) page: Page): Promise<Page> {
    return this.sourceImageService.list(page)
  }
  /**
   * 删除图片资源
   * @param ids 需要删除的多个ID
   */
  @Delete('/delete')
  delete(@Query('_ids') ids: string[]): Promise<MsgResult> {
    return this.sourceImageService.delete(ids)
  }

  /**
   * 上传图片资源
   * @param image 上传的图片文件
   */
  @Post('/upload')
  @UseInterceptors(FileInterceptor('image'))
  uploadFile(@UploadedFile() image: FileEntity): Promise<object> {
    const sourceImageEntity: SourceImageEntity = {
      size: image.size,
      mime: image.mimetype,
      img: image.buffer,
    }
    return this.sourceImageService.save(sourceImageEntity)
  }
  
  /**
   * 添加图片标签
   * @param id 图片ID
   * @param label 标签文本
   */
  @Post('/updateLabel')
  updateLabel(@Body('id') id: string, @Body('labels') label: string[]): Promise<MsgResult> {
    return this.sourceImageService.updateLabel(id, label)
  }
}
