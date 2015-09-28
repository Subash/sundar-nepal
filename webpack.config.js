var webpack = require("webpack");
module.exports = {
  module: {
    loaders: [
      {
        test: /\.js?$/,
        exclude: /(node_modules|bower_components)/,
        loader: 'babel',
        query: {
          stage: 0
        }
      }
    ]
  },
  plugins: [
    new webpack.optimize.UglifyJsPlugin({minimize: true})
  ],
  entry: './app.js',
  output: {
    filename: './app.min.js'
  }
};
