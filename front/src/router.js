import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router)

const Welcome = () => import(/* webpackChunkName: "welcome" */'@/components/Welcome')
const Login = () => import(/* webpackChunkName: "login" */'@/components/Login')
const Article = () => import(/* webpackChunkName: "article" */'@/components/system/Article')
const Statistics = () => import(/* webpackChunkName: "Statistics" */'@/components/system/Statistics')
const SystemConfig = () => import(/* webpackChunkName: "systemConfig" */'@/components/system/SystemConfig')
const SystemUser = () => import(/* webpackChunkName: "systemUser" */'@/components/system/SystemUser')
const Hitokoto = () => import(/* webpackChunkName: "hitokoto" */'@/components/api/Hitokoto')
const PhotoWall = () => import(/* webpackChunkName: "photoWall" */'@/components/api/PhotoWall')
const SourceImage = () => import(/* webpackChunkName: "sourceImage" */'@/components/api/SourceImage')
const ChinaProvince = () => import(/* webpackChunkName: "chinaProvince" */'@/components/api/ChinaProvince')
const SqlReplace = () => import(/* webpackChunkName: "sqlReplace" */'@/components/tool/SqlReplace')
export const router = new Router({
  routes: [
    { path: '/', name: 'Welcome', component: Welcome },
    { path: '/login', name: 'Login', component: Login },
    { path: '/system/article', name: 'Article', component: Article },
    { path: '/system/statistics', name: 'Statistics', component: Statistics },
    { path: '/system/config', name: 'SystemConfig', component: SystemConfig },
    { path: '/system/user', name: 'SystemUser', component: SystemUser },
    { path: '/api/hitokoto', name: 'Hitokoto', component: Hitokoto },
    { path: '/api/photoWall', name: 'PhotoWall', component: PhotoWall },
    { path: '/api/sourceImage', name: 'SourceImage', component: SourceImage },
    { path: '/api/chinaProvince', name: 'ChinaProvince', component: ChinaProvince },
    { path: '/tool/sqlReplace', name: 'SqlReplace', component: SqlReplace }
  ]
})

export const routePathes = {
  'Welcome': ['首页'],
  'Login': ['首页', '登录'],
  'SystemConfig': ['首页', '系统管理', '系统配置'],
  'SystemUser': ['首页', '系统管理', '用户管理'],
  'Article': ['首页', '系统管理', '博客文章'],
  'Statistics': ['首页', '系统管理', '分析统计'],
  'Hitokoto': ['首页', 'API数据', '一言'],
  'PhotoWall': ['首页', 'API数据', '照片墙'],
  'SourceImage': ['首页', 'API数据', '图片资源库'],
  'ChinaProvince': ['首页', 'API数据', '中国行政区划'],
  'SqlReplace': ['首页', '工具', 'SQL占位符替换']
}

export const filterExclude = ['Login']
