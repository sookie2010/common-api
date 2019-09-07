import { Module } from '@nestjs/common'
import AppController from './app.controller'
import HitokotoController from './hitokoto/hitokoto.controller'
import PhotoWallController from './photo-wall/photo-wall.controller'
import SystemController from './system/system.controller'
import ArticleController from './article/article.controller'
import BackgroundImgController from './backgroud-img/background-img.controller'
import { MongooseModule } from '@nestjs/mongoose'
import AppService from './app.service'
import HitokotoService from './hitokoto/hitokoto.service'
import PhotoWallService from './photo-wall/photo-wall.service'
import SystemService from './system/system.service'
import ArticleService from './article/article.service'
import BackgrounImgService from './backgroud-img/background-img.service'
import { HitokotoSchema } from './hitokoto/hitokoto.schema'
import { PhotoWallSchema } from './photo-wall/photo-wall.schema'
import { SystemConfigSchema } from './system/system-config.schema'
import { SystemUserSchema } from './system/system-user.schema'
import { ArticleSchema, ArticleKeysSchema } from './article/article.schema'
import { BackgroundImgSchema } from './backgroud-img/background-img.schema'

const dbConfig = require('../config/db.json')
@Module({
  imports: [
    MongooseModule.forRoot(`mongodb://${dbConfig.host}:${dbConfig.port}/${dbConfig.db_name}`, {
      useNewUrlParser: true,
      user: dbConfig.user,
      pass: dbConfig.password,
    }),
    MongooseModule.forFeature([
      { name: 'Hitokoto', schema: HitokotoSchema },
      { name: 'PhotoWall', schema: PhotoWallSchema },
      { name: 'SystemConfig', schema: SystemConfigSchema },
      { name: 'SystemUser', schema: SystemUserSchema },
      { name: 'Article', schema: ArticleSchema },
      { name: 'ArticleKeys', schema: ArticleKeysSchema },
      { name: 'BackgroundImg', schema: BackgroundImgSchema },
    ]),
  ],
  controllers: [AppController, HitokotoController, PhotoWallController, SystemController, ArticleController, BackgroundImgController],
  providers: [AppService, HitokotoService, PhotoWallService, SystemService, ArticleService, BackgrounImgService],
})
export class AppModule {}
