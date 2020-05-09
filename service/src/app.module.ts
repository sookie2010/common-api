import { Module } from '@nestjs/common'
import CommonController from './controller/common.controller'
import HitokotoController from './controller/hitokoto.controller'
import PhotoWallController from './controller/photo-wall.controller'
import SystemController from './controller/system.controller'
import ArticleController from './controller/article.controller'
import SourceImageController from './controller/source-image.controller'
import ProvinceController from './controller/province.controller'
import MusicLibController from './controller/music-lib.controller'
import { MongooseModule } from '@nestjs/mongoose'
import AppService from './service/common.service'
import HitokotoService from './service/hitokoto.service'
import PhotoWallService from './service/photo-wall.service'
import SystemService from './service/system.service'
import ArticleService from './service/article.service'
import SourceImageService from './service/source-image.service'
import ProvinceService from './service/province.service'
import MusicLibService from './service/music-lib.service'
import { HitokotoSchema } from './schema/hitokoto.schema'
import { PhotoWallSchema } from './schema/photo-wall.schema'
import { SystemConfigSchema } from './schema/system-config.schema'
import { SystemUserSchema } from './schema/system-user.schema'
import { SystemRoleSchema } from './schema/system-role.schema'
import { ArticleSchema, ArticleKeysSchema } from './schema/article.schema'
import { SourceImageSchema } from './schema/source-image.schema'
import { ProvinceSchema } from './schema/province.schema'
import { MusicLibSchema } from './schema/music-lib.schema'

const dbConfig = require('../config/db.json')

@Module({
  imports: [
    MongooseModule.forRoot(`mongodb://${dbConfig.host}:${dbConfig.port}/${dbConfig.db_name}`, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      user: dbConfig.user,
      pass: dbConfig.password,
    }),
    MongooseModule.forFeature([
      { name: 'Hitokoto', schema: HitokotoSchema },
      { name: 'PhotoWall', schema: PhotoWallSchema },
      { name: 'SystemConfig', schema: SystemConfigSchema },
      { name: 'SystemUser', schema: SystemUserSchema },
      { name: 'SystemRole', schema: SystemRoleSchema },
      { name: 'Article', schema: ArticleSchema },
      { name: 'ArticleKeys', schema: ArticleKeysSchema },
      { name: 'SourceImage', schema: SourceImageSchema },
      { name: 'Province', schema: ProvinceSchema },
      { name: 'Music', schema: MusicLibSchema },
    ]),
  ],
  controllers: [
    CommonController,
    HitokotoController,
    PhotoWallController,
    SystemController,
    ArticleController,
    SourceImageController,
    ProvinceController,
    MusicLibController,
  ],
  providers: [
    AppService,
    HitokotoService,
    PhotoWallService,
    SystemService,
    ArticleService,
    SourceImageService,
    ProvinceService,
    MusicLibService,
  ],
})
export class AppModule {}
