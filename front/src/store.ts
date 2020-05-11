import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

interface UserInfo {
  _id: string
  username: string // 用户名
  realname: string // 昵称
  role_ids: string[] // 角色ID
}

interface StateType {
  loginInfo: { // 登录信息
    userInfo: null | UserInfo
    token: null | string
  }
  breadcrumb: string[] // 面包屑导航文字
  pageSizeOpts: number[] // 分页大小可选列表
}

class Store {
  constructor(breadcrumb: string[]) {
    this.state.breadcrumb = breadcrumb
  }
  state: StateType = {
    loginInfo: {
			userInfo: null,
			token: null
    },
    breadcrumb: [],
    pageSizeOpts: [10, 20, 50, 100]
  }
  mutations = {
		/**
     * 登录
     * @param {Object} state 
     * @param {UserInfo} data 登录数据
     */
		login(state: StateType, data: {token: string, userInfo: UserInfo}): void {
			localStorage.setItem('login_token', data.token)
			state.loginInfo.token = data.token
			state.loginInfo.userInfo = data.userInfo
		},
		/**
     * 注销
     * @param {Object} state 
     */
		logout(state: StateType): void {
			localStorage.removeItem('login_token')
			state.loginInfo.token = null
      state.loginInfo.userInfo = null
    },
    /**
     * 设置面包屑导航
     * @param {Object} state 
     * @param {Array} breadcrumbArr 面包屑导航的内容
     */
    setBreadcrumb(state: StateType, breadcrumbArr: string[]): void {
      localStorage.setItem('breadcrumb', JSON.stringify(breadcrumbArr))
      state.breadcrumb = breadcrumbArr
    }
	}
}
const breadcrumbStr = localStorage.getItem('breadcrumb')
export default new Vuex.Store(new Store(breadcrumbStr ? JSON.parse(breadcrumbStr) : []))