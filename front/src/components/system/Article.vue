<template>
<div>
  <div class="search-panel">
  <Row class-name="search-row">
    <Col span="2">
      <div class="search-title">标题：</div>
    </Col>
    <Col span="3">
      <Input v-model="search.title" @on-enter="loadData" />
    </Col>

    <Col span="2">
      <div class="search-title">创建时间：</div>
    </Col>
    <Col span="3">
      <Date-picker v-model="search.createDate" type="daterange"  placement="bottom-end" placeholder="选择日期"></Date-picker>
    </Col>

    <Col span="2">
      <div class="search-title">分类：</div>
    </Col>
    <Col span="3">
      <Select v-model="search.category" filterable clearable>
        <Option v-for="item in categories" :value="item" :key="item">{{ item }}</Option>
      </Select>
    </Col>

    <Col span="2">
      <div class="search-title">标签：</div>
    </Col>
    <Col span="3">
      <Select v-model="search.tag" filterable clearable>
        <Option v-for="item in tags" :value="item" :key="item">{{ item }}</Option>
      </Select>
    </Col>
    
  </Row>
  <Row class-name="search-row">
    <Col span="2" >
      <div class="search-title">已分词：</div>
    </Col>
    <Col span="3">
      <Select v-model="search.isSplited" clearable>
        <Option value="true" >是</Option>
        <Option value="false" >否</Option>
      </Select>
    </Col>

    <Col span="3" offset="1">
      <Button type="primary" shape="circle" @click="loadData" icon="ios-search">搜索</Button>
      <Button shape="circle" @click="reset" icon="ios-refresh">重置</Button>
    </Col>
  </Row>
  </div>
  <div class="btn-container">
    <Button type="primary" @click="splitWord">分词处理</Button>
    <Button @click="pullArticles">拉取文章</Button>
    <Upload :action="($http.defaults.baseURL || '') + '/system/deployBlog'" 
      name="blogZip" :show-upload-list="false" 
      :format="allowUploadExt" :headers="uploadHeaders" :max-size="102400" 
      :before-upload="beforeUpload" :on-success="uploadSuccess" @on-error="uploadError"
      :on-format-error="uploadFormatError" :on-exceeded-size="uploadFileSizeError"
      style="display: inline-block;">
      <Button type="primary" icon="ios-cloud-upload-outline">发布博客</Button>
    </Upload>
  </div>
  <Row>
    <Col span="4" style="height:520px;overflow:auto;">
      <Tree :data="articleTree" :load-data="loadTreeData" @on-select-change="articlePreview"></Tree>
    </Col>
    <Col span="20">
      <div class="table-container">
        <Table border :loading="loading" :columns="articleColumns" :data="articleData" height="520" @on-selection-change="dataSelect"></Table>
      </div>
    </Col>
  </Row>
  
  <div class="page-container">
    <Page :total="search.total" :current="search.pageNum" :page-size="search.limit" 
      show-total show-sizer show-elevator @on-change="pageChange" @on-page-size-change="pageSizeChange"></Page>
  </div>
  <Drawer :closable="false" width="40" v-model="markdownPreview.show" :title="markdownPreview.title" >
    <div v-html="markdownPreview.content"></div>
  </Drawer>
</div>
</template>
<script lang="ts">
import moment from 'moment'
import hyperdown from 'hyperdown'
import prismjs from 'prismjs'
import { Component, Vue } from 'vue-property-decorator'
import { Icon } from 'view-design'
import { MsgResult, Page } from '../../model/common.dto'
import { ArticleModel, TreeNode, TreeNodeSource } from '../../model/system/article'

import 'prismjs/themes/prism.css'

let selectedData: string[] = []
let closeUploadTip: Function | void | null

@Component({})
export default class Article extends Vue {
  private loading: boolean = false
  private search = new Page()
  private allowUploadExt = ['zip']
  private uploadHeaders = {token: localStorage.getItem('login_token')}
  private articleColumns = [{
      type: 'selection',
      key: '_id',
      width: 60,
      align: 'center'
    },{
      title: '标题',
      key: 'title'
    },{
      title: '路径',
      key: 'path',
      render (h: Function, {row}: {row: ArticleModel}) {
        return h('span', row.path.join('/'))
      }
    },{
      title: '分类',
      key: 'categories',
      width: 150,
      render (h: Function, {row}: {row: ArticleModel}) {
        let categories = undefined
        if(typeof row.categories === 'string') {
          categories = row.categories
        } else if(Array.isArray(row.categories)) {
          categories = row.categories.join('，')
        }
        return h('span', categories)
      }
    },{
      title: '标签',
      key: 'tags',
      width: 180,
      render (h: Function, {row}: {row: ArticleModel}) {
        let tags = undefined
        if(typeof row.tags === 'string') {
          tags = row.tags
        } else if(Array.isArray(row.tags)) {
          tags = row.tags.join('，')
        }
        return h('span', tags)
      }
    },{
      title: '正文长度',
      key: 'content_len',
      width: 100
    },{
      title: '创建时间',
      key: 'create_date',
      width: 180,
      render (h: Function, {row}: {row: ArticleModel}) {
        return h('span', moment(row.create_date).format('YYYY-MM-DD HH:mm:ss'))
      }
    },{
      title: '是否已分词',
      key: 'is_splited',
      width: 120,
      align: 'center',
      render (h: Function, {row}: {row: ArticleModel}) {
        return h(Icon, {
          props: {
            size: 20,
            type: row.is_splited ? 'md-checkmark' : 'md-close'
          }
        })
      }
    }]
  private articleData: ArticleModel[] = []
  private articleTree: TreeNode[] = []
  private tags: string[] = [] // 所有标签
  private categories: string[] = [] // 所有分类
  private markdownPreview :{ // markdown内容预览
    show?: boolean,
    title?: string | null,
    content?: string | null
  } = {
    show: false,
    title: null,
    content: null
  }

  reset() {
    this.loadData(true)
  }
  async loadData(resetPage?: boolean) {
    if(resetPage) {
      this.search.reset()
    }
    this.loading = true
    const { data } = await this.$http.get('/article/list', {params:this.search})
    selectedData = []
    this.loading = false
    this.search.total = data.total
    this.articleData = data.data
  }
  splitWord() {
    if(!selectedData.length) {
      this.$Message.warning('请选择要执行分词的文章')
      return
    }
    this.$Modal.confirm({
      title: '操作确认',
      content: `<p>是否确认对选中的${selectedData.length}篇文章执行分词处理？</p>`,
      loading: true,
      onOk: async () => {
        const { data } = await this.$http.put('/article/splitWord', {_ids: selectedData})
        this.$Modal.remove()
        if(data.status) {
          this.$Message.success(data.msg)
        } else {
          this.$Message.warning(data.msg)
        }
      }
    })
  }
  pullArticles() {
    this.$Modal.confirm({
      title: '操作确认',
      content: `<p>确认拉取全部文章？</p>`,
      loading: true,
      onOk: async () => {
        const { data } = await this.$http.get('/article/pull')
        this.$Modal.remove()
        if(data.status) {
          this.$Message.success(data.msg)
          this.loadData()
        } else {
          this.$Message.warning(data.msg)
        }
      }
    })
  }
  pageChange(pageNum: number) {
    this.search.pageNum = pageNum
    this.loadData()
  }
  pageSizeChange(pageSize: number) {
    this.search.limit = pageSize
    this.loadData()
  }
  dataSelect(selection: ArticleModel[]) {
    selectedData = selection.map(item => item._id)
  }
  beforeUpload(file: File) {
    let filenameCut = undefined
    if(file.name.length > 15) {
      filenameCut = file.name.substr(0, 15) + '...'
    }
    closeUploadTip = this.$Message.loading({
      content: (filenameCut || file.name) + ' 正在上传，请稍候...',
      duration: 0
    })
    return true
  }
  uploadFormatError() {
    this.closeUploadTip()
    this.$Message.error(`只能上传 ${this.allowUploadExt.join('、')} 格式的文件`)
  }
  uploadFileSizeError() {
    this.closeUploadTip()
    this.$Message.error(`只能上传不超过100MB的文件`)
  }
  uploadSuccess(response: MsgResult) {
    this.closeUploadTip()
    if(response.status) {
      this.$Message.success(response.msg)
    } else {
      this.$Message.warning(response.msg)
    }
  }
  uploadError() {
    this.closeUploadTip()
    this.$Message.error('上传失败')
  }
  closeUploadTip() {
    if(typeof closeUploadTip === 'function') {
      closeUploadTip.call(this)
      closeUploadTip = null
    }
  }
  async loadTreeData(item: TreeNode, callback: Function) {
    const childItems: TreeNodeSource[] = (await this.$http.get('/article/tree', {params:{deep:item.deep+1, parent:item.name}})).data
    callback(childItems.map((childItem): TreeNode => {
      const treeNode: TreeNode = { name: childItem._id, deep: item.deep+1, expand: false }
      if(childItem.article_id) {
        // 已是叶子结点
        treeNode.title = childItem._id
        treeNode.id = childItem.article_id
      } else {
        // 仍有下级节点
        treeNode.title = `${childItem._id}(${childItem.cnt})`
        treeNode.children = []
        treeNode.loading = false
      }
      return treeNode
    }))
  }
  /**
   * 树节点选中事件
   * @param selectNodes 当前已选中的节点(适用于带复选框的)
   * @param curNode 本次选中的节点
   */
  async articlePreview(selectNodes: TreeNode[], curNode: TreeNode) {
    if(!curNode.id) {
      return
    }
    // 加载文章markdown预览
    this.$Loading.start()
    const mdText = (await this.$http.get('/article/markdown', {params:{id:curNode.id}})).data
    this.$Loading.finish()
    this.markdownPreview.show = true
    const markdownHtml = new hyperdown().makeHtml(mdText)
    this.markdownPreview.content = markdownHtml.replace(/(?<=<pre><code[^>]*?>)[\s\S]*?(?=<\/code><\/pre>)/gi, v => {
      v = v.replace(/_&/g, ' ').replace(/&quot;/g, '"').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&')
      return prismjs.highlight(v, prismjs.languages.javascript, 'javascript')
    })
    this.markdownPreview.title = curNode.name
  }
  async created() {
    this.loadData()
    this.categories = (await this.$http.get('/article/listCategories')).data
    this.tags = (await this.$http.get('/article/listTags')).data
    this.loadTreeData({deep:-1, name: null, expand: false}, (treeNodes: TreeNode[]) => {
      this.articleTree.push(...treeNodes)
    })
  }
}
</script>
