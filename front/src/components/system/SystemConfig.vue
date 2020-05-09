<template>
<div>
  <Row>
    <Col span="3">
      <div class="search-title">配置项：</div>
    </Col>
    <Col span="4">
      <Input v-model="search.name" @on-enter="loadData" placeholder="名称/描述" />
    </Col>
  </Row>
  <div class="btn-container">
    <Button type="primary" @click="add">添加</Button>
    <div class="search-btn">
      <Button type="primary" @click="loadData" icon="md-search">搜索</Button>
      <Button @click="reset" icon="md-refresh">重置</Button>
    </div>
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
<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import SystemConfigAdd from './SystemConfigAdd.vue'
import { SystemConfigModel } from '../../model/system/system-config'
import moment from 'moment'
import { Button } from 'view-design'

@Component({components: {SystemConfigAdd}})
export default class SystemConfig extends Vue {
  private loading: boolean = false
  private search: {name?:string} = {}
  private systemConfigColumns = [{
      type: 'expand',
      width: 50,
      render: (h: Function, {row}: {row: SystemConfigModel}) => {
        return h('pre', JSON.stringify(row.value, null, ' '))
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
      render: (h: Function, {row}: {row: SystemConfigModel}) => {
        return h('span', row.is_public ? '是' : '否')
      }
    },{
      title: '创建时间',
      key: 'created_at',
      render (h: Function, {row}: {row: SystemConfigModel}) {
        return h('span', moment(row.created_at).format('YYYY-MM-DD HH:mm:ss'))
      }
    },{
      title: '更新时间',
      key: 'updated_at',
      render (h: Function, {row}: {row: SystemConfigModel}) {
        return row.updated_at ? h('span', moment(row.updated_at).format('YYYY-MM-DD HH:mm:ss')) : undefined
      }
    },{
      title: '操作',
      render: (h: Function, {row}: {row: SystemConfigModel}) => {
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
  private systemConfigData: SystemConfigModel[] = []
  private addModal: boolean = false
  private modalTitle: string = ''
  private formData: SystemConfigModel = {
    name: '',
    value: '',
    description: '',
    is_public: false
  }
  
  reset() {
    this.search = {}
    this.loadData()
  }
  async loadData() {
    this.loading = true
    this.systemConfigData = (await this.$http.get('/system/config/list', {params:this.search})).data
    this.loading = false
  }
  add() {
    // 清空表单
    this.formData = {
      name: '',
      value: '',
      description: '',
      is_public: false
    }
    this.modalTitle = '新增配置项'
    this.addModal = true
  }
  update(row: SystemConfigModel) {
    const formData = Object.assign({}, row)
    formData.value = JSON.stringify(formData.value, null, ' ')
    this.formData = formData
    this.modalTitle = '修改配置项'
    this.addModal = true
  }
  async save() {
    try {
      JSON.parse(this.formData.value as string)
    } catch (e) {
      this.$Message.warning('值不符合JSON字符串格式')
      return
    }
    const { data } = await this.$http.post('/system/config/save', this.formData)
    this.addModal = false
    this.$Message.success(data.msg)
    this.loadData()
  }
  delete(row: SystemConfigModel) {
    this.$Modal.confirm({
      title: '确认删除',
      content: `<p>是否确认删除 ${row.name} 配置项？</p>`,
      loading: true,
      onOk: async () => {
        const { data } = await this.$http.delete('/system/config/delete', {params: {id: row._id}})
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
  created() {
    this.loadData()
  }
}
</script>