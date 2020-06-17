import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'
import * as cors from 'cors'

(async () => {
  const app = await NestFactory.create(AppModule)
  app.use(cors({
    origin: 'http://localhost:8080',
    credentials: true,
  }))
  await app.listen(3301)
})()
