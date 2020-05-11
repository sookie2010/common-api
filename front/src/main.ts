import Vue from 'vue'
import App from './App.vue'

import { router, routePathes, filterExclude } from './router'
import { Route } from 'vue-router'
import store from './store'

Vue.config.productionTip = false

/*------iview start------*/
import 'view-design/dist/styles/iview.css'
import ViewUI from 'view-design'
Vue.use(ViewUI)
/*------iview end------*/

/*------axios start------*/
import axios from 'axios'
// 配置默认axios参数
axios.defaults.baseURL = process.env.VUE_APP_BASEURL
axios.defaults.timeout = 1000000

// 添加请求拦截器
axios.interceptors.request.use(config => {
  // 在发送请求之前添加token到请求头
  if (localStorage.getItem('login_token')) {
    config.headers.common['token'] = localStorage.getItem('login_token')
  }
  return config
}, err => {
  // 对请求错误做些什么
  vm.$Modal.error({
    title: '错误',
    content: '请求超时，请稍后再试'
  })
  return Promise.reject(err)
})

axios.interceptors.response.use(res=> {
  return res
}, err => {
  if(err.response.status >= 500) {
    vm.$Modal.error({
      title: '错误',
      content: '服务器内部错误'
    })
  } else if(err.response.status >= 400) {
    vm.$Modal.warning({
      title: '警告',
      content: err.response.data.msg,
      onOk() {
        if(err.response.status === 403) {
          vm.$router.push('/login')
        }
      }
    })
  }
  return Promise.resolve(err)
})
Vue.prototype.$http = axios
/*------axios end------*/
const vm = new Vue({
  render: h => h(App),
  router,
  store
}).$mount('#app')

// 全局路由导航前置守卫
router.beforeEach(function (to: Route, from: Route, next: Function) {
  vm.$store.commit('setBreadcrumb', routePathes[to.path] || [])
  localStorage.setItem('routePath', to.path)
  if(filterExclude.indexOf(to.path) !== -1 || localStorage.getItem('login_token')) {
    next()
  } else {
    next('/login')
  }
})
