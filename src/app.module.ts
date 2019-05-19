import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MongooseModule } from '@nestjs/mongoose';
import { HitokotoService } from './hitokoto/hitokoto.service';
import { HitokotoSchema } from './hitokoto/hitokoto.schema';

@Module({
  imports: [
    MongooseModule.forRoot('mongodb://localhost:27017/common_api', {
      useNewUrlParser: true,
      user: 'sookie',
      pass: '123456'
    }),
    MongooseModule.forFeature([{ name: 'Hitokoto', schema: HitokotoSchema }])
  ],
  controllers: [AppController],
  providers: [AppService, HitokotoService],
})
export class AppModule {}
