import { Model } from 'mongoose';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Hitokoto } from './hitokoto.interface';
import { HitokotoDto } from './hitokoto.dto';

@Injectable()
export class HitokotoService {
  constructor(@InjectModel('Hitokoto') private readonly hitokotoModel: Model<Hitokoto>) {}

  async findOne(hitokotoDto : HitokotoDto): Promise<Hitokoto> {
    var searchParam = null
    if(hitokotoDto.type) {
      searchParam = {
        type: hitokotoDto.type.length>1 ? {'$in': hitokotoDto.type.split('')} : hitokotoDto.type
      }
    }
    return this.hitokotoModel.countDocuments(searchParam).exec().then((cnt: number) => {
      var skipNum = Math.floor(Math.random() * cnt);
      return this.hitokotoModel.find(searchParam).sort({number:1}).skip(skipNum).limit(1).exec();
    }).then((hitokotos : Hitokoto) => {
      switch(hitokotoDto.format) {
        case 'text': 
          return hitokotos[0].hitokoto
        case 'json':
        default:
          return hitokotos[0]
      }
    })
  }
}