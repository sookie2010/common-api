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
  return res.data
}, err => {
  if(err.response.status === 403) {
    vm.$Modal.warning({
      title: '警告',
      content: err.response.data.msg,
      onOk() {
        vm.$router.push('/login')
      }
    })
  } else if(err.response.status >= 500) {
    vm.$Modal.error({
      title: '错误',
      content: '服务器内部错误'
    })
  }
  return Promise.resolve(err);
})

Vue.prototype.$http = axios

const vm = new Vue({
  render: h => h(App),
  router
}).$mount('#app')

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