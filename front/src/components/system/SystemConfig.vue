<template>
<div>
  <Row>
    <Col span="3">
      <div class="search-title">配置项：</div>
    </Col>
    <Col span="4">
      <Input v-model="search.name" @on-enter="loadData" placeholder="名称/描述" />
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
    <Table :loading="loading" :columns="systemConfigColumns" :data="systemConfigData" height="520" ></Table>
  </div>
  <Modal v-model="addModal" :title="modalTitle" >
    <SystemConfigAdd :formData="formData" />
    <div slot="footer">
      <Button type="text" @click="addModal = false">取消</Button>
      <Button type="primary" @click="save">保存</Button>
    </div>
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

import SystemConfigAdd from './SystemConfigAdd'

import moment from 'moment'

export default {
  components: {
    Table, Row, Col, Input, Button, Modal, SystemConfigAdd
  },
  data() {
    return {
      loading: false,
      search: {},
      systemConfigColumns: [{
          type: 'expand',
          width: 50,
          render: (h, data) => {
            return h('pre', JSON.stringify(data.row.value, null, ' '))
          }
        },{
          title: '配置项名称',
          key: 'name',
          width: 200
        },{
          title: '配置项描述',
          key: 'description'
        },{
          title: '是否公开',
          key: 'is_public',
          width: 150,
          render: (h, data) => {
            return h('span', data.row.is_public ? '是' : '否')
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
      systemConfigData: [],
      addModal: false,
      modalTitle: null,
      formData: {
        _id: null,
        name: null,
        value: null,
        description: null,
        is_public: false
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
      this.systemConfigData = await this.$http.get('/system/config/list', {params:this.search})
      this.loading = false
    },
    add() {
      // 清空表单
      Object.keys(this.formData).forEach(key => {
        if(typeof this.formData[key] === 'boolean') {
          this.formData[key] = false
        } else {
          this.formData[key] = null
        }
      })
      this.modalTitle = '新增配置项'
      this.addModal = true
    },
    update(row) {
      this.formData._id = row._id
      this.formData.name = row.name
      this.formData.value = JSON.stringify(row.value, null, ' ')
      this.formData.description = row.description
      this.formData.is_public = row.is_public
      this.modalTitle = '修改配置项'
      this.addModal = true
    },
    async save() {
      try {
        JSON.parse(this.formData.value)
      } catch (e) {
        this.$Message.warning('值不符合JSON字符串格式')
        return
      }
      const data = await this.$http.post('/system/config/save', this.formData)
      this.addModal = false
      this.$Message.success(data.msg)
      this.loadData()
      // 清空表单
      Object.keys(this.formData).forEach(key => {
        if(typeof this.formData[key] === 'boolean') {
          this.formData[key] = false
        } else {
          this.formData[key] = null
        }
      })
    },
    delete(row) {
      this.$Modal.confirm({
        title: '确认删除',
        content: `<p>是否确认删除 ${row.name} 配置项？</p>`,
        loading: true,
        onOk: async () => {
          const data = await this.$http.delete('/system/config/delete', {params: {id: row._id}})
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