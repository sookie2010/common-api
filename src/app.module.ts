import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MongooseModule } from '@nestjs/mongoose';
import { HitokotoService } from './hitokoto/hitokoto.service';
import { HitokotoSchema } from './hitokoto/hitokoto.schema';
const dbConfig = require('../config/db.json');
@Module({
  imports: [
    MongooseModule.forRoot(`mongodb://${dbConfig.host}:${dbConfig.port}/${dbConfig.db_name}`, {
      useNewUrlParser: true,
      user: dbConfig.user,
      pass: dbConfig.password
    }),
    MongooseModule.forFeature([{ name: 'Hitokoto', schema: HitokotoSchema }])
  ],
  controllers: [AppController],
  providers: [AppService, HitokotoService],
})
export class AppModule {}
