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
      <Select v-model="search.province" placeholder="省/直辖市" @on-change="provinceChange" clearable filterable>
        <Option v-for="item in provinceList" :value="item.province" :key="item.code">{{ item.name }}</Option>
      </Select>
    </Col>
    <Col span="3">
      <Select v-model="search.city" placeholder="市" @on-change="cityChange" clearable filterable>
        <Option v-for="item in cityList" :value="item.city" :key="item.code">{{ item.name }}</Option>
      </Select>
    </Col>
    <Col span="3">
      <Select v-model="search.area" placeholder="县/区" clearable filterable>
        <Option v-for="item in areaList" :value="item.area" :key="item.code">{{ item.name }}</Option>
      </Select>
    </Col>
    <Col span="5" offset="2">
      <Button type="primary" shape="circle" @click="loadData" icon="ios-search">搜索</Button>
      <Button shape="circle" @click="reset" icon="ios-refresh">重置</Button>
    </Col>
  </Row>
  <div class="btn-container">
    <Button type="primary" @click="$refs.table.exportCsv({ filename: '行政区划'})">导出</Button>
  </div>
  <div class="table-container">
    <Table border :loading="loading" ref="table" :columns="chinaProvinceColumns" :data="chinaProvinceData" height="520" ></Table>
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
      selectSearch: {},
      provinceList: [],
      cityList: [],
      areaList: [],
      chinaProvinceColumns: [{
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
    async loadData(resetPage) {
      if(resetPage) {
        this.search.pageNum = 1
        this.search.limit = 10
      }
      this.loading = true
      const data = await this.$http.get('/province/list', {params:this.search})
      this.loading = false
      this.search.total = data.total
      this.chinaProvinceData = data.data
    },
    pageChange(pageNum) {
      this.search.pageNum = pageNum
      this.loadData()
    },
    pageSizeChange(pageSize) {
      this.search.limit = pageSize
      this.loadData()
    },
    async provinceChange(value) {
      delete this.search.city
      delete this.search.area
      if(!value) {
        this.cityList.length = 0
        this.areaList.length = 0
        return
      }
      const data = await this.$http.get('/province/listAll', {params:{ province: value }})
      this.cityList = data
    },
    async cityChange(value) {
      delete this.search.area
      if(!value) {
        this.areaList.length = 0
        return
      }
      const data = await this.$http.get('/province/listAll', {params:{
          province: this.search.province,
          city: value
        }})
      this.areaList = data
    }
  },
  async created() {
    const data = await this.$http.get('/province/listAll')
    this.provinceList = data
  }
}
</script>
