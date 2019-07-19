module.exports = {
  publicPath: './',
  transpileDependencies: [
    'vue-echarts',
    'resize-detector'
  ],
  configureWebpack: {
    // 这里可以写webpack的配置
  },
  devServer: {
    proxy: 'http://localhost:3301'
  }
}