<template>
<div class="form-panel">
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
<script>
import Input from 'iview/src/components/input'
import Select from 'iview/src/components/select'
import Option from 'iview/src/components/option'

import Form from 'iview/src/components/form'
import FormItem from 'iview/src/components/form-item'
export default {
  components: { Input, Select, Option, Form, FormItem },
  props: {
    typeList: Array,
    formData: Object
  }
}
</script>