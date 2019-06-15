import { Model } from 'mongoose';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Hitokoto } from './hitokoto.interface';
import { HitokotoDto } from './hitokoto.dto';
import { HitokotoQc } from './hitokoto.qc';
import { Page } from '../page.dto'

@Injectable()
export class HitokotoService {
  constructor(@InjectModel('Hitokoto') private readonly hitokotoModel: Model<Hitokoto>) {}

  /**
   * 随机获取一条一言
   * @param hitokotoDto 查询条件
   */
  async findOne(hitokotoDto : HitokotoDto): Promise<Hitokoto> {
    var searchParam: HitokotoQc = {};
    if(hitokotoDto.type) {
      searchParam.type = hitokotoDto.type.length>1 ? {'$in': hitokotoDto.type.split('')} : hitokotoDto.type;
    }
    if(~~hitokotoDto.length > 0) {
      searchParam.hitokoto = { $exists: true };
      searchParam.$expr = { $lte: [{ $strLenCP: '$hitokoto' }, ~~hitokotoDto.length ]};
    }
    return this.hitokotoModel.countDocuments(searchParam).exec().then((cnt: number) => {
      if(cnt === 0) {
        throw new Error('没有匹配的一言');
      }
      var skipNum = Math.floor(Math.random() * cnt);
      return this.hitokotoModel.find(searchParam).sort({number:1}).skip(skipNum).limit(1).exec();
    }).then((hitokotos : Array<Hitokoto>) => {
      switch(hitokotoDto.format) {
        case 'text': 
          return hitokotos[0].hitokoto;
        case 'json':
        default:
          return hitokotos[0];
      }
    }).catch((err: Error) => {
      return {msg: err.message};
    })
  }
  /**
   * 查询一言列表
   * @param hitokotoDto 查询条件
   * @param page 分页
   */
  async list(hitokotoDto : HitokotoDto, page: Page): Promise<Page> {
    var searchParam: HitokotoQc = {};
    if(hitokotoDto.type) {
      searchParam.type = hitokotoDto.type;
    }
    if(hitokotoDto.content) { // mongodb的模糊搜索使用正则形式
      searchParam.hitokoto = {$regex: new RegExp(hitokotoDto.content)}
    }
    if(hitokotoDto.createAt && hitokotoDto.createAt[0] && hitokotoDto.createAt[1]) {
      console.log(hitokotoDto.createAt)
      searchParam.created_at = {
        $gte: new Date(hitokotoDto.createAt[0]),
        $lte: new Date(hitokotoDto.createAt[1])
      }
    }
    return this.hitokotoModel.countDocuments(searchParam).exec().then((cnt: Number) => {
      page.total = cnt;
      return this.hitokotoModel.find(searchParam).skip(~~page.start).limit(~~page.limit).exec();
    }).then((hitokotos : Array<Hitokoto>) => {
      page.data = hitokotos
      return page
    }).catch((err: Error) => {
      return {msg: err.message};
    })
  }

  /**
   * 保存一言
   * @param hitokoto 一言
   */
  async save(hitokoto: Hitokoto): Promise<String> {
    hitokoto.created_at = new Date();
    return this.hitokotoModel.insert(hitokoto).exec();
  }
}