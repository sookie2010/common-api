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
    <Page :page-size-opts="$store.state.pageSizeOpts" :total="search.total" :current="search.pageNum" :page-size="search.limit" 
      show-total show-sizer show-elevator @on-change="pageChange($event)" @on-page-size-change="pageSizeChange($event)"></Page>
  </div>
  <Modal v-model="modifyModal" title="修改标签" :footer-hide="true" @on-visible-change="modifyModalClose">
    <CheckboxGroup v-model="curModifyLabels" @on-change="changeLabel">
      <Checkbox v-for="item in labelList" :label="item.name" :key="item.name" border @on-change="changeLabel"></Checkbox>
    </CheckboxGroup>
  </Modal>
</div>
</template>
<script lang="ts">
import { Tag, Button } from 'view-design'
import prettyBytes from 'pretty-bytes'
import moment from 'moment'
import { Component } from 'vue-property-decorator'
import { MsgResult, Page } from '../../model/common.dto'
import BaseList from '../../model/baselist'
import { SourceImageModel, ImageLabel } from '../../model/api/source-image'

let selectedData: string[] = []
let closeUploadTip: Function | void | null

@Component({})
export default class SourceImage extends BaseList<Page> {
  private uploading: boolean = false
  private uploadHeaders = {token: localStorage.getItem('login_token')}
  protected search = new Page()
  private allowUploadExt = ['jpg','jpeg','png','svg','ico']
  private sourceImageColumns = [{
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
      render (h: Function, {row}: {row: SourceImageModel}) {
        return h('span', prettyBytes(row.size))
      }
    },{
      title: 'MIME',
      key: 'mime',
      width: 150
    },{
      title: '标签',
      key: 'label',
      render: (h: Function, {row}: {row: SourceImageModel}) => {
        if(!row.label) {
          return undefined
        }
        return h('div', row.label.map(label => {
          const index = this.labelList.findIndex(item => {
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
      render (h: Function, {row}: {row: SourceImageModel}) {
        return h('span', moment(row.created_at).format('YYYY-MM-DD HH:mm:ss'))
      }
    },{
      title: '操作',
      render: (h: Function, {row}: {row: SourceImageModel}) => {
        return h('div', [
          h(Button, {
            props: {size:'small',type:'primary'},
            style: {marginRight: '5px'},
            on: { click: () => {this.modifyTags(row) } }
          },'修改标签'),
          h(Button, {
            props: {size:'small'},
            on: { click: () => {this.preview(row) } }
          },'预览')
        ])
      }
    }]
  private sourceImageData: SourceImageModel[] = []
  private curModifyLabels: string[] = []
  private labelList: ImageLabel[] = []
  private curId: string | null = null
  private modifyModal: boolean = false

  async loadData(): Promise<void> {
    this.loading = true
    const { data } = await this.$http.get('/source-image/list', {params:this.search})
    selectedData = []
    this.loading = false
    this.search.total = data.total
    this.sourceImageData = data.data
  }
  deleteAll(): void {
    if(!selectedData.length) {
      this.$Message.warning('请选择要删除的数据')
      return
    }
    this.$Modal.confirm({
      title: '确认删除',
      content: `<p>是否确认删除选中的${selectedData.length}条数据？</p>`,
      loading: true,
      onOk: async () => {
        await this.$http.delete('/source-image/delete', {params:{_ids: selectedData}})
        this.$Modal.remove()
        this.$Message.success('删除成功')
        this.loadData()
      }
    })
  }
  dataSelect(selection: SourceImageModel[]): void {
    selectedData = selection.map(item => item._id)
  }
  beforeUpload(file: File): boolean {
    let filenameCut = undefined
    if(file.name.length > 15) {
      filenameCut = file.name.substr(0, 15) + '...'
    }
    closeUploadTip = this.$Message.loading({
      content: (filenameCut || file.name) + ' 正在上传，请稍候...',
      duration: 0
    })
    return true
  }
  uploadFormatError(): void {
    this.closeUploadTip()
    this.$Message.error(`只能上传 ${this.allowUploadExt.join('、')} 格式的文件`)
  }
  uploadFileSizeError(): void {
    this.closeUploadTip()
    this.$Message.error(`只能上传不超过10MB的文件`)
  }
  uploadSuccess(response: MsgResult): void {
    this.closeUploadTip()
    if(response.status) {
      this.$Message.success(response.msg)
      this.loadData()
    } else {
      this.$Message.warning(response.msg)
    }
  }
  uploadError(): void {
    this.closeUploadTip()
    this.$Message.error('上传失败')
  }
  closeUploadTip(): void {
    if(typeof closeUploadTip === 'function') {
      closeUploadTip.call(this)
      closeUploadTip = null
    }
  }
  preview(row: SourceImageModel): void {
    this.$Modal.info({
      title: '图片预览',
      width: 500 + 100,
      content: `<img src="${this.$http.defaults.baseURL||''}/common/randomBg?id=${row._id}" style="width:500px;" />`
    })
  }
  modifyTags(item: SourceImageModel): void {
    this.curModifyLabels.length = 0
    if(item.label) {
      this.curModifyLabels.push(...item.label)
    }
    this.curId = item._id
    this.modifyModal = true
  }
  modifyModalClose(isShow: boolean): void {
    if(!isShow) {
      this.loadData()
    }
  }
  async changeLabel(labels: string[]): Promise<void> {
    await this.$http.post('/source-image/updateLabel', {id: this.curId, labels})
  }
  created() {
    this.$http.get('/common/config/image_label').then(({data}) => {
      this.labelList.push(...data)
      this.loadData()
    })
  }
}
</script>