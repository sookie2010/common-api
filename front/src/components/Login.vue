<template>
  <div>
    <div style="width: 400px;margin: 20px auto;">
    <Form :model="userInfo" :label-width="80">
      <Form-item label="用户名">
        <Input v-model="userInfo.username" />
      </Form-item>
      <Form-item label="密码">
        <Input v-model="userInfo.password" type="password" />
      </Form-item>
    </Form>
    <div style="padding-left:80px">
    <Button type="primary" @click="login">登录</Button>
    </div>
    </div>
  </div>
</template>
<script>
import Input from 'iview/src/components/input'
import Form from 'iview/src/components/form'
import FormItem from 'iview/src/components/form-item'
import Button from 'iview/src/components/button'

export default {
  components: { Input, Form, FormItem, Button },
  data() {
    return {
      userInfo: {}
    }
  },
  methods: {
    login() {
      // 登录
      this.$http.post('/common/login', this.userInfo).then(data => {
        if(data.token) {
          localStorage.setItem('login_token', data.token)
          this.$router.push('/')
        } else {
          this.$Message.error('用户名/密码 错误')
        }
      })
    }
  }
}
</script>
