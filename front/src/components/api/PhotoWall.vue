<template>
<div>
  <Row>
    <Col span="2">
      <div class="search-title">文件名：</div>
    </Col>
    <Col span="4">
      <Input v-model="search.name" @on-enter="loadData" />
    </Col>

    <Col span="2">
      <div class="search-title">宽度：</div>
    </Col>
    <Col span="2">
      <Input :number="true" v-model="search.widthMin" @on-enter="loadData">
        <span slot="prepend">&gt;=</span>
      </Input>
    </Col>
    <Col span="2">
      <Input :number="true" v-model="search.widthMax" @on-enter="loadData">
        <span slot="prepend">&lt;=</span>
      </Input>
    </Col>

    <Col span="2">
      <div class="search-title">高度：</div>
    </Col>
    <Col span="2">
      <Input :number="true" v-model="search.heightMin" @on-enter="loadData">
        <span slot="prepend">&gt;=</span>
      </Input>
    </Col>
    <Col span="2">
      <Input :number="true" v-model="search.heightMax" @on-enter="loadData">
        <span slot="prepend">&lt;=</span>
      </Input>
    </Col>
    <Col span="5" offset="1">
      <Button type="primary" shape="circle" @click="loadData" icon="ios-search">搜索</Button>
      <Button shape="circle" @click="reset" icon="ios-refresh">重置</Button>
    </Col>
  </Row>
  
  <div class="btn-container">
    <Upload :action="($http.defaults.baseURL || '') + '/photowall/upload'" 
      name="image" :show-upload-list="false" 
      :format="['jpg','jpeg','png']" :headers="uploadHeaders" 
      :before-upload="beforeUpload" :on-success="uploadSuccess" @on-error="uploadError"
      style="display: inline-block;">
      <Button type="primary" icon="ios-cloud-upload-outline">上传图片</Button>
    </Upload>
    <Button type="error" @click="deleteAll">删除</Button>
  </div>
  <div class="table-container">
    <Table border :loading="loading" :columns="photowallColumns" 
      :data="photowallData" height="520" @on-selection-change="dataSelect"></Table>
  </div>
  <div class="page-container">
    <Page :total="search.total" :current="search.pageNum" :page-size="search.limit" 
      show-total show-sizer show-elevator @on-change="pageChange" @on-page-size-change="pageSizeChange"></Page>
  </div>
  
</div>
</template>
<script>
import Table from 'iview/src/components/table'
import Row from 'iview/src/components/row'
import Col from 'iview/src/components/col'
import Input from 'iview/src/components/input'
import Button from 'iview/src/components/button'
import Upload from 'iview/src/components/upload'
import Page from 'iview/src/components/page'

var selectedData = null, closeUploadTip = null
export default {
  components: {
    Table, Row, Col, Input, Button, Upload, Page
  },
  data() {
    return {
      loading: false,
      uploading: false,
      uploadHeaders: {token: localStorage.getItem('login_token')},
      search: {
        pageNum: 1,
        limit: 10,
        total: null,
        widthMin: 0,
        widthMax: 0,
        heightMin: 0,
        heightMax: 0
      },
      photowallColumns: [{
          type: 'selection',
          key: '_id',
          width: 60,
          align: 'center'
        },{
          title: '文件名',
          key: 'name'
        },{
          title: 'md5',
          key: 'md5',
          width: 280
        },{
          title: '缩略图',
          key: 'thumbnail'
        },{
          title: '宽度',
          key: 'width',
          width: 70
        },{
          title: '高度',
          key: 'height',
          width: 70
        },{
          title: '操作',
          width: 70,
          render: (h, data) => {
            return h(Button, {
              props: {size:'small'},
              on: { click: () => {this.preview(data.row) } }
            },'预览')
          }
        }],
      photowallData: []
    }
  },
  methods: {
    reset() {
      this.search = {
        pageNum: 1,
        limit: 10,
        total: this.search.total,
        widthMin: 0,
        widthMax: 0,
        heightMin: 0,
        heightMax: 0
      }
      this.loadData()
    },
    loadData(resetPage) {
      if(resetPage) {
        this.search.pageNum = 1
        this.search.limit = 10
      }
      this.loading = true
      this.$http.get('/photowall/list', {params:this.search}).then(data => {
        selectedData = null
        this.loading = false
        this.search.total = data.total
        this.photowallData = data.data
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
          this.$http.delete('/photowall/delete', {params:{_ids: selectedData.map(item => item._id)}}).then(() => {
            this.$Modal.remove()
            this.$Message.success('删除成功')
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
    },
    beforeUpload(file) {
      let filenameCut = undefined
      if(file.name.length > 15) {
        filenameCut = file.name.substr(0, 15) + '...'
      }
      closeUploadTip = this.$Message.loading({
        content: (filenameCut || file.name) + ' 正在上传，请稍候...',
        duration: 0
      })
      return true
    },
    uploadSuccess() {
      if(typeof closeUploadTip === 'function') {
        closeUploadTip.call(this)
        closeUploadTip = null
      }
      this.$Message.success('上传成功')
      this.loadData()
    },
    uploadError() {
      if(typeof closeUploadTip === 'function') {
        closeUploadTip.call(this)
        closeUploadTip = null
      }
      this.$Message.error('上传失败')
    },
    preview(row) {
      let previewHeight = Math.floor(row.height * (500 / row.width))
      this.$http.get('/common/pictureCdn').then(data => {
        this.$Modal.info({
          title: '图片预览',
          width: 500 + 100,
          content: `<img src="${data}${row.name}" 
            style="width:500px;height:${previewHeight}px;" />`
        })
      })
    }
  },
  created() {
    this.loadData()
  }
}
</script>