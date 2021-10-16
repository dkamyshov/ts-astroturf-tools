const path = require('path');
const MCEP = require('mini-css-extract-plugin');
const HWP = require('html-webpack-plugin');

module.exports = {
  mode: 'development',
  devtool: 'source-map',

  entry: './src/index.tsx',

  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'app.js',
    publicPath: '/',
  },

  resolve: {
    modules: [path.resolve(__dirname, 'node_modules')],
    extensions: ['.tsx', '.js', '.css'],
  },

  module: {
    rules: [
      {
        test: /\.tsx$/,
        use: [
          {
            loader: 'ts-loader',
            options: {
              compiler: 'ttypescript',
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
              linaria: true,
            },
          },
        ],
      },
      {
        test: /\.astroturf\.local\.css$/,
        use: [
          {
            loader: MCEP.loader,
          },
          {
            loader: 'css-loader',
            options: {
              modules: {
                mode: 'local',
                localIdentName: '[name]_[local]',
              },
            },
          },
        ],
      },
      {
        test: /\.astroturf\.css$/,
        use: [
          MCEP.loader,
          {
            loader: 'css-loader',
            options: {
              modules: {
                mode: 'local',
                localIdentName: 'LIBRARY_[name]_[local]_[hash:hex:4]',
              },
            },
          },
        ],
      },
    ],
  },

  plugins: [
    new MCEP({
      filename: 'style.css',
    }),
    new HWP({
      template: 'src/index.html',
    }),
  ],
};
