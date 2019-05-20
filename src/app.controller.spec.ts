import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { HitokotoService } from './hitokoto/hitokoto.service';
import { MongooseModule } from '@nestjs/mongoose';
import { HitokotoSchema } from './hitokoto/hitokoto.schema';

const dbConfig = require('../config/db.json');
describe('AppController', () => {
  let appController: AppController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
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
    }).compile();

    appController = app.get<AppController>(AppController);
  });

  describe('root', () => {
    it('should return "Hello World!"', () => {
      expect(appController.getHello()).toBe('Hello World!');
    });
  });
});
