module.exports = {
  publicPath: './',
  configureWebpack: {
    // 这里可以写webpack的配置
  },
  devServer: {
    proxy: 'http://localhost:3301'
  }
}