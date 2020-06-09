<template>
  <div id="login-wrapper">
    <h2 class="title">博客API管理后台</h2>
    <Form ref="userInfo" :model="userInfo"  :rules="ruleValidate" :label-width="80">
      <Form-item label="用户名" prop="username">
        <Input v-model="userInfo.username" @on-enter="login"/>
      </Form-item>
      <Form-item label="密码" prop="password">
        <Input v-model="userInfo.password" type="password" @on-enter="login" />
      </Form-item>
    </Form>
    <div class="login-btn">
      <Button type="primary" @click="login">登录</Button>
      <Tooltip content="无需账号密码，只有查询权限" placement="bottom">
        <Button @click="guestLogin">访客模式</Button>
      </Tooltip>
    </div>
  </div>
</template>
<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'

@Component({})
export default class Login extends Vue {
  private userInfo = {}
  private ruleValidate = {
    username: [
      { required: true, message: '请输入用户名', trigger: 'blur' }
    ],
    password: [
      { required: true, message: '请输入密码', trigger: 'blur' }
    ],
  }
  /**
   * 登录
   */
  async login() {
    (this.$refs.userInfo as any).validate(async (valid: boolean) => {
      if(!valid) return
      const { data } = await this.$http.post('/common/login', this.userInfo)
      if(data.token) {
        this.$store.commit('login', data)
        this.$router.push('/')
      } else {
        this.$Message.error(data.message)
      }
    })
  }
  /**
   * 访客模式
   */
  async guestLogin() {
    const { data } = await this.$http.post('/common/guestLogin')
    if (data.status && data.data.token) {
      this.$store.commit('login', data.data)
      this.$router.push('/')
    } else {
      this.$Message.error(data.message)
    }
  }
}
</script>
<style lang="less" scoped>
#login-wrapper {
  width: 400px;
  vertical-align: middle;
  position: absolute;
  top: 40%;
  left: 50%;
  transform: translate(-50%, -50%);
  .title {
    text-align: center;
    margin-bottom: 30px;
  }
  .login-btn {
    text-align: center;
  }
}
</style>