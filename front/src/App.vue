<template>
<div id="app" class="layout">
  <Row type="flex">
    <Col span="4" class="layout-left">
      <Menu theme="dark" width="auto" :open-names="[1]" :accordion="true" >
        <Submenu v-for="(item,index) in menus" :key="index" :name="index">
          <template slot="title">
            <Icon :type="item.icon"></Icon>{{item.name}}
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
        <h1>博客API管理后台</h1>
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
      <div class="layout-copy">2016-2019 &copy; colorfulsweet</div>
    </Col>
  </Row>
</div>
</template>

<script>
import Row from 'iview/src/components/row'
import Menu from 'iview/src/components/menu'
import Submenu from 'iview/src/components/submenu'
import MenuItem from 'iview/src/components/menu-item'
import Icon from 'iview/src/components/icon'
import Col from 'iview/src/components/col'
import Breadcrumb from 'iview/src/components/breadcrumb'
import BreadcrumbItem from 'iview/src/components/breadcrumb-item'
import Button from 'iview/src/components/button'

export default {
  name: 'app',
  components: {
    Row, Menu, Submenu, Icon, MenuItem, Col, Breadcrumb, BreadcrumbItem, Button
  },
  data() {
    return {
      // 菜单项
      menus: [{
        name: '系统管理',
        icon: 'ios-cog',
        child: [{
          name: '系统配置',
          path: '/system/config'
        }]
      },{
        name: 'API数据',
        icon: 'ios-grid',
        child: [{
          name: '一言',
          path: '/api/hitokoto'
        },{
          name: '照片墙',
          path: '/api/photoWall'
        }]
      }],
      // 面包屑
      breadcrumb: []
    }
  },
  computed: {
    realname () { // 当前用户的显示名称
			return this.$store.state.loginInfo.userInfo
				? this.$store.state.loginInfo.userInfo.realname : null
		}
  },
  methods: {
    logout() {
      this.$store.commit('logout')
      this.$router.push('/')
    }
  },
  created() {
    if(localStorage.getItem('login_token')) {
      this.$http.post('/common/verifyToken', {token: localStorage.getItem('login_token')}).then(data => {
        if(data.status) {
          this.$store.commit('login', {token: localStorage.getItem('login_token'), userInfo: data.userInfo})
        } else {
          this.$router.push('/login')
        }
      })
    }
  }
}
</script>

<style>
  html,body {
    height: 100%;
  }
  .layout{
    height: 100%;
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
  .layout-left{
    background: #464c5b;
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
  }
  .layout-header h1 {
    display: inline-block;
  }
  .layout-header .nav-btns-right {
    display: inline-block;
    position: absolute;
    right: 20px;
  }
  .layout-header .nav-btns-left {
    display: inline-block;
    position: absolute;
    margin-left: 20px;
    font-size: 16px;
  }
  .ivu-menu-item {
    padding: 0 !important;
  }
  .ivu-menu-item a.menu-link {
    padding: 14px 24px 14px 43px;
    color: inherit;
    display: block;
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
  }
  .btn-container button {
    margin-right: 3px;
  }
  .page-container {
    padding: 10px;
    text-align: center;
  }
  .carousel-container {
    width: 80%;
    margin:0 auto;
  }
  .carsouel-img {
    position: relative;
    left: 50%;transform:
    translateX(-50%);
    height: 500px;
    width: auto;
  }
</style>