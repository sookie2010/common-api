<template>
<div>
  <Row>
    <Col span="2">
      <div class="search-title">名称：</div>
    </Col>
    <Col span="4">
      <Input v-model="search.name" @on-enter="loadDataBase(true)" />
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
  </Row>
  <div class="btn-container">
    <Button type="primary" @click="$refs.table.exportCsv({ filename: '行政区划'})">导出</Button>
    <div class="search-btn">
      <Button type="primary" @click="loadDataBase(true)" icon="md-search">搜索</Button>
      <Button @click.native="reset" icon="md-refresh">重置</Button>
    </div>
  </div>
  <div class="table-container">
    <Table border :loading="loading" ref="table" :columns="chinaProvinceColumns" :data="chinaProvinceData" height="520" ></Table>
  </div>
  <div class="page-container">
    <Page :page-size-opts="$store.state.pageSizeOpts" :total="search.total" :current="search.pageNum" :page-size="search.limit" 
      show-total show-sizer show-elevator @on-change="pageChange($event)" @on-page-size-change="pageSizeChange($event)"></Page>
  </div>
</div>
</template>
<script lang="ts">
import { Component } from 'vue-property-decorator'
import { Page } from '../../model/common.dto'
import BaseList from '../../model/baselist'

@Component({})
export default class ChinaProvince extends BaseList<ChinaProvincePage> {
  protected search = new ChinaProvincePage()
  private selectSearch = {}
  private provinceList = []
  private cityList = []
  private areaList = []
  private chinaProvinceColumns = [{
      title: '编码',
      key: 'code'
    },{
      title: '名称',
      key: 'name'
    }]
  private chinaProvinceData = []

  async loadData() {
    this.loading = true
    const { data } = await this.$http.get('/province/list', {params:this.search})
    this.loading = false
    this.search.total = data.total
    this.chinaProvinceData = data.data
  }
  async provinceChange(value: string) {
    delete this.search.city
    delete this.search.area
    if(!value) {
      this.cityList.length = 0
      this.areaList.length = 0
      return
    }
    this.cityList = (await this.$http.get('/province/listAll', {params:{ province: value }})).data
  }
  async cityChange(value: string) {
    delete this.search.area
    if(!value) {
      this.areaList.length = 0
      return
    }
    this.areaList = (await this.$http.get('/province/listAll', {params:{
        province: this.search.province,
        city: value
      }})).data
  }
  async created() {
    this.provinceList = (await this.$http.get('/province/listAll')).data
  }
}
class ChinaProvincePage extends Page {
  name?: string
  city?: string
  area?: string
  province? : string
  reset() {
    super.reset()
    this.name = undefined
    this.city = undefined
    this.area = undefined
    this.province = undefined
  }
}
</script>
