<template>
<div>
  <Row>
    <Col span="3">
      <div class="search-title">角色名称/描述：</div>
    </Col>
    <Col span="4">
      <Input v-model="search.name" @on-enter="loadData" />
    </Col>
    <Col span="5" offset="12">
      <Button type="primary" shape="circle" @click="loadData" icon="ios-search">搜索</Button>
      <Button shape="circle" @click="reset" icon="ios-refresh">重置</Button>
    </Col>
  </Row>
  <div class="btn-container">
    <Button type="primary" @click="add">添加</Button>
  </div>
  <div class="table-container">
    <Table border :loading="loading" :columns="systemRoleColumns" :data="systemRoleData" height="520" ></Table>
  </div>
  <div class="page-container">
    <Page :total="search.total" :current="search.pageNum" :page-size="search.limit" 
      show-total show-sizer show-elevator @on-change="pageChange" @on-page-size-change="pageSizeChange"></Page>
  </div>
  <Modal v-model="addModal" :title="modalTitle" :loading="true" @on-ok="save">
    <Form :model="formData" :label-width="120">
      <Form-item label="角色名称">
        <Input v-model="formData.name" />
      </Form-item>
      <Form-item label="描述">
        <Input v-model="formData.description" />
      </Form-item>
      <Form-item label="允许的请求类型">
        <Select v-model="formData.methods" multiple >
          <Option value="GET">GET</Option>
          <Option value="POST">POST</Option>
          <Option value="PUT">PUT</Option>
          <Option value="DELETE">DELETE</Option>
        </Select>
      </Form-item>
      <Form-item label="允许的URI">
        
      </Form-item>
      <Form-item label="禁止的URI">
        
      </Form-item>
    </Form>
  </Modal>
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
import Modal from 'view-design/src/components/modal'
import Form from 'view-design/src/components/form'
import FormItem from 'view-design/src/components/form-item'
import Page from 'view-design/src/components/page'
import Tag from 'view-design/src/components/tag'

import moment from 'moment'

export default {
  components: {
    Table, Row, Col, Input, Select, Option, Button, Modal, Form, FormItem, Page
  },
  data() {
    return {
      loading: false,
      search: {
        pageNum: 1,
        limit: 10,
        total: null
      },
      systemRoleColumns: [{
          title: '角色名称',
          key: 'name'
        },{
          title: '允许的请求类型',
          key: 'methods',
          render (h, data) {
            return h('div', data.row.methods.map(method => {
              return h(Tag, {
                props: {color: 'default'},
                style: {marginRight: '5px'}
              },method)
            }))
          }
        },{
          title: '创建时间',
          key: 'created_at',
          render (h, data) {
            return h('span', moment(data.row.created_at).format('YYYY-MM-DD HH:mm:ss'))
          }
        },{
          title: '更新时间',
          key: 'updated_at',
          render (h, data) {
            return h('span', moment(data.row.updated_at).format('YYYY-MM-DD HH:mm:ss'))
          }
        },{
          title: '操作',
          render: (h, data) => {
            return h('div', [
              h(Button, {
                props: {size:'small'},
                style: {marginRight: '5px'},
                on: { click: () => {this.update(data.row) } }
              },'修改'),
              h(Button, {
                props: {size:'small', type:'error', ghost:true},
                on: { click: () => {this.delete(data.row) } }
              },'删除')
            ])
          }
        }],
      systemRoleData: [],
      addModal: false,
      modalTitle: null,
      formData: {
        _id: null,
        name: null,
        description: null,
        methods: [],
        include_uri: [],
        exclude_uri: []
      }
    }
  },
  methods: {
    reset() {
      this.search = {}
      this.loadData()
    },
    async loadData() {
      this.loading = true
      const data = await this.$http.get('/system/role/list', {params:this.search})
      this.loading = false
      this.search.total = data.total
      this.systemRoleData = data.data
    },
    pageChange(pageNum) {
      this.search.pageNum = pageNum
      this.loadData()
    },
    pageSizeChange(pageSize) {
      this.search.limit = pageSize
      this.loadData()
    },
    add() {
      // 清空表单
      Object.keys(this.formData).forEach(key => {
        if(Array.isArray(this.formData[key])) {
          this.formData[key].splice(0, this.formData[key].length)
        } else {
          this.formData[key] = null
        }
      })
      this.modalTitle = '新增角色'
      this.addModal = true
    },
    update(row) {
      this.formData._id = row._id
      this.formData.name = row.name
      this.formData.description = row.description
      this.formData.methods = row.methods
      this.formData.include_uri = row.include_uri
      this.formData.exclude_uri = row.exclude_uri
      this.modalTitle = '修改角色'
      this.addModal = true
    },
    async save() {
      const { msg } = await this.$http.post('/system/role/save', this.formData)
      this.addModal = false
      this.$Message.success(msg)
      this.loadData()
      // 清空表单
      Object.keys(this.formData).forEach(key => {
        if(Array.isArray(this.formData[key])) {
          this.formData[key].splice(0, this.formData[key].length)
        } else {
          this.formData[key] = null
        }
      })
    },
    delete(row) {
      this.$Modal.confirm({
        title: '确认删除',
        content: `<p>是否确认删除 ${row.name} 角色？</p>`,
        loading: true,
        onOk: async () => {
          const data = await this.$http.delete('/system/role/delete', {params: {id: row._id}})
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
  },
  created() {
    this.loadData()
  }
}
</script>