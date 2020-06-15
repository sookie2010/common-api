import { PipeTransform, ArgumentMetadata, Injectable } from '@nestjs/common'
import { Page } from './common.dto'

@Injectable()
export default class PageTransform implements PipeTransform<Page> {
  async transform(page: Page, metadata: ArgumentMetadata) {
    page.limit = +page.limit || 10
    page.pageNum = +page.pageNum || 1
    if (page.start) {
      page.start = +page.start
    } else {
      page.start = page.limit * (page.pageNum - 1)
    }
    return page
  }
}
