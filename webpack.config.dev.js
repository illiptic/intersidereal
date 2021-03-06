var path = require('path');
var webpack = require('webpack');
var HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  devtool: 'cheap-module-eval-source-map',
  entry: [
    'webpack-hot-middleware/client',
    './src/index'
  ],
  output: {
    path: path.join(__dirname, 'dist'),
    filename: 'bundle.js',
    publicPath: '/'
  },
  plugins: [
    new webpack.HotModuleReplacementPlugin(),
    new HtmlWebpackPlugin({
      title: 'Intersidereal',
      favicon: 'assets/favicon.ico'
    })
  ],
  module: {
    loaders: [{
      test: /\.js$/,
      loaders: ['babel-loader'],
      include: path.join(__dirname, 'src')
    }, {
      test: /\.less$/,
      loaders: [
        'style-loader',
        'css-loader',
        'less-loader?modules'],
      include: [path.join(__dirname, 'src'), path.resolve(__dirname, 'node_modules')]
    }, {
      test: /\.png|\.gif$/,
      loaders: ['file-loader?name=assets/[name].[ext]']
    }]
  }
};
