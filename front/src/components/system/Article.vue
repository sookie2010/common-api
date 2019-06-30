<template>
<div>
  <Row>
    <Col span="2">
      <div class="search-title">标题：</div>
    </Col>
    <Col span="4">
      <Input v-model="search.title" @on-enter="loadData" />
    </Col>

    <Col span="2">
      <div class="search-title">创建时间：</div>
    </Col>
    <Col span="4">
      <Date-picker v-model="search.createDate" type="daterange"  placement="bottom-end" placeholder="选择日期"></Date-picker>
    </Col>
    <Col span="5" offset="1">
      <Button type="primary" shape="circle" @click="loadData" icon="ios-search">搜索</Button>
      <Button shape="circle" @click="reset" icon="ios-refresh">重置</Button>
    </Col>
  </Row>
  
  <div class="btn-container">
    <Button @click="splitWord">分词处理</Button>
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

var selectedData = null
export default {
  components: {
    Table, Row, Col, Input, DatePicker, Button, Page
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
          title: '创建时间',
          key: 'create_date',
          width: 200,
          render (h, data) {
            return h('span', new Date(data.row.create_date).Format('yyyy-MM-dd hh:mm:ss'))
          }
        }],
      articleData: []
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
  }
}
</script>
