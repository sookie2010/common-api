<template>
<div>
  <Alert show-icon>
    上传要求
    <template slot="desc">图片格式为{{allowUploadExt.join('、')}}，文件大小不超过10MB。</template>
  </Alert>
  
  <div class="btn-container">
    <Upload :action="($http.defaults.baseURL || '') + '/source-image/upload'" 
      name="image" :show-upload-list="false" 
      :format="allowUploadExt" :headers="uploadHeaders" :max-size="10240" 
      :before-upload="beforeUpload" :on-success="uploadSuccess" @on-error="uploadError"
      :on-format-error="uploadFormatError" :on-exceeded-size="uploadFileSizeError"
      style="display: inline-block;">
      <Button type="primary" icon="ios-cloud-upload-outline">上传图片</Button>
    </Upload>
    <Button type="error" @click="deleteAll">删除</Button>
  </div>
  <div class="table-container">
    <Table border :loading="loading" :columns="sourceImageColumns" 
      :data="sourceImageData" height="520" @on-selection-change="dataSelect"></Table>
  </div>
  <div class="page-container">
    <Page :total="search.total" :current="search.pageNum" :page-size="search.limit" 
      show-total show-sizer show-elevator @on-change="pageChange" @on-page-size-change="pageSizeChange"></Page>
  </div>
  
</div>
</template>
<script>
import Alert from 'iview/src/components/alert'
import Table from 'iview/src/components/table'
import Upload from 'iview/src/components/upload'
import Button from 'iview/src/components/button'
import Page from 'iview/src/components/page'
import Tag from 'iview/src/components/tag'

import prettyBytes from 'pretty-bytes'
import moment from 'moment'

var selectedData = null, closeUploadTip = null
export default {
  components: {
    Alert, Table, Upload, Button, Page, Tag
  },
  data() {
    return {
      loading: false,
      uploading: false,
      uploadHeaders: {token: localStorage.getItem('login_token')},
      search: {
        pageNum: 1,
        limit: 10,
        total: null
      },
      allowUploadExt: ['jpg','jpeg','png','svg'],
      sourceImageColumns: [{
          type: 'selection',
          key: '_id',
          width: 60,
          align: 'center'
        },{
          title: 'md5',
          key: 'hash',
          width: 280
        },{
          title: '文件大小',
          key: 'size',
          width: 150,
          render (h, data) {
            return h('span', prettyBytes(data.row.size))
          }
        },{
          title: 'MIME',
          key: 'mime',
          width: 150
        },{
          title: '标签',
          key: 'label',
          render (h, data) {
            if(!data.row.label) {
              return undefined
            }
            return h('div', data.row.label.map(label => {
              return h(Tag, {
                props: {color:'cyan'},
                style: {marginRight: '5px'}
              },label)
            }))
          }
        },{
          title: '上传时间',
          key: 'created_at',
          width: 150,
          render (h, data) {
            return h('span', moment(data.row.created_at).format('YYYY-MM-DD HH:mm:ss'))
          }
        },{
          title: '操作',
          render: (h, data) => {
            return h(Button, {
              props: {size:'small'},
              on: { click: () => {this.preview(data.row) } }
            },'预览')
          }
        }],
      sourceImageData: []
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
      this.$http.get('/source-image/list', {params:this.search}).then(data => {
        selectedData = null
        this.loading = false
        this.search.total = data.total
        this.sourceImageData = data.data
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
          this.$http.delete('/source-image/delete', {params:{_ids: selectedData.map(item => item._id)}}).then(() => {
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
    uploadFormatError() {
      this.closeUploadTip()
      this.$Message.error(`只能上传 ${this.allowUploadExt.join('、')} 格式的文件`)
    },
    uploadFileSizeError() {
      this.closeUploadTip()
      this.$Message.error(`只能上传不超过10MB的文件`)
    },
    uploadSuccess(response) {
      this.closeUploadTip()
      if(response.status) {
        this.$Message.success(response.msg)
        this.loadData()
      } else {
        this.$Message.warning(response.msg)
      }
    },
    uploadError() {
      this.closeUploadTip()
      this.$Message.error('上传失败')
    },
    closeUploadTip() {
      if(typeof closeUploadTip === 'function') {
        closeUploadTip.call(this)
        closeUploadTip = null
      }
    },
    preview(row) {
      this.$Modal.info({
        title: '图片预览',
        width: 500 + 100,
        content: `<img src="/api/common/randomBg?id=${row._id}" style="width:500px;" />`
      })
    }
  },
  created() {
    this.loadData()
  }
}
</script>