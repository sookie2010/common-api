<template>
<div>
  <Form ref="hitokotoForm" :model="formData" :rules="ruleValidate" :label-width="80">
    <Form-item label="内容" prop="hitokoto">
      <Input v-model="formData.hitokoto" type="textarea" :rows="4"/>
    </Form-item>
    <Form-item label="类型" prop="type">
      <Select v-model="formData.type">
        <Option v-for="item in typeList" :value="item.value" :key="item.value">{{ item.label }}</Option>
      </Select>
    </Form-item>
    <Form-item label="来自">
      <Input v-model="formData.from" />
    </Form-item>
    <Form-item label="作者">
      <Input v-model="formData.creator" />
    </Form-item>
  </Form>
</div>
</template>
<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator'

@Component({})
export default class HitokotoAdd extends Vue {
  @Prop() typeList?: []
  @Prop() formData?: object
  private ruleValidate = {
    hitokoto: [
      { required: true, message: '请输入内容', trigger: 'blur' }
    ],
    type: [
      { required: true, message: '请选择类型', trigger: 'blur' }
    ],
  }
}
</script>