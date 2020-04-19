import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router)

const Welcome = () => import('@/components/Welcome.vue')
const Login = () => import('@/components/Login.vue')
const Article = () => import(/* webpackChunkName: "article" */'@/components/system/Article.vue')
const Statistics = () => import(/* webpackChunkName: "Statistics" */'@/components/system/Statistics.vue')
const SystemConfig = () => import(/* webpackChunkName: "systemConfig" */'@/components/system/SystemConfig.vue')
const SystemUser = () => import(/* webpackChunkName: "systemUser" */'@/components/system/SystemUser.vue')
const SystemRole = () => import(/* webpackChunkName: "systemRole" */'@/components/system/SystemRole.vue')
const Hitokoto = () => import(/* webpackChunkName: "hitokoto" */'@/components/api/Hitokoto.vue')
const PhotoWall = () => import(/* webpackChunkName: "photoWall" */'@/components/api/PhotoWall.vue')
const SourceImage = () => import(/* webpackChunkName: "sourceImage" */'@/components/api/SourceImage.vue')
const ChinaProvince = () => import(/* webpackChunkName: "chinaProvince" */'@/components/api/ChinaProvince.vue')
const SqlReplace = () => import(/* webpackChunkName: "sqlReplace" */'@/components/tool/SqlReplace.vue')
export const router = new Router({
  routes: [
    { path: '/', name: 'Welcome', component: Welcome },
    { path: '/login', name: 'Login', component: Login },
    { path: '/system/article', name: 'Article', component: Article },
    { path: '/system/statistics', name: 'Statistics', component: Statistics },
    { path: '/system/config', name: 'SystemConfig', component: SystemConfig },
    { path: '/system/user', name: 'SystemUser', component: SystemUser },
    { path: '/system/role', name: 'SystemRole', component: SystemRole },
    { path: '/api/hitokoto', name: 'Hitokoto', component: Hitokoto },
    { path: '/api/photoWall', name: 'PhotoWall', component: PhotoWall },
    { path: '/api/sourceImage', name: 'SourceImage', component: SourceImage },
    { path: '/api/chinaProvince', name: 'ChinaProvince', component: ChinaProvince },
    { path: '/tool/sqlReplace', name: 'SqlReplace', component: SqlReplace }
  ]
})

export const routePathes : {[propName: string]: string[]} = {
  'Welcome': ['首页'],
  'Login': ['首页', '登录'],
  'SystemConfig': ['首页', '系统管理', '系统配置'],
  'SystemUser': ['首页', '系统管理', '用户管理'],
  'SystemRole': ['首页', '系统管理', '角色管理'],
  'Article': ['首页', '系统管理', '博客文章'],
  'Statistics': ['首页', '系统管理', '分析统计'],
  'Hitokoto': ['首页', 'API数据', '一言'],
  'PhotoWall': ['首页', 'API数据', '照片墙'],
  'SourceImage': ['首页', 'API数据', '图片资源库'],
  'ChinaProvince': ['首页', 'API数据', '中国行政区划'],
  'SqlReplace': ['首页', '工具', 'SQL占位符替换']
}

export const filterExclude = ['/login']
