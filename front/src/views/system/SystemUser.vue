<template>
<div>
  <Row>
    <Col span="3">
      <div class="search-title">用户名/昵称：</div>
    </Col>
    <Col span="4">
      <Input v-model="search.username" @on-enter="loadDataBase(true)" />
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
    <Table border :loading="loading" :columns="systemUserColumns" :data="systemUserData" height="520" ></Table>
  </div>
  <div class="page-container">
    <Page :page-size-opts="$store.state.pageSizeOpts" :total="search.total" :current="search.pageNum" :page-size="search.limit" 
      show-total show-sizer show-elevator @on-change="pageChange($event)" @on-page-size-change="pageSizeChange($event)"></Page>
  </div>
  <Modal v-model="addModal" :title="modalTitle" :loading="modalLoading" @on-ok="save">
    <Form ref="userForm" :model="formData" :rules="ruleValidate" :label-width="80">
      <Form-item label="用户名" prop="username">
        <Input v-model="formData.username" />
      </Form-item>
      <Form-item label="密码" prop="password">
        <Input v-model="formData.password" type="password" />
      </Form-item>
      <Form-item label="昵称">
        <Input v-model="formData.realname" />
      </Form-item>
      <Form-item label="角色">
        <Select v-model="formData.role_ids" multiple >
          <Option v-for="role in roles" :value="role._id" :key="role._id">{{role.name}}</Option>
        </Select>
      </Form-item>
    </Form>
  </Modal>
</div>
</template>
<script lang="ts">
import moment from 'moment'
import { Button } from 'view-design'
import { Component, Ref } from 'vue-property-decorator'
import { Page } from '../../model/common.dto'
import BaseList from '../../model/baselist'
import { SystemUserModel } from '../../model/system/system-user'
import { SystemRoleModel } from '../../model/system/system-role'
import { VForm } from '../../types'

@Component({})
export default class SystemUser extends BaseList<SystemUserPage> {
  @Ref('userForm') private readonly userForm!: VForm
  private ruleValidate = {
    username: [
      { required: true, message: '请输入用户名', trigger: 'blur' },
      { validator: (rule: object, value: string, callback: Function) => {
          this.$http.get('/system/user/exists', {params: {username: value}}).then(({data}) => {
            if(data.data.exists) {
              callback(new Error('用户名已存在'))
            } else {
              callback()
            }
          })
        }, trigger: 'blur'
      }
    ],
    password: [
      { required: true, message: '请输入密码', trigger: 'blur' },
      { min: 8, max: 16, message: '密码长度8~16位', trigger: 'blur' },
      { pattern: /^(?![\d]+$)(?![a-zA-Z]+$)(?![-=+_.,]+$)[\da-zA-Z-=+_.,]{8,16}$/, message: '密码由字母、数字、特殊字符中的任意两种组成', trigger: 'blur' }
    ],
  }
  protected search = new SystemUserPage()
  private systemUserColumns = [{
      title: '用户名',
      key: 'username'
    },{
      title: '姓名',
      key: 'realname'
    },{
      title: '创建时间',
      key: 'created_at',
      render (h: Function, {row}: {row: SystemUserModel}) {
        return h('span', moment(row.created_at).format('YYYY-MM-DD HH:mm:ss'))
      }
    },{
      title: '更新时间',
      key: 'updated_at',
      render (h: Function, {row}: {row: SystemUserModel}) {
        return row.updated_at ? h('span', moment(row.updated_at).format('YYYY-MM-DD HH:mm:ss')) : undefined
      }
    },{
      title: '操作',
      render: (h: Function, {row}: {row: SystemUserModel}) => {
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
  private systemUserData: SystemUserModel[] = []
  private roles: SystemRoleModel[] = []
  private addModal: boolean = false
  private modalTitle: string | null = null
  private formData: SystemUserModel = {
    _id: null,
    username: null,
    password: null,
    realname: null,
    role_ids: []
  }
  async loadData() {
    this.loading = true
    const { data } = await this.$http.get('/system/user/list', {params:this.search})
    this.loading = false
    this.search.total = data.total
    this.systemUserData = data.data
  }
  add() {
    // 清空表单
    this.formData = {
      _id: null,
      username: null,
      password: null,
      realname: null,
      role_ids: []
    }
    this.modalTitle = '新增用户'
    this.addModal = true
  }
  update(row: SystemUserModel) {
    this.formData._id = row._id
    this.formData.username = row.username
    this.formData.realname = row.realname
    this.formData.role_ids = row.role_ids
    this.modalTitle = '修改用户'
    this.addModal = true
  }
  async save() {
    this.userForm.validate(async (valid: boolean) => {
      if(!valid) {
        this.modalLoading = false
        return
      }
      const { data } = await this.$http.post('/system/user/save', this.formData)
      this.addModal = false
      this.$Message.success(data.message)
      this.loadData()
    })
    
  }
  delete(row: SystemUserModel) {
    this.$Modal.confirm({
      title: '确认删除',
      content: `<p>是否确认删除 ${row.username} 用户？</p>`,
      loading: true,
      onOk: async () => {
        const { data } = await this.$http.delete('/system/user/delete', {params: {id: row._id}})
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
  created() {
    this.loadData()
    this.$http.get('/system/role/listAll').then(({data}) => {
      this.roles = data
    })
  }
}

class SystemUserPage extends Page {
  username?: string
  reset() {
    super.reset()
    this.username = undefined
  }
}
</script>