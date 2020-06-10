<template>
<div>
  <Form ref="configForm" :model="formData" :rules="ruleValidate" :label-width="80">
    <Form-item label="名称" prop="name">
      <Input v-model="formData.name" />
    </Form-item>
    <Form-item label="值" prop="value">
      <Input v-model="formData.value" type="textarea" placeholder="必须符合JSON字符串格式" :rows="4"/>
    </Form-item>
    <Form-item label="描述">
      <Input v-model="formData.description" />
    </Form-item>
    <Form-item label="公开">
      <i-switch v-model="formData.is_public">
        <span slot="open">是</span>
        <span slot="close">否</span>
      </i-switch>
    </Form-item>
  </Form>
</div>
</template>
<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator'
import { SystemConfigModel } from '../../model/system/system-config'

@Component({})
export default class SystenConfigAdd extends Vue {
  @Prop() formData?: SystemConfigModel
  private ruleValidate = {
    name: [
      { required: true, message: '请输入配置项名称', trigger: 'blur' },
      { validator: (rule: object, value: string, callback: Function) => {
          this.$http.get('/system/config/exists', {params: {name: value}}).then(({data}) => {
            if(data.data.exists) {
              callback(new Error('配置项名称已存在'))
            } else {
              callback()
            }
          })
        }, trigger: 'blur'
      }
    ],
    value: [
      { required: true, message: '请输入配置项值', trigger: 'blur' },
      { validator: (rule: object, value: string, callback: Function) => {
          try {
            JSON.parse(value)
            callback()
          } catch (e) {
            callback(new Error('值不符合JSON字符串格式'))
          }
        }, trigger: 'blur'
      }
    ],
  }
}
</script>