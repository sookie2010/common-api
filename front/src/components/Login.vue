<template>
  <div>
    <div style="width: 400px;margin: 20px auto;">
    <Form ref="userInfo" :model="userInfo" :rules="ruleValidate" :label-width="80">
      <Form-item label="用户名" prop="username">
        <Input v-model="userInfo.username" @on-enter="login"/>
      </Form-item>
      <Form-item label="密码" prop="password">
        <Input v-model="userInfo.password" type="password" @on-enter="login" />
      </Form-item>
    </Form>
    <div style="padding-left:80px">
      <Button type="primary" @click="login">登录</Button>
    </div>
    </div>
  </div>
</template>
<script>
import Input from 'view-design/src/components/input'
import Form from 'view-design/src/components/form'
import FormItem from 'view-design/src/components/form-item'
import Button from 'view-design/src/components/button'

export default {
  components: { Input, Form, FormItem, Button },
  data() {
    return {
      userInfo: {},
      ruleValidate: {
        username: [
          { required: true, message: '请输入用户名', trigger: 'blur' }
        ],
        password: [
          { required: true, message: '请输入密码', trigger: 'blur' }
        ],
      }
    }
  },
  methods: {
    /**
     * 登录
     */
    login() {
      this.$refs.userInfo.validate(async valid => {
        if(!valid) return
        const data = await this.$http.post('/common/login', this.userInfo)
        if(data.token) {
          this.$store.commit('login', data)
          this.$router.push('/')
        } else {
          this.$Message.error(data.msg)
        }
      })
    }
  }
}
</script>
