var path = require('path');
var webpack = require('webpack');
var HtmlWebpackPlugin = require('html-webpack-plugin');
var CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = {
  devtool: 'source-map',
  entry: [
    './src/index'
  ],
  output: {
    path: path.join(__dirname, 'dist'),
    filename: 'bundle.js',
    publicPath: ''
  },
  plugins: [
    new webpack.DefinePlugin({
      'process.env': {
        'NODE_ENV': JSON.stringify('production')
      }
    }),
    new HtmlWebpackPlugin({
      title: 'Intersidereal',
      favicon: 'assets/favicon.ico'
    }),
    // new webpack.optimize.UglifyJsPlugin({
    //   compressor: {
    //     warnings: false
    //   }
    // }),
    new CopyWebpackPlugin([
      { from: 'assets/**/*', to: 'assets/[name].[ext]', ignore: ['.*'] }
    ])
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
