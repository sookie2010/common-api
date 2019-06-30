import { Injectable, Logger } from '@nestjs/common'
import { Model, Schema } from 'mongoose'
import { InjectModel } from '@nestjs/mongoose'
import { Page, MsgResult } from '../common/common.dto'
import { Article, ArticleKeys, ArticleDto, ArticleQc } from './article.interface'
import SystemConfig from '../system/system-config.interface'

import * as nodejieba from 'nodejieba'
import * as xmlParser from 'fast-xml-parser'
import axios from 'axios'

const he = require('he')

@Injectable()
export default class ArticleService {
  constructor(@InjectModel('Article') private readonly articleModel: Model<Article>,
              @InjectModel('ArticleKeys') private readonly articleKeysModel: Model<ArticleKeys>,
              @InjectModel('SystemConfig') private readonly systemConfigModel: Model<SystemConfig>) {
    nodejieba.load({})
  }
  /**
   * 查询文章列表
   * @param articleDto 查询条件
   * @param page 分页
   */
  async list(articleDto: ArticleDto, page: Page): Promise<Page> {
    const searchParam: ArticleQc = {}
    if (articleDto.title) {
      searchParam.title = {$regex: new RegExp(articleDto.title)}
    }
    if (articleDto.createDate && articleDto.createDate[0] && articleDto.createDate[1]) {
      searchParam.create_date = {
        $gte: new Date(articleDto.createDate[0]),
        $lte: new Date(articleDto.createDate[1]),
      }
    }
    return this.articleModel.countDocuments(searchParam).exec().then((cnt: number) => {
      page.total = cnt
      return this.articleModel.find(searchParam, {_id: 1, title: 1, path: 1, create_date: 1})
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
  async splitWord(ids: string[]): Promise<MsgResult> {
    const articles: Article[] = await this.articleModel.find({_id: {$in: ids}}).exec()
    for (const article of articles) {
      const articleKeys: string[] = nodejieba.cut(article.content, true)
      Logger.log(`${article.title} 分词处理成功, 原文长度${article.content.length}, 分词数量: ${articleKeys.length}`)
      const cnt = await this.articleKeysModel.countDocuments({article_id: article._id}).exec()
      if (cnt > 0) {
        await this.articleKeysModel.updateOne({article_id: article._id}, {$set: {keys: articleKeys}})
      } else {
        await this.articleKeysModel.create({article_id: article._id, keys: articleKeys})
      }
    }
    return Promise.resolve(new MsgResult(true, '分词处理成功'))
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
      .map((articleDto: ArticleDto) => articleDto._id)
    page.data = await this.articleModel.find({_id: {$in: articleIds}}, {title: 1, path: 1, create_date: 1}).exec()
    return Promise.resolve(page)
  }
  /**
   * 从主站拉取全部文章(包含正文)
   */
  async pullArticles(): Promise<MsgResult> {
    const blogRootConfig: SystemConfig = await this.systemConfigModel.findOne({name: 'blog_root'}).exec()
    const response = await axios.get(`${blogRootConfig.value}search.xml`)
    if(!xmlParser.validate(response.data)) {
      return new MsgResult(false, '拉取search.xml失败')
    }
    const articleJsonObj = xmlParser.parse(response.data, xmlParseOptions)

    // TODO 处理后保存或更新到article
    articleJsonObj.search.entry.forEach(article => {
      console.log('标题: ==>', article.title)
      console.log('URL: ==>', decodeURI(article.url))
      console.log('内容: ==>', article.content.__cdata.replace(/<[^>]*>/g, '').substr(0,200))
      console.log('分类: ==>', article.categories) // 可能是数组或字符串
      console.log('标签: ==>', article.tags) // 可能是数组或字符串
      console.log('------------------------')
    })
    return new MsgResult(true, '拉取成功')
  }
}

const xmlParseOptions = {
  attributeNamePrefix : "@_",
  attrNodeName: "attr", //default is 'false'
  textNodeName : "#text",
  ignoreAttributes : true,
  ignoreNameSpace : false,
  allowBooleanAttributes : false,
  parseNodeValue : true,
  parseAttributeValue : false,
  trimValues: true,
  cdataTagName: "__cdata", //default is 'false'
  cdataPositionChar: "\\c",
  localeRange: "", //To support non english character in tag/attribute values.
  parseTrueNumberOnly: false,
  attrValueProcessor: (a: any) => he.decode(a, {isAttributeValue: true}),//default is a=>a
  tagValueProcessor : (a: any) => he.decode(a) //default is a=>a
}