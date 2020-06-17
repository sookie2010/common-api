import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'
import CommonController from './common/controller/common.controller'
import CommonService from './common/service/common.service'

import Api from './api/api.module'
import System from './system/system.module'

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
      ...Api.schemas,
      ...System.schemas,
    ]),
  ],
  controllers: [
    ...Api.controllers,
    ...System.controllers,
    CommonController,
  ],
  providers: [
    ...Api.providers,
    ...System.providers,
    CommonService,
  ],
})
export class AppModule {}
