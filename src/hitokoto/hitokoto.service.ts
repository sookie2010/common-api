import { Model } from 'mongoose';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Hitokoto } from './hitokoto.interface';
import { HitokotoDto } from './hitokoto.dto';
import { HitokotoQc } from './hitokoto.qc'

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
}