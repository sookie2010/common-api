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
  </Form>
</div>
</template>
<script>
import Input from 'iview/src/components/input'
import Form from 'iview/src/components/form'
import FormItem from 'iview/src/components/form-item'

export default {
  components: { Input, Form, FormItem },
  props: {
    formData: Object
  }
}
</script>