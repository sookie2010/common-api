<template>
  <div>
    <Row>
      <Col span="2">
        <div class="search-title">内容：</div>
      </Col>
      <Col span="4">
        <Input v-model="search.content" />
      </Col>

      <Col span="2">
        <div class="search-title">类型：</div>
      </Col>
      <Col span="4">
        <Select v-model="search.type">
          <Option v-for="item in typeList" :value="item.value" :key="item.value">{{ item.label }}</Option>
        </Select>
      </Col>

      <Col span="2">
        <div class="search-title">创建时间：</div>
      </Col>
      <Col span="4">
        <Date-picker v-model="search.createAt" type="daterange"  placement="bottom-end" placeholder="选择日期"></Date-picker>
      </Col>
      <Col span="5" offset="1">
        <Button type="primary" shape="circle" @click="loadData" icon="ios-search">搜索</Button>
        <Button shape="circle" @click="reset" icon="ios-refresh">重置</Button>
      </Col>
    </Row>
    
    <div class="btn-container">
      <Button type="primary" @click="addModal = true">添加</Button>
      <Button type="error" @click="deleteAll">删除</Button>
    </div>
    <div class="table-container">
      <Table border :columns="hitokotoColumns" :data="hitokotoData" height="520"></Table>
      <Spin fix v-show="loading"></Spin>
    </div>
    <div class="page-container">
      <Page :total="search.total" :current="search.pageNum" :page-size="search.limit" 
        show-total show-sizer show-elevator @on-change="pageChange" @on-page-size-change="pageSizeChange"></Page>
    </div>
    <Modal v-model="addModal" title="新增 一言" :loading="true" @on-ok="save">
      <p>点击确定后，对话框将在 2秒 后关闭。</p>
    </Modal>
    
  </div>
</template>
<script>
var typeList = [
  {label:'Anime - 动画', value:'a'},
  {label:'Comic – 漫画', value:'b'},
  {label:'Game – 游戏', value:'c'},
  {label:'Novel – 小说', value:'d'},
  {label:'Myself – 原创', value:'e'},
  {label:'Internet – 来自网络', value:'f'},
  {label:'Other – 其他', value:'g'}
]
export default {
  data() {
    return {
      loading: false,
      search: {
        pageNum: 1,
        limit: 10,
        total: null
      },
      typeList,
      hitokotoColumns: [{
          type: 'selection',
          width: 60,
          align: 'center'
        },{
          title: '类型',
          key: 'type',
          width: 150,
          render (h, data) {
            let type = typeList.find(item => item.value === data.row.type)
            return type ? h('span', type.label) : undefined
          }
        },{
            title: '内容',
            key: 'hitokoto'
        },{
            title: '来自',
            key: 'from',
            width: 150
        },{
            title: '作者',
            key: 'creator',
            width: 150
        },{
            title: '编号',
            key: 'number',
            width: 70
        },{
            title: '创建时间',
            key: 'created_at',
            width: 150,
            render (h, data) {
              return h('span', new Date(data.row.created_at).Format('yyyy-MM-dd hh:mm:ss'))
            }
        }],
      hitokotoData: [],
      addModal: false
    }
  },
  methods: {
    reset() {
      this.search = {
        pageNum: 1,
        limit: 10,
        total: this.search.total
      }
      this.loadData()
    },
    loadData() {
      this.loading = true
      this.$http.get('/hitokoto/list', {params:this.search}).then(res => {
        this.loading = false
        this.search.total = res.data.total
        this.hitokotoData = res.data.data
      })
    },
    save() {
      // TODO 保存一言
      setTimeout(()=>{
        this.addModal = false
      }, 2000)
    },
    deleteAll() {
      
    },
    pageChange(pageNum) {
      this.search.pageNum = pageNum
      this.loadData()
    },
    pageSizeChange(pageSize) {
      this.search.limit = pageSize
      this.loadData()
    }
  },
  created() {
    this.loadData()
  }
}
</script>
