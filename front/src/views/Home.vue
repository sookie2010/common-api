<template>
  <Layout class="layout">
    <Header class="layout-header">
      <div class="main-title">博客API管理后台</div>
      <div class="nav-btns-right">
        <Dropdown trigger="click" transfer @on-click="dropdownMenuClick">
          <a href="javascript:void(0)">
            <Icon type="md-person" />
            {{ realname }}
            <Icon type="ios-arrow-down" />
          </a>
          <DropdownMenu slot="list" >
            <DropdownItem name="home" >返回首页</DropdownItem>
            <DropdownItem name="changePassword" >修改密码</DropdownItem>
            <DropdownItem name="logout" divided >注销</DropdownItem>
          </DropdownMenu>
        </Dropdown>
      </div>
    </Header>
    <Content>
      <Layout class="layout-main">
        <Sider>
          <Menu theme="light" width="auto" :active-name="activeMenuItem" :open-names="openMenuNames" style="height:100%;overflow-y:auto" >
            <Submenu v-for="menu in menus" :key="menu.name" :name="menu.name">
              <template slot="title">
                <Icon :type="menu.icon" size="16"></Icon>{{menu.title}}
              </template>
              <Menu-item v-for="(subItem,subIndex) in menu.child" :key="subIndex" :name="subItem.path" >
                <router-link class="menu-link" :to="subItem.path" >
                  {{subItem.title}}
                </router-link>
              </Menu-item>
            </Submenu>
          </Menu>
        </Sider>
        <Content class="layout-right">
          <div class="layout-breadcrumb">
            <Breadcrumb>
              <Breadcrumb-item v-for="(item,index) in $store.state.breadcrumb" :key="index">{{item}}</Breadcrumb-item>
            </Breadcrumb>
          </div>
          <div class="layout-content">
            <router-view class="main-view"></router-view>
          </div>
          <div class="layout-copy">2016-2020 &copy; colorfulsweet</div>
        </Content>
      </Layout>
    </Content>
  </Layout>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import menus from '../config/menu'

@Component({})
export default class Home extends Vue{
  private name = 'home'
  // 菜单项
  private menus = menus
  private activeMenuItem: string | null = null
  private openMenuNames: string[] = []
  get realname(): string { // 当前用户的显示名称
    return this.$store.state.loginInfo.userInfo
      ? this.$store.state.loginInfo.userInfo.realname : null
  }
  async created(): Promise<void> {
    this.activeMenuItem = this.$route.path
    if(this.activeMenuItem) {
      let result = /^\/(.*)\//.exec(this.activeMenuItem)
      if(result) {
        this.openMenuNames.push(result[1])
      }
    }
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
  dropdownMenuClick(name: string): void {
    switch(name) {
      case 'home': // 返回首页
        this.$router.push('/')
        break
      case 'changePassword': // 修改密码
        // TODO
        break
      case 'logout': //注销
        this.$store.commit('logout')
        this.$router.push('/login')
        break
    }
  }
}
</script>