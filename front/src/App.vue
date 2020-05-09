<template>
<div id="app" class="layout">
  <Row type="flex">
    <Col span="4" class="layout-left">
      <Menu theme="light" width="auto" :open-names="[1]" :accordion="true" style="height:100%;overflow-y:auto" >
        <Submenu v-for="(item,index) in menus" :key="index" :name="index">
          <template slot="title">
            <Icon :type="item.icon" size="16"></Icon>{{item.name}}
          </template>
          <Menu-item v-for="(subItem,subIndex) in item.child" :key="subIndex" :link="'/api/hitokoto'"
              :name="index + '-' + subIndex" >
            <router-link class="menu-link" :to="subItem.path" >
              {{subItem.name}}
            </router-link>
          </Menu-item>
        </Submenu>
      </Menu>
    </Col>
    <Col span="20" class="layout-right">
      <div class="layout-header">
        <h2>博客API管理后台</h2>
        <div class="nav-btns-left">
          <router-link to="/">首页</router-link>
        </div>
        <div class="nav-btns-right">
          <span>{{ realname }}</span>
          <Button @click="logout">注销</Button>
        </div>
      </div>
      <div class="layout-breadcrumb">
        <Breadcrumb>
          <Breadcrumb-item v-for="(item,index) in $store.state.breadcrumb" :key="index">{{item}}</Breadcrumb-item>
        </Breadcrumb>
      </div>
      <div class="layout-content">
        <router-view class="main-view"></router-view>
      </div>
      <div class="layout-copy">2016-2020 &copy; colorfulsweet</div>
    </Col>
  </Row>
</div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'

@Component({})
export default class App extends Vue{
  private name = 'app'
  // 菜单项
  private menus = [{
    name: '系统管理',
    icon: 'md-options',
    child: [
      { name: '系统配置', path: '/system/config' },
      { name: '用户管理', path: '/system/user' },
      { name: '角色管理', path: '/system/role' },
      { name: '博客文章', path: '/system/article' },
      { name: '分析统计', path: '/system/statistics'}
      ]
    },{
    name: 'API数据',
    icon: 'logo-buffer',
    child: [
      { name: '一言', path: '/api/hitokoto' },
      { name: '照片墙', path: '/api/photoWall' },
      { name: '图片资源库', path: '/api/sourceImage' },
      { name: '中国行政区划', path: '/api/chinaProvince' },
      { name: '歌曲库', path: '/api/musicLib' }
      ]
    },{
    name: '工具',
    icon: 'md-build',
    child: [
      { name: 'SQL占位符替换', path: '/tool/sqlReplace' }
      ]
  }]
  get realname(): string { // 当前用户的显示名称
    return this.$store.state.loginInfo.userInfo
      ? this.$store.state.loginInfo.userInfo.realname : null
  }
  logout(): void {
    this.$store.commit('logout')
    this.$router.push('/login')
  }
  async created(): Promise<void> {
    if(!localStorage.getItem('login_token')) {
      this.$router.push('/login')
      return
    } 
    const { data }  = await this.$http.post('/common/verifyToken', {token: localStorage.getItem('login_token')})
    if(data.status) {
      // 如果是已过期的token 服务端会签发新的token
      this.$store.commit('login', {token: data.newToken || localStorage.getItem('login_token'), userInfo: data.userInfo})
    } else {
      this.$router.push('/login')
    }
  }
}
</script>
<style lang="less">
  html,body,.layout {
    height: 100%;
  }
  .layout{
    background: #f5f7f9;
    position: relative;
  }
  .ivu-row-flex {
    height: 100%;
  }
  .layout-breadcrumb{
    padding: 10px 15px 0;
  }
  .layout-content{
    margin: 15px;
    overflow: auto;
    background: #fff;
    border-radius: 4px;
    padding: 10px;
    flex-grow: 1;
    flex-basis: 0;
  }
  .layout-copy{
    text-align: center;
    padding: 10px 0 20px;
    color: #9ea7b4;
  }
  .layout-right{
    display: flex !important;
    flex-direction: column;
  }
  .layout-header{
    height: 60px;
    line-height: 60px;
    padding-left: 30px;
    background: #fff;
    box-shadow: 0 1px 1px rgba(0,0,0,.1);
    h2 {
      display: inline-block;
    }
    .nav-btns-right {
      display: inline-block;
      position: absolute;
      right: 20px;
    }
    .nav-btns-right > span {
      margin-right: 10px;
    }
    .nav-btns-left {
      display: inline-block;
      position: absolute;
      margin-left: 20px;
      font-size: 16px;
    }
  }
  .ivu-menu-item {
    padding: 0 !important;
    a.menu-link {
      padding: 14px 24px 14px 43px;
      color: inherit;
      display: block;
    }
  }
  .search-title {
    line-height: 32px;
    text-align: right;
    padding-right: 5px;
  }
  .table-container {
    position: relative;
  }
  .btn-container {
    padding: 10px 0;
    button {
      margin-right: 3px;
    }
  }
  .page-container {
    padding: 10px;
    text-align: center;
  }
  .carsouel-img {
    position: relative;
    left: 50%;transform:
    translateX(-50%);
    height: 500px;
    width: auto;
  }
  .main-view {
    position: relative;
    height: 100%;
  }
  .main-view .search-row:not(:last-child) {
    margin-bottom: 10px;
  }
  td.ivu-table-expanded-cell {
    padding: 0 20px !important;
  }
</style>