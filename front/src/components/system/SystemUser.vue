<template>
<div>
  <Row>
    <Col span="3">
      <div class="search-title">用户名/昵称：</div>
    </Col>
    <Col span="4">
      <Input v-model="search.username" @on-enter="loadData" />
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
    <Table border :loading="loading" :columns="systemUserColumns" :data="systemUserData" height="520" ></Table>
  </div>
  <div class="page-container">
    <Page :total="search.total" :current="search.pageNum" :page-size="search.limit" 
      show-total show-sizer show-elevator @on-change="pageChange" @on-page-size-change="pageSizeChange"></Page>
  </div>
  <Modal v-model="addModal" :title="modalTitle" :loading="true" @on-ok="save">
    <Form :model="formData" :label-width="80">
      <Form-item label="用户名">
        <Input v-model="formData.username" />
      </Form-item>
      <Form-item label="密码">
        <Input v-model="formData.password" type="password" />
      </Form-item>
      <Form-item label="昵称">
        <Input v-model="formData.realname" />
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
import Button from 'view-design/src/components/button'
import Modal from 'view-design/src/components/modal'
import Form from 'view-design/src/components/form'
import FormItem from 'view-design/src/components/form-item'
import Page from 'view-design/src/components/page'

import moment from 'moment'

export default {
  components: {
    Table, Row, Col, Input, Button, Modal, Form, FormItem, Page
  },
  data() {
    return {
      loading: false,
      search: {
        pageNum: 1,
        limit: 10,
        total: null
      },
      systemUserColumns: [{
          title: '用户名',
          key: 'username'
        },{
          title: '姓名',
          key: 'realname'
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
            return data.row.updated_at ? h('span', moment(data.row.updated_at).format('YYYY-MM-DD HH:mm:ss')) : undefined
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
      systemUserData: [],
      addModal: false,
      modalTitle: null,
      formData: {
        _id: null,
        username: null,
        password: null,
        realname: null
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
      const data = await this.$http.get('/system/user/list', {params:this.search})
      this.loading = false
      this.search.total = data.total
      this.systemUserData = data.data
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
        this.formData[key] = null
      })
      this.modalTitle = '新增用户'
      this.addModal = true
    },
    update(row) {
      this.formData._id = row._id
      this.formData.username = row.username
      this.formData.realname = row.realname
      this.modalTitle = '修改用户'
      this.addModal = true
    },
    async save() {
      const { msg } = await this.$http.post('/system/user/save', this.formData)
      this.addModal = false
      this.$Message.success(msg)
      this.loadData()
      // 清空表单
      Object.keys(this.formData).forEach(key => {
        this.formData[key] = null
      })
    },
    delete(row) {
      this.$Modal.confirm({
        title: '确认删除',
        content: `<p>是否确认删除 ${row.username} 用户？</p>`,
        loading: true,
        onOk: async () => {
          const data = await this.$http.delete('/system/user/delete', {params: {id: row._id}})
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