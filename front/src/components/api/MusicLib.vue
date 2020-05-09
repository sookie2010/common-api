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
      <Select v-model="search.ext" clearable>
        <Option value="mp3" >mp3</Option>
        <Option value="flac" >flac</Option>
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
    <Col span="5" offset="1">
      <Button type="primary" shape="circle" @click="loadData" icon="ios-search">搜索</Button>
      <Button shape="circle" @click.native="reset" icon="ios-refresh">重置</Button>
    </Col>
  </Row>
  <div class="table-container">
    <Table border :loading="loading" :columns="musicLibColumns" :data="musicLibData" height="520" @on-selection-change="dataSelect"></Table>
  </div>
  <div class="page-container">
    <Page :total="search.total" :current="search.pageNum" :page-size="search.limit" 
      show-total show-sizer show-elevator @on-change.native="pageChange" @on-page-size-change.native="pageSizeChange"></Page>
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
  private musicLibData: MusicLibModel[] = []
  async loadData() {

  }
  dataSelect(selection: MusicLibModel[]) {
    selectedData = selection.map(item => item._id)
  }
}


class MusicLibPage extends Page {
  name?: string
  ext?: string
  title?: string
  album?: string
  artist?: string
  reset() {
    super.reset()
    this.name = undefined
    this.ext = undefined
    this.title = undefined
    this.album = undefined
    this.artist = undefined
  }
}
</script>