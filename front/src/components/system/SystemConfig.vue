<template>
<div>
  <Row>
    <Col span="3">
      <div class="search-title">配置项名称/描述：</div>
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
    <Table :loading="loading" :columns="systemConfigColumns" :data="systemConfigData" height="520" ></Table>
  </div>
  <Modal v-model="addModal" title="新增配置项" >
    <SystemConfigAdd :formData="formData" />
    <div slot="footer">
      <Button type="text" @click="addModal = false">取消</Button>
      <Button type="primary" @click="save">保存</Button>
    </div>
  </Modal>
</div>
</template>
<script>
import Table from 'iview/src/components/table'
import Row from 'iview/src/components/row'
import Col from 'iview/src/components/col'
import Input from 'iview/src/components/input'
import Button from 'iview/src/components/button'
import Modal from 'iview/src/components/modal'

import SystemConfigAdd from './SystemConfigAdd'

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
          title: '操作',
          render: (h, data) => {
            //<Button type="error" ghost>Error</Button>
            return h('div', [
              h(Button, {
                props: {size:'small'},
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
      formData: {
        _id: null,
        name: null,
        value: null,
        description: null
      }
    }
  },
  methods: {
    reset() {
      this.search = {}
      this.loadData()
    },
    loadData() {
      this.loading = true
      this.$http.get('/system/config/list', {params:this.search}).then(data => {
        this.loading = false
        this.systemConfigData = data
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
    add() {
      // 清空表单
      Object.keys(this.formData).forEach(key => {
        this.formData[key] = null
      })
      this.addModal = true
    },
    update(row) {
      this.formData._id = row._id
      this.formData.name = row.name
      this.formData.value = JSON.stringify(row.value, null, ' ')
      this.formData.description = row.description
      this.addModal = true
    },
    save() {
      try {
        JSON.parse(this.formData.value)
      } catch (e) {
        this.$Message.warning('值不符合JSON字符串格式')
        return
      }
      this.$http.post('/system/config/save', this.formData).then(data => {
        this.addModal = false
        this.$Message.success(data.msg)
        this.loadData()
        // 清空表单
        Object.keys(this.formData).forEach(key => {
          this.formData[key] = null
        })
      })
    },
    delete(row) {
      this.$Modal.confirm({
        title: '确认删除',
        content: `<p>是否确认删除 ${row.name} 配置项？</p>`,
        loading: true,
        onOk: () => {
          this.$http.delete('/system/config/delete', {params: {id: row._id}}).then(data => {
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
    }
  },
  created() {
    this.loadData()
  }
}
</script>