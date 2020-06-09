<template>
<div>
  <Row>
    <Col span="3">
      <div class="search-title">角色名称/描述：</div>
    </Col>
    <Col span="4">
      <Input v-model="search.name" @on-enter="loadDataBase(true)" />
    </Col>
  </Row>
  <div class="btn-container">
    <Button type="primary" @click="add">添加</Button>
    <div class="search-btn">
      <Button type="primary" @click="loadDataBase(true)" icon="md-search">搜索</Button>
      <Button @click.native="reset" icon="md-refresh">重置</Button>
    </div>
  </div>
  <div class="table-container">
    <Table border :loading="loading" :columns="systemRoleColumns" :data="systemRoleData" height="520" ></Table>
  </div>
  <div class="page-container">
    <Page :page-size-opts="$store.state.pageSizeOpts" :total="search.total" :current="search.pageNum" :page-size="search.limit" 
      show-total show-sizer show-elevator @on-change="pageChange($event)" @on-page-size-change="pageSizeChange($event)"></Page>
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
        <Input v-model="uri.include">
          <Button slot="append" icon="md-add" @click="addUri('include_uri', uri.include)"></Button>
        </Input>
        <Tag v-for="uri in formData.include_uri" :key="uri" closable @on-close="removeUri('include_uri', uri)">{{uri}}</Tag>
      </Form-item>
      <Form-item label="禁止的URI">
        <Input v-model="uri.exclude">
          <Button slot="append" icon="md-add" @click="addUri('exclude_uri', uri.exclude)"></Button>
        </Input>
        <Tag v-for="uri in formData.exclude_uri" :key="uri" closable @on-close="removeUri('include_uri', uri)">{{uri}}</Tag>
      </Form-item>
    </Form>
  </Modal>
</div>
</template>
<script lang="ts">
import { Component } from 'vue-property-decorator'
import { Page } from '../../model/common.dto'
import BaseList from '../../model/baselist'
import moment from 'moment'
import { Button, Tag } from 'view-design'
import { SystemRoleModel } from '../../model/system/system-role'

@Component({})
export default class SystemRole extends BaseList<SystemRolePage> {
  protected search = new SystemRolePage()
  private systemRoleColumns = [{
    title: '角色名称',
    key: 'name'
  },{
    title: '允许的请求类型',
    key: 'methods',
    render (h: Function, {row}: {row: SystemRoleModel}) {
      return h('div', row.methods.map(method => {
        return h(Tag, {
          props: {color: 'default'},
          style: {marginRight: '5px'}
        },method)
      }))
    }
  },{
    title: '创建时间',
    key: 'created_at',
    render (h: Function, {row}: {row: SystemRoleModel}) {
      return h('span', moment(row.created_at).format('YYYY-MM-DD HH:mm:ss'))
    }
  },{
    title: '更新时间',
    key: 'updated_at',
    render (h: Function, {row}: {row: SystemRoleModel}) {
      return h('span', moment(row.updated_at).format('YYYY-MM-DD HH:mm:ss'))
    }
  },{
    title: '操作',
    render: (h: Function, {row}: {row: SystemRoleModel}) => {
      return h('div', [
        h(Button, {
          props: {size:'small'},
          style: {marginRight: '5px'},
          on: { click: () => {this.update(row) } }
        },'修改'),
        h(Button, {
          props: {size:'small', type:'error', ghost:true},
          on: { click: () => {this.delete(row) } }
        },'删除')
      ])
    }
  }]
  private systemRoleData: SystemRoleModel[] = []
  private addModal: boolean  = false
  private modalTitle: string | null = null
  private uri: {
    include: string | null,
    exclude: string | null
  } = {
    include: null,
    exclude: null
  }
  formData: SystemRoleModel = {
    _id: null,
    name: null,
    description: null,
    methods: [],
    include_uri: [],
    exclude_uri: []
  }
  async loadData() {
    this.loading = true
    const { data } = await this.$http.get('/system/role/list', {params:this.search})
    this.loading = false
    this.search.total = data.total
    this.systemRoleData = data.data
  }
  add() {
    // 清空表单
    this.uri.include = null
    this.uri.exclude = null
    this.formData = {
      _id: null,
      name: null,
      description: null,
      methods: [],
      include_uri: [],
      exclude_uri: []
    }
    this.modalTitle = '新增角色'
    this.addModal = true
  }
  update(row: SystemRoleModel) {
    this.uri.include = null
    this.uri.exclude = null
    this.formData._id = row._id
    this.formData.name = row.name
    this.formData.description = row.description
    this.formData.methods = row.methods
    this.formData.include_uri = row.include_uri
    this.formData.exclude_uri = row.exclude_uri
    this.modalTitle = '修改角色'
    this.addModal = true
  }
  async save() {
    const { message } = (await this.$http.post('/system/role/save', this.formData)).data
    this.addModal = false
    this.$Message.success(message)
    this.loadData()
  }
  delete(row: SystemRoleModel) {
    this.$Modal.confirm({
      title: '确认删除',
      content: `<p>是否确认删除 ${row.name} 角色？</p>`,
      loading: true,
      onOk: async () => {
        const { data } = await this.$http.delete('/system/role/delete', {params: {id: row._id}})
        this.$Modal.remove()
        if(data.status) {
          this.$Message.success(data.message)
          this.loadData()
        } else {
          this.$Message.warning(data.message)
        }
      }
    })
  }
  addUri(fieldName: 'include_uri' | 'exclude_uri', uri: string) {
    if(!uri) return
    if(this.formData[fieldName].indexOf(uri) === -1) {
      this.formData[fieldName].push(uri)
    }
  }
  removeUri(fieldName: 'include_uri' | 'exclude_uri', uri: string) {
    let index = this.formData[fieldName].indexOf(uri)
    if(index !== -1) {
      this.formData[fieldName].splice(index, 1)
    }
  }
  created() {
    this.loadData()
  }
}

class SystemRolePage extends Page {
  name?: string
  reset() {
    super.reset()
    this.name = undefined
  }
}
</script>