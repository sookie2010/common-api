<template>
  <div>
    <div class="echarts-container">
    <v-chart :options="categoriesChart" />
    <v-chart :options="timelineChart" />
    <!-- <v-chart :options="categoriesChart" /> -->
    <!-- <v-chart :options="categoriesChart" /> -->
    </div>
  </div>
</template>
<script>
import ECharts from 'vue-echarts'
import 'echarts/lib/chart/line' // 折线图
import 'echarts/lib/chart/pie' // 饼图

/* Echarts组件 */
import 'echarts/lib/component/title' // 标题
import 'echarts/lib/component/tooltip' // 浮动提示
import 'echarts/lib/component/legendScroll' // 图例
import 'echarts/lib/component/dataZoom' // 数据范围选择
import 'echarts/lib/component/toolbox' // 工具条

export default {
  components: {'v-chart': ECharts},
  created() {
    this.$http.get('/article/statistics').then(data => {
      this.categoriesChart.legend.data = data.categories.map(item => item._id)
      this.categoriesChart.series[0].data = data.categories.map(item => {
        return {name: item._id, value: item.cnt}
      })

      this.timelineChart.xAxis.data = data.timeline.map(item => item._id)
      this.timelineChart.series[0].data = data.timeline.map(item => item.cnt)
    })
  },
  data() {
    return {
      categoriesChart: {
        title : {
          text: '文章分类',
          x: 'center',
          top: 10
        },
        tooltip : {
          trigger: 'item',
          formatter: "{a} <br/>{b} : {c} ({d}%)"
        },
        toolbox: {
          feature: {
            dataView: {
              readOnly: true
            },
            saveAsImage: {}
          },
          right: 15
        },
        legend: {
          type: 'scroll',
          orient: 'vertical',
          right: 10,
          top: 50,
          bottom: 20,
          data: [],
          // selected: data.selected
        },
        series: [{
          name: '类别',
          type: 'pie',
          radius : '55%',
          center: ['40%', '50%'],
          data: [],
          itemStyle: {
            emphasis: {
              shadowBlur: 10,
              shadowOffsetX: 0,
              shadowColor: 'rgba(0, 0, 0, 0.5)'
            }
          }
        }]
      },
      timelineChart: {
        title: {
          left: 'center',
          text: '文章发布时间',
          top: 10
        },
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'cross',
            animation: false,
            label: {
              backgroundColor: '#ccc',
              borderColor: '#aaa',
              borderWidth: 1,
              shadowBlur: 0,
              shadowOffsetX: 0,
              shadowOffsetY: 0,
              textStyle: { color: '#222' }
            }
          },
        },
        toolbox: {
          feature: {
            dataZoom: {
              yAxisIndex: 'none'
            },
            restore: {},
            dataView: {
              readOnly: true
            },
            saveAsImage: {}
          },
          right: 15
        },
        xAxis: {
          type: 'category',
          boundaryGap: false,
          data: []
        },
        yAxis: {
          type: 'value',
          max: function(value) {
            return value.max + 10
          }
        },
        dataZoom: [{
          type: 'inside',
          start: 0,
          end: 100
        },{
          start: 0,
          end: 10,
          handleIcon: 'M10.7,11.9v-1.3H9.3v1.3c-4.9,0.3-8.8,4.4-8.8,9.4c0,5,3.9,9.1,8.8,9.4v1.3h1.3v-1.3c4.9-0.3,8.8-4.4,8.8-9.4C19.5,16.3,15.6,12.2,10.7,11.9z M13.3,24.4H6.7V23h6.6V24.4z M13.3,19.6H6.7v-1.4h6.6V19.6z',
          handleSize: '80%',
          handleStyle: {
            color: '#fff',
            shadowBlur: 3,
            shadowColor: 'rgba(0, 0, 0, 0.6)',
            shadowOffsetX: 2,
            shadowOffsetY: 2
          }
        }],
        series: [{
          name: '文章数量',
          type: 'line',
          smooth: true,
          symbol: 'none',
          sampling: 'average',
          itemStyle: {
            color: 'rgb(255, 70, 131)'
          },
          data: []
        }]
      }
    }
  }
}
</script>
<style scoped>
.echarts-container {
  display: grid;
  grid-template-columns: 50% 50%;
  grid-template-rows: 50% 50%;
  height: 100%;
}
.echarts-container > .echarts {
  border: 1px solid #ccc;
  width: auto;
  height: auto;
}
</style>
