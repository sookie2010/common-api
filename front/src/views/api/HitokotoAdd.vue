<template>
<div>
  <Form :model="formData" :label-width="80">
    <Form-item label="内容">
      <Input v-model="formData.hitokoto" type="textarea" :rows="4"/>
    </Form-item>
    <Form-item label="类型">
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
}
</script>