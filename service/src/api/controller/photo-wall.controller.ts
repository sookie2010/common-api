import { Controller, Get, Post, Delete, Query, UseInterceptors, UploadedFile } from '@nestjs/common'
import { FileInterceptor } from '@nestjs/platform-express/index'
import PhotoWallService from '../service/photo-wall.service'
import { PhotoWallDto } from '../interface/photo-wall.interface'
import { FileEntity, Page, MsgResult, PageResult } from '../../common/common.dto'
import LoginInterceptor from '../../common/login.interceptor'
import PageTransform from '../../common/page.transform'

@UseInterceptors(LoginInterceptor)
@Controller('/photowall')
export default class PhotoWallController {

  constructor(private readonly photoWallService: PhotoWallService) {}
  /**
   * 查询照片列表
   * @param photoWallDto 查询条件
   * @param page 分页
   */
  @Get('/list')
  list(@Query() photoWallDto: PhotoWallDto, @Query(PageTransform) page: Page): Promise<PageResult> {
    return this.photoWallService.list(photoWallDto, page)
  }
  /**
   * 删除照片
   * @param hitokotoDto 需要删除的多个ID
   */
  @Delete('/delete')
  delete(@Query() photoWallDto: PhotoWallDto): Promise<MsgResult> {
    return this.photoWallService.delete(photoWallDto._ids)
  }
  /**
   * 上传照片, 同步到对象存储仓库并保存照片信息
   * @param image 上传的图片文件
   */
  @Post('/upload')
  @UseInterceptors(FileInterceptor('image'))
  uploadImage(@UploadedFile() image: FileEntity): Promise<object> {
    return this.photoWallService.save(image)
  }
}
