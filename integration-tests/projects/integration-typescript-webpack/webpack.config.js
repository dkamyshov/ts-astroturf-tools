const path = require('path');
const fs = require('fs');
const ExtractCSSChunksWebpackPlugin = require('extract-css-chunks-webpack-plugin');
const testlist = require('./testlist');

module.exports = {
  mode: 'development',
  devtool: 'source-map',

  entry: testlist.reduce((entries, current) => {
    entries[current] = `./src/${current}.tsx`;
    return entries;
  }, {}),

  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: '[name]/app.js',
    publicPath: '/',
  },

  module: {
    rules: [
      {
        test: /\.tsx$/,
        use: [
          {
            loader: 'awesome-typescript-loader',
            options: {
              transpileOnly: true,
            },
          },
          {
            loader: 'astroturf/loader',
            options: {
              extension: '.astroturf.local.css',
            },
          },

          {
            loader: '../../../loader',
            options: {
              direct: true,
            },
          },
        ],
      },
      {
        test: /\.astroturf\.local\.css$/,
        use: [
          ExtractCSSChunksWebpackPlugin.loader,
          {
            loader: 'astroturf/css-loader',
            options: {
              importLoaders: 1,
              modules: {
                mode: 'local',
                localIdentName: '[name]_[local]',
              },
            },
          },
        ],
      },
    ],
  },

  plugins: [
    new ExtractCSSChunksWebpackPlugin({
      filename: '[name]/style.css',
    }),
  ],

  externals: {
    astroturf: 'commonjs2 astroturf',
  },
};
