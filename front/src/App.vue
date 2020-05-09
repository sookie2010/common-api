<template>
<div id="app" class="layout">
  <Row type="flex">
    <Col span="4" class="layout-left">
      <Menu theme="light" width="auto" :open-names="[1]" style="height:100%;overflow-y:auto" >
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
@import url('./static/common.less');
</style>