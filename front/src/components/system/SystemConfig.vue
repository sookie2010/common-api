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
  <div class="table-container" style="margin-top:10px">
    <Table :loading="loading" :columns="systemConfigColumns" :data="systemConfigData" height="520" ></Table>
  </div>
</div>
</template>
<script>
import Table from 'iview/src/components/table'
import Row from 'iview/src/components/row'
import Col from 'iview/src/components/col'
import Input from 'iview/src/components/input'
import Button from 'iview/src/components/button'

export default {
  components: {
    Table, Row, Col, Input, Button
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
        }],
      systemConfigData: []
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
    }
  },
  created() {
    this.loadData()
  }
}
</script>