var path = require('path')

module.exports = {
  entry: './src',
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'dist')
  },
  devServer: {
    contentBase: "./dist",
    colors: true,
    historyApiFallback: true,
    inline: true,
    stats: 'errors-only'
  },
  rules: [{
    test: /\.js$/, include: [path.resolve(__dirname, './src')],
    loader: "babel-loader",
    options: {
      presets: ["es2015"]
    },
  }]
}
