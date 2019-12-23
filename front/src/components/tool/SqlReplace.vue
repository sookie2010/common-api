<template>
<div>
  <Form :label-width="100">
    <Form-item label="SQL语句">
      <Input v-model="sql" type="textarea" :rows="5"/>
    </Form-item>
    <Form-item label="参数">
      <Input v-model="params" type="textarea" :rows="3"/>
    </Form-item>
    <Form-item label="替换结果">
      <Input v-model="replaceResult" ref="resultInput" readonly="readonly"/>
    </Form-item>
  </Form>
  <div style="text-align:center">
    <ButtonGroup size="large" >
      <Button type="primary" ghost icon="md-copy" @click="replacePlaceholder">替换占位符</Button>
      <Button type="default" @click="clear">清空</Button>
    </ButtonGroup>
  </div>
</div>
</template>

<script>
import Input from 'view-design/src/components/input'
import Form from 'view-design/src/components/form'
import FormItem from 'view-design/src/components/form-item'
import ButtonGroup from 'view-design/src/components/button-group'
import Button from 'view-design/src/components/button'

export default {
  components: { Input, Form, FormItem, ButtonGroup, Button },
  data() {
    return {
      sql: null,
      params: null,
      replaceResult: null
    }
  },
  methods: {
    replacePlaceholder() {
      let sql = this.sql
      let reg = /(.+?)\s*\((String|Integer|Boolean)\),?/g
      let execResult = reg.exec(this.params)
      let replaceMent = null
      while(execResult && sql.indexOf('?') !== -1) {
        switch(execResult[2]) {
          case 'String': 
            replaceMent = `'${execResult[1].trim()}'`
            break
          case 'Integer': 
            replaceMent = execResult[1].trim()
            break
          case 'Boolean':
            replaceMent = eval(execResult[1]) ? 1 : 0
            break
        }
        sql = sql.replace('?', replaceMent)
        execResult = reg.exec(this.params)
      }
      this.replaceResult = sql
      let resultInput = this.$refs.resultInput.$el.children[1]
      Promise.resolve('已复制到剪贴板').then(message => {
        resultInput.select()
        if (document.execCommand('copy')) {
          this.$Message.success(message)
        } else {
          this.$Message.warning('复制失败，请手动复制')
        }
      })
    },
    clear() {
      this.sql = null
      this.params = null
      this.replaceResult = null
    }
  }
}
</script>