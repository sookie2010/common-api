<template>
  <div id="app" >
    <router-view ></router-view>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'

@Component({})
export default class App extends Vue{
  private name = 'app'
}
</script>
<style lang="less">
@import url('./static/common.less');
</style>