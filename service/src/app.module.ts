import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { HitokotoController } from './hitokoto/hitokoto.controller';
import { AppService } from './app.service';
import { MongooseModule } from '@nestjs/mongoose';
import { HitokotoService } from './hitokoto/hitokoto.service';
import { PhotoWallService } from './photo-wall/photo-wall.service';
import { HitokotoSchema } from './hitokoto/hitokoto.schema';
import { PhotoWallSchema } from './photo-wall/photo-wall.schema';
const dbConfig = require('../config/db.json');
@Module({
  imports: [
    MongooseModule.forRoot(`mongodb://${dbConfig.host}:${dbConfig.port}/${dbConfig.db_name}`, {
      useNewUrlParser: true,
      // user: dbConfig.user,
      // pass: dbConfig.password
    }),
    MongooseModule.forFeature([
      { name: 'Hitokoto', schema: HitokotoSchema },
      { name: 'PhotoWall', schema: PhotoWallSchema },
    ])
  ],
  controllers: [AppController, HitokotoController],
  providers: [AppService, HitokotoService,PhotoWallService]
})
export class AppModule {}
