const path = require('path');

const config = {
  entry: './index.js',
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, '')
  },
  module: {
    rules: [
      {
        use: 'babel-loader',
        test: /\.js$/,
        exclude: /node_modules/
      },
      {
        use: ['style-loader', 'css-loader'],
        test: /\.css$/
      },
      {
        use: ['url-loader', 'image-webpack-loader'],
        test: /\.(jpe?g|png|bmp|svg|gif)$/
      }
    ]
  },
  mode: 'production'
}

module.exports = config;
