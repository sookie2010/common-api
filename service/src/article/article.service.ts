import { Injectable, Logger } from '@nestjs/common'
import { Model, Types } from 'mongoose'
import { InjectModel } from '@nestjs/mongoose'
import { Page, MsgResult } from '../common/common.dto'
import CommonUtils from '../common/common.util'
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
    const searchParam = new ArticleQc(articleDto)
    const lookup = { $lookup: {
        from: 'article_keys',
        localField: '_id',
        foreignField: 'article_id',
        as: 'article_keys',
      },
    }
    const project = { $project : {
        _id: 1,
        title: 1,
        path: 1,
        categories: 1,
        tags: 1,
        create_date: 1,
        content_len: { $strLenCP: '$content' },
        is_splited: { $cond: [{ $gt: [ {$size: '$article_keys'}, 0 ] }, true, false ]},
      },
    }
    return this.articleModel.aggregate([
      lookup,
      project,
      { $match: searchParam },
      { $group: {_id: 1, total: {$sum: 1}} },
    ]).then((cnt: Array<{ total: number }>) => {
      if (!cnt.length) {
        page.total = 0
        return []
      }
      page.total = cnt[0].total
      return this.articleModel.aggregate([
        lookup,
        project,
        { $match: searchParam },
        { $sort: {create_date: -1}},
        { $skip: page.start },
        { $limit: page.limit },
      ])
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
        await this.articleKeysModel.create({_id: new Types.ObjectId(), article_id: article._id, keys: articleKeys})
      }
    }
    return Promise.resolve(new MsgResult(true, `${articles.length} 篇文章分词处理成功`))
  }
  /**
   * 文章内容全文检索
   * @param words 检索关键词
   * @param page 分页信息
   */
  async search(words: string, page: Page): Promise<Page> {
    const splitedWords: string[] = []
    for (const whiteSpaceSplited of words.split(/\s+/)) {
      splitedWords.push(...nodejieba.cut(whiteSpaceSplited, true))
    }
    const [ searchResult ]: ArticleDto[] = await this.articleKeysModel.aggregate([
      {$unwind: '$keys'},
      {$match: {keys: {$in: splitedWords}}},
      {$group: {_id: '$article_id', num: {$sum: 1}}},
      {$sort: {num: -1}},
      { $lookup: {
          from: 'article',
          localField: '_id',
          foreignField: '_id',
          as: 'articles',
        },
      },
      { $group: {_id: 1, articles: {$push: '$articles'}, total: {$sum: 1}}},
      { $project : {
          _id: 1,
          total: 1,
          articles: { $slice: ['$articles', page.start, page.limit] },
        },
      },
    ])
    if (!searchResult) {
      // 未查询到匹配的文章
      page.total = 0
      page.data = []
      return page
    }
    page.total = searchResult.total
    page.data = searchResult.articles.map((articleArr: Article[]) => {
      // 提取摘要 高亮关键词
      articleArr[0].content = this.createSummary(articleArr[0].content, splitedWords, 30)
      return articleArr[0]
    })
    return page
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
      const queryParams: Article = {
        // 标题
        title: xmlArticle.title,
        // 路径
        path: xmlArticle.path,
      }
      // 正文内容
      const articleContent: string = xmlArticle.content.__cdata.replace(/<[^>]*>/g, '')
      // 文章分类
      let categories = null
      // 文章标签
      let tags = null
      if ('categories' in xmlArticle) {
        // 单个子标签为字符串, 多个相同的子标签为数组
        categories = typeof xmlArticle.categories.category === 'string' ? [xmlArticle.categories.category] : xmlArticle.categories.category
      }
      if ('tags' in xmlArticle) {
        tags = typeof xmlArticle.tags.tag === 'string' ? [xmlArticle.tags.tag] : xmlArticle.tags.tag
      }
      const updateParams: Article = {
        content: articleContent,
        // 内容Hash
        content_hash: crypto.createHash('sha1').update(articleContent).digest('hex'),
        categories,
        tags,
        // 文章创建时间
        create_date: new Date(parseInt(xmlArticle.date, 10)),
      }

      let article: Article = await this.articleModel.findOne(queryParams, {_id: 1, content_hash: 1}).exec()

      if (article && article.content_hash !== updateParams.content_hash) { // 更新
        await this.articleModel.updateOne({_id: article._id}, {$set: updateParams})
        updateCnt ++
        // 更新文章分词
        await this.articleKeysModel.updateOne({article_id: article._id}, {$set: {keys: nodejieba.cut(articleContent, true)}})
      } else if (!article) { // 新增
        let articleId = new Types.ObjectId()
        article = Object.assign({_id: articleId}, queryParams, updateParams)
        await this.articleModel.create(article)
        createCnt ++
        // 保存文章分词
        await this.articleKeysModel.create({
          _id: new Types.ObjectId(),
          article_id: articleId, 
          keys: nodejieba.cut(article.content, true)
        })
      }
    }
    return new MsgResult(true, `拉取成功，更新 ${updateCnt} 篇，新增 ${createCnt} 篇`)
  }
  /**
   * 创建文章搜索结果摘要, 使用<strong>标签高亮关键词
   * @param content 文章正文内容
   * @param keyWords 关键词们
   * @param cutLen 每个关键词所在位置的截取区域长度
   * @returns 文章摘要信息
   */
  private createSummary(content: string, keyWords: string[], cutLen: number): string {
    const cutRanges: number[][] = []
    keyWords.forEach((keyWord: string) => {
      const keyWordIndex: number = content.indexOf(keyWord)
      if (keyWordIndex === -1) {
        return
      }
      const start: number = keyWordIndex - cutLen / 2 < 0 ? 0 : keyWordIndex - cutLen / 2
      const end: number = keyWordIndex + cutLen / 2 + keyWord.length > content.length ? content.length : keyWordIndex + cutLen / 2 + keyWord.length
      cutRanges.push([start, end])
    })
    cutRanges.sort((item1: number[], item2: number[]) => {
      if (item1[0] > item2[0]) {
        return 1
      } else if (item1[0] < item2[0]) {
        return -1
      } else {
        return 0
      }
    })
    let summary = ''
    let lastCutEnd = 0
    for (let index = 0 ; index < cutRanges.length ; index++) {
      const cutStart: number = cutRanges[index][0]
      let cutEnd: number = cutRanges[index][1]
      // 如果当前范围的末尾达到或超过下一个范围的开头
      while (index < cutRanges.length - 1 && cutRanges[index][1] >= cutRanges[index + 1][0]) {
        // 则把范围扩大到下一个范围的末尾
        cutEnd = cutRanges[index + 1][1]
        // 并将索引向前推进
        index ++
      }
      if (summary.length) {
        summary += ' ... '
      }
      summary += content.substring(cutStart, cutEnd)
      lastCutEnd = cutEnd
      if (summary.length > 150) { break }
    }
    summary = cutRanges[0][0] > 0 ? ('... ' + summary) : summary
    summary += lastCutEnd < content.length ? ' ...' : ''
    keyWords.forEach(keyWord => {
      summary = summary.replace(new RegExp(CommonUtils.escapeRegexStr(keyWord), 'g'), `<strong>${keyWord}</strong>`)
    })
    return summary
  }
  /**
   * 获取所有标签/分类
   * @param attr $tags或者$categories
   */
  async listAttrs(attr: string): Promise<string[]> {
    return (await this.articleModel.aggregate([
      {$unwind: attr},
      {$group: {_id: attr}},
    ])).map((item: {_id: string}) => item._id)
  }

  /**
   * 文章统计分析
   * @param type 查询的种类(normal 或 timelineWords)
   */
  async statistics(type: string): Promise<{categories?: [], publishDates?: [], timelineWords?: []}> {
    const result: {categories?: [], publishDates?: [], timelineWords?: []} = {}
    switch(type) {
      case 'normal': 
        // 文章分类统计
        result.categories = await this.articleModel.aggregate([
          {$unwind: '$categories'},
          {$group: {_id: '$categories', cnt:{$sum:1}}},
        ])
        // 文章发布时间统计
        result.publishDates = await this.articleModel.aggregate([
          {$project: {create_date_str:{$dateToString: {format:'%Y-%m', date:'$create_date', timezone:'+08'}}}},
          {$group: {_id: '$create_date_str', cnt:{$sum:1}}},
          {$sort: {_id: 1}},
        ])
        break
      case 'timelineWords':
        // 时间线高频词汇统计
        result.timelineWords = await this.articleKeysModel.aggregate([
          { $lookup: {
              from: 'article',
              localField: 'article_id',
              foreignField: '_id',
              as: 'article',
            },
          },
          {$unwind: '$article'},
          {$group: {
              _id: {$dateToString: {format:'%Y', date:'$article.create_date', timezone:'+08'}},
              keys: {$push: '$keys'}
            }
          },
          {$unwind: '$keys'},
          {$unwind: '$keys'},
          {$match: {keys:{$regex:/^[^x00-xff]{3,}$/}}}, // 双字节字符 3个字符或以上
          {$group: {_id: {yearMonth:'$_id', keyWord: '$keys'}, cnt: {$sum: 1}}},
          {$sort: {'_id.yearMonth':1, cnt: -1}},
          {$group: {_id: '$_id.yearMonth', keys: {$push: {key:'$_id.keyWord', total:'$cnt'}}}},
          {$project: {
              _id:1,
              keys: {$slice: ['$keys',0, 20]}
            }
          },
          {$sort: {'_id':1}}
        ])
        break
    }
    return result
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
