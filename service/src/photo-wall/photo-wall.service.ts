import * as mongoose from 'mongoose';
import { Injectable } from '@nestjs/common/index';
import { InjectModel } from '@nestjs/mongoose';
import { PhotoWallDto } from './photo-wall.dto';
import { PhotoWall } from './photo-wall.interface';
import { Page } from '../common/page.dto';
import { FileDto } from '../common/file.dto';
import { PhotoWallQc } from './photo-wall.qc';

const images = require('images');
const nos = require('@xgheaven/nos-node-sdk'), 
  nosSetting = require('../../config/auth.json');
const crypto = require('crypto');

@Injectable()
export class PhotoWallService {
  client: {
    putObject: Function, 
    deleteMultiObject: Function
  }

  constructor(@InjectModel('PhotoWall') private readonly photoWallModel: mongoose.Model<PhotoWall>) {
    // 网易云对象存储接口
    this.client = new nos.NosClient(nosSetting)
  }

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
  async save(image: FileDto): Promise<String> {
    var ext = image.originalname.substr(image.originalname.indexOf('.')+1); // 文件扩展名
    var photowall:PhotoWall = {};
    photowall._id = new mongoose.Types.ObjectId();
    var img = images(image.buffer);
    // 获取图片宽高
    photowall.width = img.width();
    photowall.height = img.height();

    // 获取图片MD5值
    var fsHash = crypto.createHash('md5');
    fsHash.update(image.buffer);
    photowall.md5 = fsHash.digest('hex');

    // 生成缩略图
    img.resize(370);
    var thumbnailBuffer = img.encode(ext, {operation:50});
    return this.photoWallModel.aggregate([{$group: {
      _id: "max_index",
      index: { $max: "$index" }
    }}]).then((maxIndex: Array<PhotoWall>) => {
      let lastIndex = maxIndex[0].index;
      let groupId = Math.floor(lastIndex / 50) + 1; // 当前分组
      let num = '', len = (lastIndex+1).toString().length; // 编号
      for(let i=0 ; i<5-len ; i++) {
        num += '0';
      }
      photowall.name = `photo-wall/${groupId}/pic_${num}${lastIndex+1}.${ext}`;
      photowall.thumbnail = `photo-wall/${groupId}/pic_${num}${lastIndex+1}_thumbnail.${ext}`;
      photowall.index = lastIndex + 1;
      // 上传原图到对象存储仓库
      return this.client.putObject({
        objectKey: photowall.name,
        body: image.buffer
      });
    }).then(result => {
      // eTag是上传后远端校验的md5值, 用于和本地进行比对
      let eTag = result.eTag.replace(/"/g,'');
      if(photowall.md5 === eTag) {
        console.log(`${photowall.name} 上传成功, md5:${eTag}`);
        // 上传缩略图
        return this.client.putObject({
          objectKey: photowall.thumbnail,
          body: thumbnailBuffer
        });
      } else {
        console.warn(`${photowall.name} 上传出错, md5值不一致`);
        console.warn(`===> 本地文件: ${photowall.md5}, 接口返回: ${eTag}`);
        return Promise.reject(`${photowall.name} 上传出错, md5值不一致`)
      }
    }).then(() => {
      console.log(`缩略图 ${photowall.thumbnail} 上传成功`);
      return this.photoWallModel.create(photowall);
    })
  }

  /**
   * 批量删除照片信息
   * @param _ids 删除数据的ID们
   */
  async delete(_ids: Array<string>): Promise<String> {
    return this.photoWallModel.find({_id: {$in: _ids}}).exec().then((photoWalls : Array<PhotoWall>) => {
      let deleteFileNames = [];
      photoWalls.forEach((photoWall : PhotoWall) => {
        deleteFileNames.push(photoWall.name);
        deleteFileNames.push(photoWall.thumbnail);
      });
      return this.client.deleteMultiObject({objectKeys: deleteFileNames})
    }).then(err => {
      if(err) console.error(err);
      return this.photoWallModel.deleteMany({_id: {$in: _ids}}).exec();
    });
  }
}