import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router)

const Login = () => import('@/components/Login.vue')
const Home = () => import('@/components/Home.vue')
const Welcome = () => import('@/components/Welcome.vue')
const Article = () => import(/* webpackChunkName: "system" */'@/components/system/Article.vue')
const Statistics = () => import(/* webpackChunkName: "system" */'@/components/system/Statistics.vue')
const SystemConfig = () => import(/* webpackChunkName: "system" */'@/components/system/SystemConfig.vue')
const SystemUser = () => import(/* webpackChunkName: "system" */'@/components/system/SystemUser.vue')
const SystemRole = () => import(/* webpackChunkName: "system" */'@/components/system/SystemRole.vue')
const Hitokoto = () => import(/* webpackChunkName: "api" */'@/components/api/Hitokoto.vue')
const PhotoWall = () => import(/* webpackChunkName: "api" */'@/components/api/PhotoWall.vue')
const SourceImage = () => import(/* webpackChunkName: "api" */'@/components/api/SourceImage.vue')
const ChinaProvince = () => import(/* webpackChunkName: "api" */'@/components/api/ChinaProvince.vue')
const MusicLib = () => import(/* webpackChunkName: "api" */'@/components/api/MusicLib.vue')
const SqlReplace = () => import(/* webpackChunkName: "tool" */'@/components/tool/SqlReplace.vue')
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
      { path: '/api/musicLib', name: 'MusicLib', component: MusicLib },
      { path: '/tool/sqlReplace', name: 'SqlReplace', component: SqlReplace }
    ]},
  ]
})

export const routePathes : {[propName: string]: string[]} = {
  '/': ['首页'],
  '/system/config': ['首页', '系统管理', '系统配置'],
  '/system/user': ['首页', '系统管理', '用户管理'],
  '/system/role': ['首页', '系统管理', '角色管理'],
  '/system/article': ['首页', '系统管理', '博客文章'],
  '/system/statistics': ['首页', '系统管理', '分析统计'],
  '/api/hitokoto': ['首页', 'API数据', '一言'],
  '/api/photoWall': ['首页', 'API数据', '照片墙'],
  '/api/sourceImage': ['首页', 'API数据', '图片资源库'],
  '/api/chinaProvince': ['首页', 'API数据', '中国行政区划'],
  '/api/musicLib': ['首页', 'API数据', '歌曲库'],
  '/tool/sqlReplace': ['首页', '工具', 'SQL占位符替换']
}

export const filterExclude = ['/login']
