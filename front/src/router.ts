import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router)

import Login from '@/views/Login.vue'
import Home from '@/views/Home.vue'
import Welcome from '@/views/Welcome.vue'
const Article = () => import(/* webpackChunkName: "system" */'@/views/system/Article.vue')
const Statistics = () => import(/* webpackChunkName: "system" */'@/views/system/Statistics.vue')
const SystemConfig = () => import(/* webpackChunkName: "system" */'@/views/system/SystemConfig.vue')
const SystemUser = () => import(/* webpackChunkName: "system" */'@/views/system/SystemUser.vue')
const SystemRole = () => import(/* webpackChunkName: "system" */'@/views/system/SystemRole.vue')
const Hitokoto = () => import(/* webpackChunkName: "api" */'@/views/api/Hitokoto.vue')
const PhotoWall = () => import(/* webpackChunkName: "api" */'@/views/api/PhotoWall.vue')
const SourceImage = () => import(/* webpackChunkName: "api" */'@/views/api/SourceImage.vue')
const ChinaProvince = () => import(/* webpackChunkName: "api" */'@/views/api/ChinaProvince.vue')
const Music = () => import(/* webpackChunkName: "api" */'@/views/api/Music.vue')
const SqlReplace = () => import(/* webpackChunkName: "tool" */'@/views/tool/SqlReplace.vue')
export const router = new Router({
  routes: [
    { path: '/login', name: 'Login', component: Login },
    { path: '/', component: Home, children: [
      { path: '/', name: 'Welcome', component: Welcome },
      { path: '/system/article', name: 'Article', component: Article },
      { path: '/system/statistics', name: 'Statistics', component: Statistics },
      { path: '/system/config', name: 'SystemConfig', component: SystemConfig },
      { path: '/system/user', name: 'SystemUser', component: SystemUser },
      { path: '/system/role', name: 'SystemRole', component: SystemRole },
      { path: '/api/hitokoto', name: 'Hitokoto', component: Hitokoto },
      { path: '/api/photoWall', name: 'PhotoWall', component: PhotoWall },
      { path: '/api/sourceImage', name: 'SourceImage', component: SourceImage },
      { path: '/api/chinaProvince', name: 'ChinaProvince', component: ChinaProvince },
      { path: '/api/music', name: 'Music', component: Music },
      { path: '/tool/sqlReplace', name: 'SqlReplace', component: SqlReplace }
    ]},
  ]
})

import menus from './config/menu'

const routePathes : {[propName: string]: string[]} = {
  '/': ['首页'],
}
for(let menu of menus) {
  for(let submenu of menu.child) {
    routePathes[submenu.path] = ['首页', menu.title, submenu.title]
  }
}
export { routePathes }

export const filterExclude = ['/login']
