import { Model } from 'mongoose';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { PhotoWall } from './photo-wall.interface';
import { Page } from '../page.dto';

@Injectable()
export class PhotoWallService {
  constructor(@InjectModel('PhotoWall') private readonly photoWallModel: Model<PhotoWall>) {}

  /**
   * 分页查询照片墙图片数据
   * @param start 起始数据行数(第一行是0)
   * @param limit 每页数据条数
   */
  async queryPage(page: Page): Promise<Page> {
    console.log(page)
    return this.photoWallModel.countDocuments({}).exec().then((cnt: Number) => {
      if(cnt === 0) {
        throw new Error('没有图片数据');
      }
      page.total = cnt;
      return this.photoWallModel.find({}).skip(~~page.start).limit(~~page.limit).exec();
    }).then((photoWalls : Array<PhotoWall>) => {
      page.data = photoWalls
      return page
    }).catch((err: Error) => {
      return {msg: err.message};
    })
  }
}