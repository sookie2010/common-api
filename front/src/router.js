import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router)

const Welcome = () => import(/* webpackChunkName: "welcome" */'@/components/Welcome')
const Login = () => import(/* webpackChunkName: "login" */'@/components/Login')
const Article = () => import(/* webpackChunkName: "article" */'@/components/system/Article')
const SystemConfig = () => import(/* webpackChunkName: "systemConfig" */'@/components/system/SystemConfig')
const Hitokoto = () => import(/* webpackChunkName: "hitokoto" */'@/components/api/Hitokoto')
const PhotoWall = () => import(/* webpackChunkName: "photoWall" */'@/components/api/PhotoWall')


export const router = new Router({
  routes: [
    { path: '/', name: 'Welcome', component: Welcome },
    { path: '/login', name: 'Login', component: Login },
    { path: '/system/article', name: 'Article', component: Article },
    { path: '/system/config', name: 'SystemConfig', component: SystemConfig },
    { path: '/api/hitokoto', name: 'Hitokoto', component: Hitokoto },
    { path: '/api/photoWall', name: 'PhotoWall', component: PhotoWall }
  ]
})

export const routePathes = {
  'Welcome': ['首页'],
  'Login': ['首页', '登录'],
  'SystemConfig': ['首页', '系统管理', '系统配置'],
  'Article': ['首页', '系统管理', '博客文章'],
  'Hitokoto': ['首页', 'API数据', '一言'],
  'PhotoWall': ['首页', 'API数据', '照片墙']
}

export const filterExclude = ['Login']
