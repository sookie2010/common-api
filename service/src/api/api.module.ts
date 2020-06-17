import HitokotoController from './controller/hitokoto.controller'
import PhotoWallController from './controller/photo-wall.controller'
import SourceImageController from './controller/source-image.controller'
import ProvinceController from './controller/province.controller'
import MusicController from './controller/music.controller'

import HitokotoService from './service/hitokoto.service'
import PhotoWallService from './service/photo-wall.service'
import SourceImageService from './service/source-image.service'
import ProvinceService from './service/province.service'
import MusicService from './service/music.service'

import { HitokotoSchema } from './schema/hitokoto.schema'
import { PhotoWallSchema } from './schema/photo-wall.schema'
import { SourceImageSchema } from './schema/source-image.schema'
import { ProvinceSchema } from './schema/province.schema'
import { MusicSchema, MusicLibSchema } from './schema/music.schema'

export default {
  controllers: [
    HitokotoController,
    PhotoWallController,
    SourceImageController,
    ProvinceController,
    MusicController,
  ],
  providers: [
    HitokotoService,
    PhotoWallService,
    SourceImageService,
    ProvinceService,
    MusicService,
  ],
  schemas: [
    { name: 'Hitokoto', schema: HitokotoSchema },
    { name: 'PhotoWall', schema: PhotoWallSchema },
    { name: 'SourceImage', schema: SourceImageSchema },
    { name: 'Province', schema: ProvinceSchema },
    { name: 'Music', schema: MusicSchema },
    { name: 'MusicLib', schema: MusicLibSchema },
  ],
}
