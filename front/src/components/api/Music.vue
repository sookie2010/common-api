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
      <Input v-model="search.title" @on-enter="loadData" />
    </Col>
  </Row>
  <Row class-name="search-row">
    <Col span="2">
      <div class="search-title">唱片集：</div>
    </Col>
    <Col span="4">
      <Input v-model="search.album" @on-enter="loadData" />
    </Col>
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
    <Table border :loading="loading" :columns="musicColumns" :data="musicData" height="520" @on-selection-change="dataSelect"></Table>
  </div>
  <div class="page-container">
    <Page :page-size-opts="$store.state.pageSizeOpts" :total="search.total" :current="search.pageNum" :page-size="search.limit" 
      show-total show-sizer show-elevator @on-change="pageChange($event)" @on-page-size-change="pageSizeChange($event)"></Page>
  </div>
</div>
</template>

<script lang="ts">
import Vue from 'vue'
import { MusicModel, MusicLibModel } from '../../model/api/music'
import { Page } from '../../model/common.dto'
import BaseList from '../../model/baselist'
import { Component } from 'vue-property-decorator'
import prettyBytes from 'pretty-bytes'

let selectedData: string[] = []
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
      render (h: Function, {row}: {row: MusicModel}) {
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
      render (h: Function, {row}: {row: MusicModel}) {
        const musicLib = this.musicLibs.find(item => item._id === row.lib_id)
        if(musicLib) {
          return h('span', musicLib.name)
        }
      }
    }]
  private exts: string[] = []
  private musicLibs: MusicLibModel[] = []
  private musicData: MusicModel[] = []
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
    const { data } = await this.$http.get('/music/list', {params:this.search})
    selectedData = []
    this.loading = false
    this.search.total = data.total
    this.musicData = data.data
  }
  dataSelect(selection: MusicModel[]) {
    selectedData = selection.map(item => item._id)
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