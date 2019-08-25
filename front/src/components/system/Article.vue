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
  </div>
  <div class="table-container">
    <Table border :loading="loading" :columns="articleColumns" :data="articleData" height="520" @on-selection-change="dataSelect"></Table>
  </div>
  <div class="page-container">
    <Page :total="search.total" :current="search.pageNum" :page-size="search.limit" 
      show-total show-sizer show-elevator @on-change="pageChange" @on-page-size-change="pageSizeChange"></Page>
  </div>
  
</div>
</template>
<script>
import Table from 'iview/src/components/table'
import Row from 'iview/src/components/row'
import Col from 'iview/src/components/col'
import Input from 'iview/src/components/input'
import DatePicker from 'iview/src/components/date-picker'
import Button from 'iview/src/components/button'
import Page from 'iview/src/components/page'
import Icon from 'iview/src/components/icon'
import Select from 'iview/src/components/select'
import Option from 'iview/src/components/option'

var selectedData = null
export default {
  components: {
    Table, Row, Col, Input, DatePicker, Button, Page, Select, Option
  },
  data() {
    return {
      loading: false,
      search: {
        pageNum: 1,
        limit: 10,
        total: null
      },
      articleColumns: [{
          type: 'selection',
          key: '_id',
          width: 60,
          align: 'center'
        },{
          title: '标题',
          key: 'title'
        },{
          title: '路径',
          key: 'path'
        },{
          title: '分类',
          key: 'categories',
          width: 150,
          render (h, data) {
            let categories = undefined
            if(typeof data.row.categories === 'string') {
              categories = data.row.categories
            } else if(Array.isArray(data.row.categories)) {
              categories = data.row.categories.join('，')
            }
            return h('span', categories)
          }
        },{
          title: '标签',
          key: 'tags',
          width: 180,
          render (h, data) {
            let tags = undefined
            if(typeof data.row.tags === 'string') {
              tags = data.row.tags
            } else if(Array.isArray(data.row.tags)) {
              tags = data.row.tags.join('，')
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
          render (h, data) {
            return h('span', new Date(data.row.create_date).Format('yyyy-MM-dd hh:mm:ss'))
          }
        },{
          title: '是否已分词',
          key: 'is_splited',
          width: 100,
          align: 'center',
          render (h, data) {
            return h(Icon, {
              props: {
                size: 20,
                type: data.row.is_splited ? 'md-checkmark' : 'md-close'
              }
            })
            // return h('span', data.row.is_splited ? '是' : '否')
          }
        }],
      articleData: [],
      tags: [], // 所有标签
      categories: [] // 所有分类
    }
  },
  methods: {
    reset() {
      this.search = {
        pageNum: 1,
        limit: 10,
        total: this.search.total
      }
      this.loadData()
    },
    loadData(resetPage) {
      if(resetPage) {
        this.search.pageNum = 1
        this.search.limit = 10
      }
      this.loading = true
      this.$http.get('/article/list', {params:this.search}).then(data => {
        selectedData = null
        this.loading = false
        this.search.total = data.total
        this.articleData = data.data
      })
    },
    splitWord() {
      if(!selectedData || !selectedData.length) {
        this.$Message.warning('请选择要执行分词的文章')
        return
      }
      this.$Modal.confirm({
        title: '操作确认',
        content: `<p>是否确认对选中的${selectedData.length}篇文章执行分词处理？</p>`,
        loading: true,
        onOk: () => {
          this.$http.put('/article/splitWord', {_ids: selectedData.map(item => item._id)}).then(data => {
            this.$Modal.remove()
            if(data.status) {
              this.$Message.success(data.msg)
            } else {
              this.$Message.warning(data.msg)
            }
          })
        }
      })
    },
    pullArticles() {
      this.$Modal.confirm({
        title: '操作确认',
        content: `<p>确认拉取全部文章？</p>`,
        loading: true,
        onOk: () => {
          this.$http.get('/article/pull').then(data => {
            this.$Modal.remove()
            if(data.status) {
              this.$Message.success(data.msg)
              this.loadData()
            } else {
              this.$Message.warning(data.msg)
            }
          })
        }
      })
    },
    pageChange(pageNum) {
      this.search.pageNum = pageNum
      this.loadData()
    },
    pageSizeChange(pageSize) {
      this.search.limit = pageSize
      this.loadData()
    },
    dataSelect(selection) {
      selectedData = selection
    }
  },
  created() {
    this.loadData()
    this.$http.get('/article/listCategories').then(data => {
      this.categories = data
    })
    this.$http.get('/article/listTags').then(data => {
      this.tags = data
    })
  }
}
</script>
