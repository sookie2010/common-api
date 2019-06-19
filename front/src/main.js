import Vue from 'vue'
import App from './App.vue'

import router from './router'

// iview
import 'iview/dist/styles/iview.css'
import Message from 'iview/src/components/message'
import Modal from 'iview/src/components/modal'
Vue.prototype.$Message = Message
Vue.prototype.$Modal = Modal

Vue.config.productionTip = false

import axios from 'axios'
// 配置默认axios参数
axios.defaults.baseURL = process.env.VUE_APP_BASEURL
axios.defaults.timeout = 1000000

// 添加请求拦截器
axios.interceptors.request.use(function (config) {
  // 在发送请求之前添加token到请求头
  if (localStorage.getItem('login_token')) {
    config.headers.common['token'] = localStorage.getItem('login_token')
  }
  return config
}, function (error) {
  // 对请求错误做些什么
  return Promise.reject(error)
})
Vue.prototype.$http = axios

new Vue({
  el: '#app',
  render: h => h(App),
  router
})//.$mount('#app')

// 日期格式化函数
Date.prototype.Format = function(fmt) {
  let o = {
    "M+" : this.getMonth()+1,                 //月份  
    "d+" : this.getDate(),                    //日  
    "h+" : this.getHours(),                   //小时  
    "m+" : this.getMinutes(),                 //分  
    "s+" : this.getSeconds(),                 //秒  
    "q+" : Math.floor((this.getMonth()+3)/3), //季度  
    "S"  : this.getMilliseconds()             //毫秒  
  }
  if(/(y+)/.test(fmt))  
      fmt=fmt.replace(RegExp.$1, (this.getFullYear()+"").substr(4 - RegExp.$1.length))
  for(let k in o)
      if(new RegExp("("+ k +")").test(fmt))
          fmt = fmt.replace(RegExp.$1, (RegExp.$1.length==1) ? (o[k]) : (("00"+ o[k]).substr((""+ o[k]).length)))
  return fmt
}