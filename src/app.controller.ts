import { Controller, Get, Query } from '@nestjs/common';
import { AppService } from './app.service';
import { HitokotoService } from './hitokoto/hitokoto.service';
import { Hitokoto } from './hitokoto/hitokoto.interface';
import { HitokotoDto } from './hitokoto/hitokoto.dto';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly hitokotoService: HitokotoService
  ) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('/hitokoto')
  getHitokoto(@Query() hitokotoDto : HitokotoDto): Promise<Hitokoto> {
    console.log(hitokotoDto)
    return this.hitokotoService.findOne(hitokotoDto);
  }
}
