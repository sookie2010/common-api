module.exports = {
  publicPath: './',
  transpileDependencies: [
    'vue-echarts',
    'resize-detector'
  ],
  configureWebpack: { // 这里可以写webpack的配置
    entry: './src/main.ts',
    module: {
      rules: [
        {
          test: /\.ts$/,
          loader: 'ts-loader',
          exclude: /node_modules/,
          options: {
            appendTsSuffixTo: [/\.vue$/],
          }
        }
      ]
    },
    resolve: {
      extensions: ['.ts', '.js', '.css', '.json', '.vue']
    }
  },
  devServer: {
    // proxy: 'http://localhost:3301'
    proxy: 'https://www.colorfulsweet.site/api'
  }
}