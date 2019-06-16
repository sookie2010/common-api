<template>
<div class="form-panel">
  <Row>
    <Col span="4">
      <div class="search-title">内容：</div>
    </Col>
    <Col span="20">
      <Input v-model="formData.hitokoto" type="textarea" :rows="4"/>
    </Col>
    </Row>
    <Row>
    <Col span="4">
      <div class="search-title">类型：</div>
    </Col>
    <Col span="20">
      <Select v-model="formData.type">
        <Option v-for="item in typeList" :value="item.value" :key="item.value">{{ item.label }}</Option>
      </Select>
    </Col>
    </Row>
    <Row>
    <Col span="4">
      <div class="search-title">来自：</div>
    </Col>
    <Col span="20">
      <Input v-model="formData.from" />
    </Col>
    </Row>
    <Row>
    <Col span="4">
      <div class="search-title">作者：</div>
    </Col>
    <Col span="20">
      <Input v-model="formData.creator" />
    </Col>
  </Row>
</div>
</template>
<script>
import Row from 'iview/src/components/row'
import Col from 'iview/src/components/col'
import Input from 'iview/src/components/input'
import Select from 'iview/src/components/select'
import Option from 'iview/src/components/option'

export default {
  components: { Row, Col, Input, Select, Option },
  props: {
    typeList: Array,
    formData: Object
  }
}
</script>
<style scoped>
.form-panel .ivu-row {
  margin-bottom: 10px;
}
</style>