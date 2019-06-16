import * as mongoose from 'mongoose';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { PhotoWallDto } from './photo-wall.dto';
import { PhotoWall } from './photo-wall.interface';
import { Page } from '../common/page.dto';
import { PhotoWallQc } from './photo-wall.qc';

@Injectable()
export class PhotoWallService {
  constructor(@InjectModel('PhotoWall') private readonly photoWallModel: mongoose.Model<PhotoWall>) {}

  /**
   * 分页查询照片墙图片数据
   * @param start 起始数据行数(第一行是0)
   * @param limit 每页数据条数
   */
  async queryPage(page: Page): Promise<Page> {
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

  /**
   * 管理端分页查询
   * @param photoWallDto 查询条件
   * @param page 分页信息
   */
  async list(photoWallDto : PhotoWallDto, page: Page): Promise<Page> {
    var searchParam: PhotoWallQc = {};
    if(photoWallDto.name) { // mongodb的模糊搜索使用正则形式
      searchParam.name = {$regex: new RegExp(photoWallDto.name)}
    }
    if(~~photoWallDto.widthMin || ~~photoWallDto.widthMax) {
      searchParam.width = {}
      if(~~photoWallDto.widthMin) {
        searchParam.width['$gte'] = ~~photoWallDto.widthMin
      }
      if(~~photoWallDto.widthMax) {
        searchParam.width['$lte'] = ~~photoWallDto.widthMax
      }
    }
    if(~~photoWallDto.heightMin || ~~photoWallDto.heightMax) {
      searchParam.height = {}
      if(~~photoWallDto.heightMin) {
        searchParam.height['$gte'] = ~~photoWallDto.heightMin
      }
      if(~~photoWallDto.heightMax) {
        searchParam.height['$lte'] = ~~photoWallDto.heightMax
      }
    }
    return this.photoWallModel.countDocuments(searchParam).exec().then((cnt: Number) => {
      page.total = cnt;
      return this.photoWallModel.find(searchParam).skip(~~page.start).limit(~~page.limit).exec();
    }).then((photoWalls : Array<PhotoWall>) => {
      page.data = photoWalls
      return page
    })
  }
  /**
   * 保存照片信息
   * @param photowall 照片信息
   */
  async save(photowall: PhotoWall): Promise<String> {
    photowall._id = new mongoose.Types.ObjectId();
    return this.photoWallModel.create(photowall);
  }

  /**
   * 批量删除照片信息
   * @param _ids 删除数据的ID们
   */
  async delete(_ids: Array<string>): Promise<String> {
    return this.photoWallModel.deleteMany({_id: {$in: _ids}}).exec();
  }
}