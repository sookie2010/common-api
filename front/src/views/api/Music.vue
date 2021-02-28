<template>
<div>
  <Row class-name="search-row">
    <Col span="2">
      <div class="search-title">名称：</div>
    </Col>
    <Col span="4">
      <Input v-model="search.name" @on-enter="loadDataBase(true)" />
    </Col>
    <Col span="2">
      <div class="search-title">所属歌单：</div>
    </Col>
    <Col span="4">
      <Select v-model="search.lib_id" multiple :max-tag-count="3">
        <Option v-for="musicLib in musicLibs" :key="musicLib._id" :value="musicLib._id" >{{musicLib.name}}</Option>
      </Select>
    </Col>
    <Col span="2">
      <div class="search-title">文件类型：</div>
    </Col>
    <Col span="4">
      <Select v-model="search.ext" multiple :max-tag-count="3">
        <Option v-for="ext in exts" :key="ext" :value="ext" >{{ext}}</Option>
      </Select>
    </Col>
    <Col span="2">
      <div class="search-title">标题：</div>
    </Col>
    <Col span="4">
      <Input v-model="search.title" @on-enter="loadDataBase(true)" />
    </Col>
  </Row>
  <Row class-name="search-row">
    <Col span="2">
      <div class="search-title">唱片集：</div>
    </Col>
    <Col span="4">
      <Input v-model="search.album" @on-enter="loadDataBase(true)" />
    </Col>
    <Col span="2">
      <div class="search-title">艺术家：</div>
    </Col>
    <Col span="4">
      <Input v-model="search.artist" @on-enter="loadDataBase(true)" />
    </Col>
  </Row>
  <div class="btn-container">
    <Button type="success" ghost icon="md-play" @click="playMusic">播放</Button>
    <div class="search-btn">
      <Button type="primary" @click="loadDataBase(true)" icon="md-search">搜索</Button>
      <Button @click.native="reset" icon="md-refresh">重置</Button>
    </div>
  </div>
  <div class="table-container">
    <Table border :loading="loading" :columns="musicColumns" :data="musicData" height="520" @on-selection-change="dataSelect"></Table>
  </div>
  <div class="page-container">
    <Page :page-size-opts="$store.state.pageSizeOpts" :total="search.total" :current="search.pageNum" :page-size="search.limit" 
      show-total show-sizer show-elevator @on-change="pageChange($event)" @on-page-size-change="pageSizeChange($event)"></Page>
  </div>
  <Modal v-model="modifyModal" title="修改所属歌单"  width="460" footer-hide >
    <RadioGroup v-if="currentRow" v-model="currentRow.lib_id" @on-change="updateMusicLib">
      <Radio v-for="item in musicLibs" :key="item._id" :label="item._id" border>{{item.name}}</Radio>
    </RadioGroup>
  </Modal>
  <Modal v-model="modifyLyricModal" title="编辑歌词" :loading="modalLoading" @on-ok="saveLyric" width="600" >
    <Form ref="lyricForm" :model="lyricFormData" :rules="lyricRuleValidate" :label-width="120">
      <Form-item label="网易云ID" prop="cloud_id">
        <Input v-model="lyricFormData.cloud_id" />
      </Form-item>
      <Form-item label="名称" prop="name">
        <Input v-model="lyricFormData.name" />
      </Form-item>
      <Form-item label="歌词" prop="lyric">
        <Input v-model="lyricFormData.lyric" type="textarea" :rows="4"/>
      </Form-item>
    </Form>
  </Modal>
  <Drawer title="播放音乐" v-model="musicPlaying" width="720" :mask-closable="false" >
    <template v-if="musicPlaying">
      <a-player :audio="musicList" :lrcType="3"/>
    </template>
  </Drawer>
</div>
</template>

<script lang="ts">
import Vue from 'vue'
import { MusicModel, MusicLibModel, MusicLyricModel } from '../../model/api/music'
import { VForm } from '../../types'
import { Page } from '../../model/common.dto'
import BaseList from '../../model/baselist'
import { Component } from 'vue-property-decorator'
import { CreateElement } from 'vue'
import prettyBytes from 'pretty-bytes'
import APlayer from '@moefe/vue-aplayer'

Vue.use(APlayer, {
  defaultCover: `${Vue.prototype.$http.defaults.baseURL}/common/randomBg?id=5ec7770b60990123b7340233`, // 播放器默认封面图片
  productionTip: false, // 是否在控制台输出版本信息
})
let selectedIds: string[] = []
@Component({})
export default class Music extends BaseList<MusicPage> {
  protected search = new MusicPage()
  private musicColumns = [{
      type: 'selection',
      key: '_id',
      width: 60,
      align: 'center'
    },{
      title: '名称',
      key: 'name'
    },{
      title: '类型',
      key: 'ext',
      width: 100
    },{
      title: '文件大小',
      key: 'size',
      width: 150,
      render (h: CreateElement, {row}: {row: MusicModel}) {
        return h('span', prettyBytes(row.size))
      }
    },{
      title: '标题',
      key: 'title'
    },{
      title: '唱片集',
      key: 'album'
    },{
      title: '艺术家',
      key: 'artist'
    },{
      title: '所属歌单',
      key: 'lib_id',
      render: (h: CreateElement, {row}: {row: MusicModel}) => {
        const musicLibName = this.findMusicLib(row.lib_id)
        return musicLibName ? h('span', musicLibName) : undefined
      }
    },{
      title: '歌词',
      key: 'lyric_id',
      width: 120,
      align: 'center',
      render (h: CreateElement, {row}: {row: MusicModel}) {
        return h('Icon', {
          props: {
            size: 20,
            type: row.lyric_id ? 'md-checkmark' : 'md-close'
          }
        })
      }
    },{
      title: '操作',
      render: (h: CreateElement, {row}: {row: MusicModel}) => {
        return [
          h('Button', {
            props: {size:'small',type:'primary'},
            style: {marginRight: '5px'},
            on: { click: () => { this.update(row) } }
          },'修改'),
          h('Button', {
            props: {size:'small'},
            style: {marginRight: '5px'},
            on: { click: () => { this.updateLyric(row) } }
          },'歌词'),
          h('Button', {
            props: {size: 'small'},
            on: { click: () => { location.href = `${this.$http.defaults.baseURL || ''}/common/music/download/${row._id}` } }
          },'下载')
        ]
      }
    }]
  private currentRow: MusicModel | null = null
  private exts: string[] = []
  private musicLibs: MusicLibModel[] = []
  private musicData: MusicModel[] = []
  private modifyModal: boolean = false
  private modifyLyricModal: boolean = false
  private lyricRuleValidate = {
    cloud_id: [
      { required: true, message: '请输入网易云ID', trigger: 'blur' }
    ],
    name: [
      { required: true, message: '请输入名称', trigger: 'blur' }
    ],
    lyric: [
      { required: true, message: '请输入歌词正文', trigger: 'blur' }
    ],
  }
  private lyricFormData: MusicLyricModel = {}
  // 是否正在播放音乐
  private musicPlaying: boolean = false
  private musicList: [] = []
  created() {
    this.$http.get('/music/listLibs').then(({data}) => {
      this.musicLibs = data
      this.loadData()
    })
    this.$http.get('/music/listExts').then(({data}) => {
      this.exts = data
    })
  }
  async loadData() {
    this.loading = true
    const { data } = await this.$http.get('/music/list', {params: this.search})
    selectedIds = []
    this.loading = false
    this.search.total = data.total
    this.musicData = data.data
  }
  dataSelect(selection: MusicModel[]) {
    selectedIds = selection.map(item => item._id)
  }
  findMusicLib(value: string): string | null {
    const musicLib = this.musicLibs.find(item => item._id === value)
    return musicLib ? musicLib.name : null
  }
  // 根据当前搜索条件播放音乐
  async playMusic() {
    // 显示加载进度条
    this.$Loading.start()
    try {
      const { data } = await this.$http.get('/music/list/all', {params: selectedIds.length ? {ids: selectedIds} : this.search})
      this.musicList = data.map((item: MusicModel) => {
        return {
          name: item.title || item.name,
          artist: item.artist,
          url: `${this.$http.defaults.baseURL || ''}/common/music/get/${item._id}`,
          cover: `${this.$http.defaults.baseURL || ''}/common/music/album/${item._id}`,
          lrc: item.lyric_id ? `${this.$http.defaults.baseURL || ''}/common/music/lyric/${item.lyric_id}` : undefined
        }
      })
      // 结束加载进度条
      this.$Loading.finish()
      this.musicPlaying = true
    } catch (err) {
      console.error(err)
      this.$Message.error('获取播放列表失败')
      this.$Loading.error()
    }
  }
  update(row: MusicModel) {
    this.currentRow = row
    this.modifyModal = true
  }
  async updateLyric(row: MusicModel) {
    this.currentRow = row
    this.modifyLyricModal = true
    if (row.lyric_id) {
      const { data } = (await this.$http.get('/music/lyric/get', {params: {lyricId: row.lyric_id}}))
      data.cloud_id = data.cloud_id ? data.cloud_id.toString() : null
      this.lyricFormData = data
    } else {
      this.lyricFormData = {}
    }
  }
  async saveLyric() {
    (this.$refs.lyricForm as VForm).validate(async (valid: boolean) => {
      if(!valid) {
        this.modalLoading = false
        return
      }
      const { data } = await this.$http.post(`/music/lyric/save?musicId=${this.currentRow ? this.currentRow._id : ''}`, this.lyricFormData)
      this.modifyLyricModal = false
      this.$Message.success(data.message)
      this.loadData()
      // 清空表单
      this.lyricFormData = {}
    })
  }
  async updateMusicLib(libId: string) {
    if (!this.currentRow) return
    const { data } = await this.$http.post('/music/updateLib', {id: this.currentRow._id, libId})
    this.$Message.success(data.message)
  }
}


class MusicPage extends Page {
  name?: string
  ext: string[] = []
  title?: string
  album?: string
  artist?: string
  lib_id?: string[] = []
  reset() {
    super.reset()
    this.name = undefined
    this.ext = []
    this.title = undefined
    this.album = undefined
    this.artist = undefined
    this.lib_id = []
  }
}
</script>