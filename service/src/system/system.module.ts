import SystemController from './controller/system.controller'
import ArticleController from './controller/article.controller'

import SystemService from './service/system.service'
import ArticleService from './service/article.service'

import { SystemConfigSchema } from './schema/system-config.schema'
import { SystemUserSchema } from './schema/system-user.schema'
import { SystemRoleSchema } from './schema/system-role.schema'
import { ArticleSchema, ArticleKeysSchema } from './schema/article.schema'

export default {
  controllers: [
    SystemController,
    ArticleController,
  ],
  providers: [
    SystemService,
    ArticleService,
  ],
  schemas: [
    { name: 'SystemConfig', schema: SystemConfigSchema },
    { name: 'SystemUser', schema: SystemUserSchema },
    { name: 'SystemRole', schema: SystemRoleSchema },
    { name: 'Article', schema: ArticleSchema },
    { name: 'ArticleKeys', schema: ArticleKeysSchema },
  ]
}