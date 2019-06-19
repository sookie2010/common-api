import { Controller, Get, Query, Post, Body } from '@nestjs/common';
import { HitokotoService } from './hitokoto/hitokoto.service';
import { PhotoWallService } from './photo-wall/photo-wall.service';
import { Hitokoto } from './hitokoto/hitokoto.interface';
import { HitokotoDto } from './hitokoto/hitokoto.dto';
import { Page } from './common/page.dto';
import { UserDto } from './common/user.dto';

const Jwt = require('jsonwebtoken');

@Controller('/common')
export class AppController {
  constructor(
    private readonly hitokotoService: HitokotoService,
    private readonly photoWallService: PhotoWallService
  ) {}

  @Post('/login')
  login(@Body() userDto: UserDto): Promise<Object> {
    const token = Jwt.sign({       
      user_id: 1,
      user_name: userDto.username
    }, '1234'/*秘钥*/, {
      expiresIn: '60s' /*过期时间*/
    });
    return Promise.resolve({token});
  }

  @Get('/hitokoto')
  getHitokoto(@Query() hitokotoDto : HitokotoDto): Promise<Hitokoto> {
    return this.hitokotoService.findOne(hitokotoDto);
  }

  @Get('/photos')
  getPhotos(@Query() page: Page): Promise<Page> {
    return this.photoWallService.queryPage(page);
  }

  @Get('/hitokotoTypes')
  listHitokotoTypes(): Promise<Array<Object>> {
    return this.hitokotoService.listTypes();
  }

  @Get('/pictureCdn')
  getPictureCdn(): Promise<String> {
    return this.photoWallService.getPictureCdn();
  }
}