import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router)

const Welcome = () => import(/* webpackChunkName: "welcome" */'@/components/Welcome')
const Login = () => import(/* webpackChunkName: "login" */'@/components/Login')
const SystemConfig = () => import(/* webpackChunkName: "systemConfig" */'@/components/system/SystemConfig')
const Hitokoto = () => import(/* webpackChunkName: "hitokoto" */'@/components/api/Hitokoto')
const PhotoWall = () => import(/* webpackChunkName: "photoWall" */'@/components/api/PhotoWall')

const router = new Router({
	routes: [
    { path: '/', name: 'Welcome', component: Welcome },
    { path: '/login', name: 'Login', component: Login },
    { path: '/system/config', name: 'SystemConfig', component: SystemConfig },
    { path: '/api/hitokoto', name: 'Hitokoto', component: Hitokoto },
    { path: '/api/photoWall', name: 'PhotoWall', component: PhotoWall }
	]
})
// 登陆状态过滤器需要排除的路由名称
const filterExclude = ['Login']

// 全局路由导航前置守卫
router.beforeEach(function (to, from, next) {
  if(filterExclude.indexOf(to.name) !== -1 || localStorage.getItem('login_token')) {
    next()
  } else {
    next('/login')
  }
})

export default router