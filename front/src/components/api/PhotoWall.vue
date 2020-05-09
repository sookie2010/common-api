<template>
<div>
  <Alert show-icon>
    上传要求
    <template slot="desc">图片格式为{{allowUploadExt.join('、')}}，文件大小不超过10MB。</template>
  </Alert>
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
      <Button shape="circle" @click.native="reset" icon="ios-refresh">重置</Button>
    </Col>
  </Row>
  
  <div class="btn-container">
    <Upload :action="($http.defaults.baseURL || '') + '/photowall/upload'" 
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
    <Table border :loading="loading" :columns="photowallColumns" 
      :data="photowallData" height="520" @on-selection-change="dataSelect"></Table>
  </div>
  <div class="page-container">
    <Page :total="search.total" :current="search.pageNum" :page-size="search.limit" 
      show-total show-sizer show-elevator @on-change.native="pageChange" @on-page-size-change.native="pageSizeChange"></Page>
  </div>
  
</div>
</template>
<script lang="ts">
import { Component } from 'vue-property-decorator'
import { MsgResult, Page } from '../../model/common.dto'
import BaseList from '../../model/baselist'
import PhotoWallModel from '../../model/api/photowall'
import { Button } from 'view-design'

let selectedData: string[] = []
let closeUploadTip: Function | void | null

@Component({})
export default class PhotoWall extends BaseList<PhotoWallPage> {
  private uploading: boolean = false
  private uploadHeaders = {token: localStorage.getItem('login_token')}
  protected search = new PhotoWallPage()
  private allowUploadExt = ['jpg','jpeg','png']
  private photowallColumns = [{
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
      width: 300
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
      width: 100,
      render: (h: Function, {row}: {row: PhotoWallModel}) => {
        return h(Button, {
          props: {size:'small'},
          on: { click: () => {this.preview(row) } }
        },'预览')
      }
    }]
  private photowallData = []

  async loadData() {
    this.loading = true
    const { data } = await this.$http.get('/photowall/list', {params:this.search})
    selectedData = []
    this.loading = false
    this.search.total = data.total
    this.photowallData = data.data
  }
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
        await this.$http.delete('/photowall/delete', {params:{_ids: selectedData}})
        this.$Modal.remove()
        this.$Message.success('删除成功')
        this.loadData()
      }
    })
  }
  dataSelect(selection: PhotoWallModel[]) {
    selectedData = selection.map(item => item._id)
  }
  beforeUpload(file: File) {
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
  uploadFormatError() {
    this.closeUploadTip()
    this.$Message.error(`只能上传 ${this.allowUploadExt.join('、')} 格式的文件`)
  }
  uploadFileSizeError() {
    this.closeUploadTip()
    this.$Message.error(`只能上传不超过10MB的文件`)
  }
  uploadSuccess(response: MsgResult) {
    this.closeUploadTip()
    if(response.status) {
      this.$Message.success(response.msg)
      this.loadData()
    } else {
      this.$Message.warning(response.msg)
    }
  }
  uploadError() {
    this.closeUploadTip()
    this.$Message.error('上传失败')
  }
  closeUploadTip() {
    if(typeof closeUploadTip === 'function') {
      closeUploadTip.call(this)
      closeUploadTip = null
    }
  }
  async preview(row: PhotoWallModel) {
    const previewHeight = Math.floor(row.height * (500 / row.width))
    const pictureCdn = (await this.$http.get('/common/config/picture_cdn')).data
    this.$Modal.info({
      title: '图片预览',
      width: 500 + 100,
      content: `<img src="${pictureCdn}/${row.name}" 
        style="width:500px;height:${previewHeight}px;" />`
    })
  }
  created() {
    this.loadData()
  }
}

class PhotoWallPage extends Page {
  name?: string
  widthMin?: number = 0
  widthMax?: number = 0
  heightMin?: number = 0
  heightMax?: number = 0
  reset() {
    super.reset()
    this.name = undefined
    this.widthMin = 0
    this.widthMax = 0
    this.heightMin = 0
    this.heightMax = 0
  }
}
</script>