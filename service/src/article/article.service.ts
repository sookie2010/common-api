import { Injectable, Logger } from '@nestjs/common'
import { Model, Schema } from 'mongoose'
import { InjectModel } from '@nestjs/mongoose'
import { Page } from '../common/common.dto'
import { Article, ArticleKeys, ArticleDto, ArticleQc } from './article.interface'

import * as nodejieba from 'nodejieba'

@Injectable()
export default class ArticleService {
  constructor(@InjectModel('Article') private readonly articleModel: Model<Article>,
              @InjectModel('ArticleKeys') private readonly articleKeysModel: Model<ArticleKeys>) {
    nodejieba.load({})
  }
  /**
   * 查询文章列表
   * @param articleDto 查询条件
   * @param page 分页
   */
  async list(articleDto: ArticleDto, page: Page): Promise<Page> {
    const searchParam : ArticleQc = {}
    if (articleDto.title) {
      searchParam.title = {$regex: new RegExp(articleDto.title)}
    }
    if (articleDto.createDate && articleDto.createDate[0] && articleDto.createDate[1]) {
      searchParam.created_date = {
        $gte: new Date(articleDto.createDate[0]),
        $lte: new Date(articleDto.createDate[1]),
      }
    }
    return this.articleModel.countDocuments(searchParam).exec().then((cnt: number) => {
      page.total = cnt
      return this.articleModel.find(searchParam, {_id:1, title:1, path:1, create_date:1})
        .sort({create_date: -1})
        .skip(~~page.start)
        .limit(~~page.limit)
        .exec()
    }).then((articles: Article[]) => {
      page.data = articles
      return page
    })
  }
  /**
   * 对文章内容执行分词处理
   * @param ids 文章ID们
   */
  async splitWord(ids: string[]): Promise<object> {
    const articles: Article[] = await this.articleModel.find({_id: {$in: ids}}).exec()
    for(let article of articles) {
      const articleKeys: string[] = nodejieba.cut(article.content, true)
      Logger.log(`${article.title} 分词处理成功, 原文长度${article.content.length}, 分词数量: ${articleKeys.length}`)
      let cnt = await this.articleKeysModel.countDocuments({article_id: article._id}).exec()
      if(cnt > 0) {
        await this.articleKeysModel.updateOne({article_id: article._id}, {$set: {keys: articleKeys}})
      } else {
        await this.articleKeysModel.create({article_id: article._id, keys: articleKeys})
      }
    }
    return Promise.resolve({status: true, msg: '分词处理成功'})
  }
  /**
   * 文章内容全文检索
   * @param words 检索关键词
   * @param page 分页信息
   */
  async search(words: string, page: Page): Promise<Page> {
    const splitedWords = nodejieba.cut(words, true)
    const articleDtos: ArticleDto[] = await this.articleKeysModel.aggregate([
      {$unwind: '$keys'},
      {$match: {keys: {$in: splitedWords}}},
      {$group: {_id: '$article_id', num: {$sum: 1}}},
      {$sort: {num: -1}},
      // {$group: {_id: 1, articles: {$push: '$_id'}}}
    ])
    page.total = articleDtos.length
    const articleIds: Schema.Types.ObjectId[] = articleDtos
      .slice(page.start, page.start + (~~page.limit))
      .map((articleDtos: ArticleDto) => articleDtos._id)
    page.data = await this.articleModel.find({_id: {$in: articleIds}}, {title:1, path:1, create_date:1}).exec()
    return Promise.resolve(page)
  }
}
