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
  <Modal v-model="modifyModal" title="修改标签" :footer-hide="true" @on-visible-change="modifyModalClose">
    <CheckboxGroup v-model="curModifyLabels" @on-change="changeLabel">
      <Checkbox v-for="item in labelList" :label="item.name" :key="item.name" border @on-change="changeLabel"></Checkbox>
    </CheckboxGroup>
  </Modal>
</div>
</template>
<script>
import Alert from 'view-design/src/components/alert'
import Table from 'view-design/src/components/table'
import Upload from 'view-design/src/components/upload'
import Button from 'view-design/src/components/button'
import Page from 'view-design/src/components/page'
import Tag from 'view-design/src/components/tag'
import Modal from 'view-design/src/components/modal'
import CheckboxGroup from 'view-design/src/components/checkbox-group'
import Checkbox from 'view-design/src/components/checkbox'

import prettyBytes from 'pretty-bytes'
import moment from 'moment'

var selectedData = null, closeUploadTip = null
export default {
  components: {
    Alert, Table, Upload, Button, Page, Modal, CheckboxGroup, Checkbox
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
      allowUploadExt: ['jpg','jpeg','png','svg','ico'],
      sourceImageColumns: [{
          type: 'selection',
          key: '_id',
          width: 60,
          align: 'center'
        },{
          title: 'md5',
          key: 'hash',
          width: 300
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
          render: (h, data) => {
            if(!data.row.label) {
              return undefined
            }
            return h('div', data.row.label.map(label => {
              let index = this.labelList.findIndex(item => {
                return item.name === label
              })
              return h(Tag, {
                props: {color: index === -1 ? 'default' : this.labelList[index].color},
                style: {marginRight: '5px'}
              },label)
            }))
          }
        },{
          title: '上传时间',
          key: 'created_at',
          width: 180,
          render (h, data) {
            return h('span', moment(data.row.created_at).format('YYYY-MM-DD HH:mm:ss'))
          }
        },{
          title: '操作',
          render: (h, data) => {
            return h('div', [
              h(Button, {
                props: {size:'small',type:'primary'},
                style: {marginRight: '5px'},
                on: { click: () => {this.modifyTags(data.row) } }
              },'修改标签'),
              h(Button, {
                props: {size:'small'},
                on: { click: () => {this.preview(data.row) } }
              },'预览')
            ])
          }
        }],
      sourceImageData: [],
      curModifyLabels: [],
      labelList: [],
      selectedLabel: null,
      curId: null,
      modifyModal: false
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
    async loadData(resetPage) {
      if(resetPage) {
        this.search.pageNum = 1
        this.search.limit = 10
      }
      this.loading = true
      const data = await this.$http.get('/source-image/list', {params:this.search})
      selectedData = null
      this.loading = false
      this.search.total = data.total
      this.sourceImageData = data.data
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
        onOk: async () => {
          await this.$http.delete('/source-image/delete', {params:{_ids: selectedData.map(item => item._id)}})
          this.$Modal.remove()
          this.$Message.success('删除成功')
          this.loadData()
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
    },
    modifyTags(item) {
      this.curModifyLabels.length = 0
      if(item.label) {
        this.curModifyLabels.push(...item.label)
      }
      this.curId = item._id
      this.selectedLabel = null
      this.modifyModal = true
    },
    modifyModalClose(isShow) {
      if(!isShow) {
        this.loadData()
      }
    },
    async changeLabel(labels) {
      await this.$http.post('/source-image/updateLabel', {id: this.curId, labels})
    }
  },
  async created() {
    const data = await this.$http.get('/system/config/get/image_label')
    this.labelList.push(...data)
    this.loadData()
  }
}
</script>