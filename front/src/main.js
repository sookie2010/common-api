import Vue from 'vue'
import App from './App.vue'

import router from './router'

// iview
import iView from 'iview'
import 'iview/dist/styles/iview.css'
Vue.use(iView)

Vue.config.productionTip = false

import axios from 'axios'
// 配置默认axios参数
// axios.defaults.baseURL = 'https://www.colorfulsweet.site/api'
axios.defaults.timeout = 1000000
Vue.prototype.$http = axios

new Vue({
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