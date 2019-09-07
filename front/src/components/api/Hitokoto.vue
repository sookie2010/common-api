<template>
<div>
  <Row>
    <Col span="2">
      <div class="search-title">内容：</div>
    </Col>
    <Col span="4">
      <Input v-model="search.content" @on-enter="loadData" />
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
      <Date-picker v-model="search.createAt" type="daterange"  placement="bottom-end" placeholder="选择日期"></Date-picker>
    </Col>
    <Col span="5" offset="1">
      <Button type="primary" shape="circle" @click="loadData" icon="ios-search">搜索</Button>
      <Button shape="circle" @click="reset" icon="ios-refresh">重置</Button>
    </Col>
  </Row>
  
  <div class="btn-container">
    <Button type="primary" @click="addModal = true">添加</Button>
    <Button type="error" @click="deleteAll">删除</Button>
  </div>
  <div class="table-container">
    <Table border :loading="loading" :columns="hitokotoColumns" :data="hitokotoData" height="520" @on-selection-change="dataSelect"></Table>
  </div>
  <div class="page-container">
    <Page :total="search.total" :current="search.pageNum" :page-size="search.limit" 
      show-total show-sizer show-elevator @on-change="pageChange" @on-page-size-change="pageSizeChange"></Page>
  </div>
  <Modal v-model="addModal" title="新增一言" :loading="true" @on-ok="save">
    <HitokotoAdd :typeList="typeList" :formData="formData" />
  </Modal>
</div>
</template>
<script>
import Table from 'iview/src/components/table'
import Row from 'iview/src/components/row'
import Col from 'iview/src/components/col'
import Input from 'iview/src/components/input'
import Select from 'iview/src/components/select'
import Option from 'iview/src/components/option'
import DatePicker from 'iview/src/components/date-picker'
import Button from 'iview/src/components/button'
import Page from 'iview/src/components/page'
import Modal from 'iview/src/components/modal'

import HitokotoAdd from './HitokotoAdd'

var selectedData = null
export default {
  components: {
    Table, Row, Col, Input, Select, Option, DatePicker, Button, Page, Modal, HitokotoAdd
  },
  data() {
    return {
      loading: false,
      search: {
        pageNum: 1,
        limit: 10,
        total: null
      },
      typeList: [],
      hitokotoColumns: [{
          type: 'selection',
          key: '_id',
          width: 60,
          align: 'center'
        },{
          title: '类型',
          key: 'type',
          width: 150,
          render: (h, data) => {
            let type = this.typeList.find(item => item.value === data.row.type)
            return type ? h('span', type.label) : undefined
          }
        },{
          title: '内容',
          key: 'hitokoto'
        },{
          title: '来自',
          key: 'from',
          width: 150
        },{
          title: '作者',
          key: 'creator',
          width: 150
        },{
          title: '编号',
          key: 'number',
          width: 70
        },{
          title: '创建时间',
          key: 'created_at',
          width: 150,
          render (h, data) {
            return h('span', new Date(data.row.created_at).Format('yyyy-MM-dd hh:mm:ss'))
          }
        }],
      hitokotoData: [],
      formData: {
        hitokoto: null,
        type: null,
        from: null,
        creator: null
      },
      addModal: false
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
      this.$http.get('/hitokoto/list', {params:this.search}).then(data => {
        selectedData = null
        this.loading = false
        this.search.total = data.total
        this.hitokotoData = data.data
      })
    },
    save() {
      this.$http.post('/hitokoto/save', this.formData).then(data => {
        this.addModal = false
        this.$Message.success(data.msg)
        this.loadData()
        // 清空表单
        Object.keys(this.formData).forEach(key => {
          this.formData[key] = null
        })
      })
    },
    deleteAll() {
      if(!selectedData || !selectedData.length) {
        this.$Message.warning('请选择要删除的数据')
        return
      }
      this.$Modal.confirm({
        title: '确认删除',
        content: `<p>是否确认删除选中的${selectedData.length}条数据？</p>`,
        loading: true,
        onOk: () => {
          this.$http.delete('/hitokoto/delete', {params:{_ids: selectedData.map(item => item._id)}}).then(data => {
            this.$Modal.remove()
            this.$Message.success(data.msg)
            this.loadData()
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
    this.$http.get('/common/config/hitokoto_type').then(data => {
      this.typeList = data
      this.loadData()
    })
  }
}
</script>
