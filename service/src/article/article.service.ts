import { Injectable, Logger } from '@nestjs/common'
import { Model, Schema, Types } from 'mongoose'
import { InjectModel } from '@nestjs/mongoose'
import { Page, MsgResult } from '../common/common.dto'
import { Article, ArticleKeys, ArticleDto, ArticleQc } from './article.interface'
import SystemConfig from '../system/system-config.interface'

import * as nodejieba from 'nodejieba'
import * as xmlParser from 'fast-xml-parser'
import axios from 'axios'

const he = require('he')
const crypto = require('crypto')

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
    const response = await axios.get(`${blogRootConfig.value}articles.xml`)
    if (!xmlParser.validate(response.data)) {
      return new MsgResult(false, 'articles.xml内容无效')
    }
    const articleJsonObj = xmlParser.parse(response.data, xmlParseOptions)
    let updateCnt: number = 0 // 更新文章计数
    let createCnt: number = 0 // 新增文章计数
    for (const xmlArticle of articleJsonObj.search.entry) {
      const queryFields: Article = {
        // 标题
        title: xmlArticle.title,
        // 路径
        path: xmlArticle.path,
      }
      // 正文内容
      const articleContent: string = xmlArticle.content.__cdata.replace(/<[^>]*>/g, '')
      const updateFields: Article = {
        content: articleContent,
        // 内容Hash
        content_hash: crypto.createHash('sha1').update(articleContent).digest('hex'),
        // 文章分类
        categories: typeof xmlArticle.categories === 'string' ? [xmlArticle.categories] : xmlArticle.categories,
        // 文章标签
        tags: typeof xmlArticle.tags === 'string' ? [xmlArticle.tags] : xmlArticle.tags,
        // 文章创建时间
        create_date: new Date(~~xmlArticle.date),
      }

      let article: Article = await this.articleModel.findOne(queryFields).exec()

      if (article && article.content_hash !== updateFields.content_hash) { // 更新
        await this.articleModel.updateOne(queryFields, {$set: updateFields})
        updateCnt ++
      } else if (!article) { // 新增
        article = Object.assign({_id: new Types.ObjectId()}, queryFields, updateFields)
        await this.articleModel.create(article)
        createCnt ++
      }
    }
    return new MsgResult(true, `拉取成功，更新 ${updateCnt} 篇，新增 ${createCnt} 篇`)
  }
}

const xmlParseOptions = {
  attributeNamePrefix : '@_',
  attrNodeName: 'attr', // default is 'false'
  textNodeName : '#text',
  ignoreAttributes : true,
  ignoreNameSpace : false,
  allowBooleanAttributes : false,
  parseNodeValue : true,
  parseAttributeValue : false,
  trimValues: true,
  cdataTagName: '__cdata', // default is 'false'
  cdataPositionChar: '\\c',
  localeRange: '', // To support non english character in tag/attribute values.
  parseTrueNumberOnly: false,
  attrValueProcessor: (a: any) => he.decode(a, {isAttributeValue: true}), // default is a=>a
  tagValueProcessor : (a: any) => he.decode(a), // default is a=>a
}
