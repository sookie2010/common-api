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

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'

@Component({})
export default class SqlReplace extends Vue {
  private sql: string = ''
  private params: string = ''
  private replaceResult: string = ''
  replacePlaceholder() {
    let sql = this.sql
    const reg = /(.+?)\s*\((String|Integer|Boolean)\),?/g
    let execResult = reg.exec(this.params)
    let replaceMent = ''
    while(execResult && sql.indexOf('?') !== -1) {
      switch(execResult[2]) {
        case 'String': 
          replaceMent = `'${execResult[1].trim()}'`
          break
        case 'Integer': 
          replaceMent = execResult[1].trim()
          break
        case 'Boolean':
          replaceMent = eval(execResult[1]) ? '1' : '0'
          break
      }
      sql = sql.replace('?', replaceMent)
      execResult = reg.exec(this.params)
    }
    this.replaceResult = sql
    const inputInstance = this.$refs.resultInput as Vue
    const resultInput = inputInstance.$el.children[1] as HTMLInputElement
    Promise.resolve('已复制到剪贴板').then(message => {
      resultInput.select()
      if (document.execCommand('copy')) {
        this.$Message.success(message)
      } else {
        this.$Message.warning('复制失败，请手动复制')
      }
    })
  }
  clear() {
    this.sql = ''
    this.params = ''
    this.replaceResult = ''
  }
}
</script>