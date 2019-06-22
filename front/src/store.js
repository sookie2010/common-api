import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

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

export default new Vuex.Store({
	state: {
		loginInfo: {
			userInfo: null,
			token: null
    },
    breadcrumb: []
	},
	mutations: {
		/**
     * 登录
     * @param {Object} state 
     * @param {Object} userInfo 用户信息
     * @param {String} token 登录Token
     */
		login(state, user) {
			localStorage.setItem('login_token', user.token)
			state.loginInfo.token = user.token
			state.loginInfo.userInfo = user.userInfo
		},
		/**
     * 注销
     * @param {Object} state 
     */
		logout(state) {
			localStorage.removeItem('login_token')
			state.loginInfo.token = null
			state.loginInfo.userInfo = null
    },
    /**
     * 设置面包屑导航
     * @param {Object} state 
     * @param {Array} breadcrumbArr 面包屑导航的内容
     */
    setBreadcrumb(state, breadcrumbArr) {
      state.breadcrumb = breadcrumbArr
    }
	}
})