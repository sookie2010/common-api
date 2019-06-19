import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router)

const Login = () => import(/* webpackChunkName: "login" */'@/components/Login')
const Hitokoto = () => import(/* webpackChunkName: "hitokoto" */'@/components/api/Hitokoto')
const PhotoWall = () => import(/* webpackChunkName: "photoWall" */'@/components/api/PhotoWall')

const router = new Router({
	routes: [
    { path: '/login', name: 'Login', component: Login },
    { path: '/api/hitokoto', name: 'Hitokoto', component: Hitokoto },
    { path: '/api/photoWall', name: 'PhotoWall', component: PhotoWall }
	]
})
// 登陆状态过滤器需要排除的路由名称
const filterExclude = ['Login']

// 全局路由导航前置守卫
router.beforeEach(function (to, from, next) {
  // 显示加载提示框
  let isLogin = true// TODO 获取是否登录
  if(filterExclude.indexOf(to.name) !== -1 || isLogin) {
    next()
  } else {
    next('/')
  }
})

export default router