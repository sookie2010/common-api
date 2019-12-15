<template>
<div>
  <Form :model="formData" :label-width="80">
    <Form-item label="名称">
      <Input v-model="formData.name" />
    </Form-item>
    <Form-item label="值">
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
<script>
import Input from 'view-design/src/components/input'
import Form from 'view-design/src/components/form'
import FormItem from 'view-design/src/components/form-item'
import ISwitch from 'view-design/src/components/switch'

export default {
  components: { Input, Form, FormItem, ISwitch },
  props: {
    formData: Object
  }
}
</script>