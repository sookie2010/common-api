<template>
<div>
  <Row>
    <Col span="2">
      <div class="search-title">名称：</div>
    </Col>
    <Col span="4">
      <Input v-model="search.name" @on-enter="loadData" />
    </Col>

    <Col span="2">
      <div class="search-title">归属：</div>
    </Col>
    <Col span="3">
      <Select v-model="search.province" placeholder="省">
        <Option v-for="item in provinceList" :value="item.code" :key="item.code">{{ item.name }}</Option>
      </Select>
    </Col>
    <Col span="3">
      <Select v-model="search.city" placeholder="市">
        <Option v-for="item in cityList" :value="item.code" :key="item.code">{{ item.name }}</Option>
      </Select>
    </Col>
    <Col span="3">
      <Select v-model="search.area" placeholder="县/区">
        <Option v-for="item in areaList" :value="item.code" :key="item.code">{{ item.name }}</Option>
      </Select>
    </Col>
    <Col span="5" offset="2">
      <Button type="primary" shape="circle" @click="loadData" icon="ios-search">搜索</Button>
      <Button shape="circle" @click="reset" icon="ios-refresh">重置</Button>
    </Col>
  </Row>
  <div class="btn-container">
    <Button type="primary" >导出</Button>
  </div>
  <div class="table-container">
    <Table border :loading="loading" :columns="hitokotoColumns" :data="hitokotoData" height="520" @on-selection-change="dataSelect"></Table>
  </div>
  <div class="page-container">
    <Page :total="search.total" :current="search.pageNum" :page-size="search.limit" 
      show-total show-sizer show-elevator @on-change="pageChange" @on-page-size-change="pageSizeChange"></Page>
  </div>
</div>
</template>
<script>
import Table from 'view-design/src/components/table'
import Row from 'view-design/src/components/row'
import Col from 'view-design/src/components/col'
import Input from 'view-design/src/components/input'
import Select from 'view-design/src/components/select'
import Option from 'view-design/src/components/option'
import Button from 'view-design/src/components/button'
import Page from 'view-design/src/components/page'


export default {
  components: {
    Table, Row, Col, Input, Select, Option, Button, Page
  },
  data() {
    return {
      loading: false,
      search: {
        pageNum: 1,
        limit: 10,
        total: null
      },
      provinceList: [],
      cityList: [],
      areaList: [],
      chinaProvinceColumns: [{
          type: 'selection',
          key: '_id',
          width: 60,
          align: 'center'
        },{
          title: '编码',
          key: 'code'
        },{
          title: '名称',
          key: 'name'
        }],
      chinaProvinceData: []
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
      /*
      this.loading = true
      this.$http.get('/hitokoto/list', {params:this.search}).then(data => {
        selectedData = null
        this.loading = false
        this.search.total = data.total
        this.hitokotoData = data.data
      })*/
    },
    pageChange(pageNum) {
      this.search.pageNum = pageNum
      this.loadData()
    },
    pageSizeChange(pageSize) {
      this.search.limit = pageSize
      this.loadData()
    }
  },
  created() {
    this.$http.get('/common/config/hitokoto_type').then(data => {
      this.typeList = data
      this.loadData()
    })
  }
}
</script>
