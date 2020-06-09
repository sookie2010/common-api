<template>
<div>
  <Row>
    <Col span="2">
      <div class="search-title">内容：</div>
    </Col>
    <Col span="4">
      <Input v-model="search.content" @on-enter="loadDataBase(true)" />
    </Col>

    <Col span="2">
      <div class="search-title">类型：</div>
    </Col>
    <Col span="4">
      <Select v-model="search.type" clearable>
        <Option v-for="item in typeList" :value="item.value" :key="item.value">{{ item.label }}</Option>
      </Select>
    </Col>

    <Col span="2">
      <div class="search-title">创建时间：</div>
    </Col>
    <Col span="4">
      <Date-picker v-model="search.createdAt" type="daterange"  placement="bottom-end" placeholder="选择日期"></Date-picker>
    </Col>
  </Row>
  
  <div class="btn-container">
    <Button type="primary" @click="addModal = true">添加</Button>
    <Button type="error" @click="deleteAll">删除</Button>
    <div class="search-btn">
      <Button type="primary" @click="loadDataBase(true)" icon="md-search">搜索</Button>
      <Button @click.native="reset" icon="md-refresh">重置</Button>
    </div>
  </div>
  <div class="table-container">
    <Table border :loading="loading" :columns="hitokotoColumns" :data="hitokotoData" height="520" @on-selection-change="dataSelect"></Table>
  </div>
  <div class="page-container">
    <Page :page-size-opts="$store.state.pageSizeOpts" :total="search.total" :current="search.pageNum" :page-size="search.limit" 
      show-total show-sizer show-elevator @on-change="pageChange($event)" @on-page-size-change="pageSizeChange($event)"></Page>
  </div>
  <Modal v-model="addModal" title="新增一言" loading @on-ok="save">
    <HitokotoAdd :typeList="typeList" :formData="formData" />
  </Modal>
</div>
</template>
<script lang="ts">
import HitokotoAdd from './HitokotoAdd.vue'
import { Page } from '../../model/common.dto'
import BaseList from '../../model/baselist'
import HitokotoModel from '../../model/api/hitokoto'
import { Component } from 'vue-property-decorator'
import moment from 'moment'

let selectedData: string[] = []
@Component({ components: {HitokotoAdd} })
export default class Hitokoto extends BaseList<HitokotoPage> {
  protected search = new HitokotoPage()
  private typeList: {label: string, value: string}[] = []
  private hitokotoColumns = [{
      type: 'selection',
      key: '_id',
      width: 60,
      align: 'center'
    },{
      title: '类型',
      key: 'type',
      width: 180,
      render: (h: Function, {row}: {row: HitokotoModel}) => {
        const label = this.findTypeText(row.type)
        return label ? h('span', label) : undefined
      }
    },{
      title: '内容',
      key: 'hitokoto'
    },{
      title: '来自',
      key: 'from',
      width: 180
    },{
      title: '作者',
      key: 'creator',
      width: 180
    },{
      title: '编号',
      key: 'number',
      width: 70
    },{
      title: '创建时间',
      key: 'created_at',
      width: 180,
      render: (h: Function, {row}: {row: HitokotoModel}) => {
        return h('span', moment(row.created_at).format('YYYY-MM-DD HH:mm:ss'))
      }
    }]
  private hitokotoData: HitokotoModel[] = []
  private formData: {[propName:string]: string | null} = {}
  private addModal: boolean = false

  async loadData() {
    this.loading = true
    const { data } = await this.$http.get('/hitokoto/list', {params:this.search})
    selectedData = []
    this.loading = false
    this.search.total = data.total
    this.hitokotoData = data.data
  }
  async save() {
    const { data } = await this.$http.post('/hitokoto/save', this.formData)
    this.addModal = false
    this.$Message.success(data.message)
    this.loadData()
    // 清空表单
    this.formData = {}
  }
  deleteAll() {
    if(!selectedData.length) {
      this.$Message.warning('请选择要删除的数据')
      return
    }
    this.$Modal.confirm({
      title: '确认删除',
      content: `<p>是否确认删除选中的${selectedData.length}条数据？</p>`,
      loading: true,
      onOk: async () => {
        const { data } = await this.$http.delete('/hitokoto/delete', {params:{_ids: selectedData}})
        this.$Modal.remove()
        this.$Message.success(data.message)
        this.loadData()
      }
    })
  }
  dataSelect(selection: HitokotoModel[]) {
    selectedData = selection.map(item => item._id)
  }
  created() {
    this.loadData()
    this.$http.get('/common/config/hitokoto_type').then(({data}) => {
      this.typeList = data
    })
  }
  findTypeText(value: string): string | null {
    const type = this.typeList.find(item => item.value === value)
    return type ? type.label : null
  }
}

class HitokotoPage extends Page {
  content?: string
  type?: string
  createdAt?: [Date, Date]
  reset() {
    super.reset()
    this.content = undefined
    this.type = undefined
    this.createdAt = undefined
  }
}
</script>
