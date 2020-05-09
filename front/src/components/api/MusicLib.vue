<template>
<div>
  <Row class-name="search-row">
    <Col span="2">
      <div class="search-title">名称：</div>
    </Col>
    <Col span="4">
      <Input v-model="search.name" @on-enter="loadData" />
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
      <Input v-model="search.title" @on-enter="loadData" />
    </Col>
    <Col span="2">
      <div class="search-title">唱片集：</div>
    </Col>
    <Col span="4">
      <Input v-model="search.album" @on-enter="loadData" />
    </Col>
  </Row>
  <Row class-name="search-row">
    <Col span="2">
      <div class="search-title">艺术家：</div>
    </Col>
    <Col span="4">
      <Input v-model="search.artist" @on-enter="loadData" />
    </Col>
  </Row>
  <div class="btn-container">
    <Button type="success" ghost icon="md-play">播放</Button>
    <div class="search-btn">
      <Button type="primary" @click="loadData" icon="md-search">搜索</Button>
      <Button @click.native="reset" icon="md-refresh">重置</Button>
    </div>
  </div>
  <div class="table-container">
    <Table border :loading="loading" :columns="musicLibColumns" :data="musicLibData" height="520" @on-selection-change="dataSelect"></Table>
  </div>
  <div class="page-container">
    <Page :page-size-opts="$store.state.pageSizeOpts" :total="search.total" :current="search.pageNum" :page-size="search.limit" 
      show-total show-sizer show-elevator @on-change="pageChange($event)" @on-page-size-change="pageSizeChange($event)"></Page>
  </div>
</div>
</template>

<script lang="ts">
import Vue from 'vue'
import MusicLibModel from '../../model/api/music-lib'
import { Page } from '../../model/common.dto'
import BaseList from '../../model/baselist'
import { Component } from 'vue-property-decorator'
import prettyBytes from 'pretty-bytes'

let selectedData: string[] = []
@Component({})
export default class MusicLib extends BaseList<MusicLibPage> {
  protected search = new MusicLibPage()
  private musicLibColumns = [{
      type: 'selection',
      key: '_id',
      width: 60,
      align: 'center'
    },{
      title: '名称',
      key: 'name'
    },{
      title: '文件大小',
      key: 'size',
      width: 150,
      render (h: Function, {row}: {row: MusicLibModel}) {
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
    }]
  private exts: string[] = []
  private musicLibData: MusicLibModel[] = []
  created() {
    this.loadData()
    this.$http.get('/music-lib/listExts').then(({data}) => {
      this.exts = data
    })
  }
  async loadData() {
    this.loading = true
    const { data } = await this.$http.get('/music-lib/list', {params:this.search})
    selectedData = []
    this.loading = false
    this.search.total = data.total
    this.musicLibData = data.data
  }
  dataSelect(selection: MusicLibModel[]) {
    selectedData = selection.map(item => item._id)
  }
}


class MusicLibPage extends Page {
  name?: string
  ext: string[] = []
  title?: string
  album?: string
  artist?: string
  reset() {
    super.reset()
    this.name = undefined
    this.ext = []
    this.title = undefined
    this.album = undefined
    this.artist = undefined
  }
}
</script>