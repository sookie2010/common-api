import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router)

const Hitokoto = () => import(/* webpackChunkName: "hitokoto" */'@/components/api/Hitokoto')

const router = new Router({
	routes: [
		{ path: '/api/hitokoto', name: 'Hitokoto', component: Hitokoto }
	]
})
// 登陆状态过滤器需要排除的路由名称
const filterExclude = ['Login', 'Register', 'ForgetPwd']

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