const path = require('path');
const ECC = require('extract-css-chunks-webpack-plugin');
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
            loader: 'awesome-typescript-loader',
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
            loader: '../../loader',
            options: {
              direct: true,
            },
          },
        ],
      },
      {
        test: /\.astroturf\.local\.css$/,
        use: [
          ECC.loader,
          {
            loader: 'astroturf/css-loader',
            options: {
              importLoaders: 1,
              modules: {
                mode: 'local',
                localIdentName: '[name]_[local]_[hash:hex:4]',
              },
            },
          },
        ],
      },
      {
        test: /\.astroturf\.css$/,
        use: [
          ECC.loader,
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
    new ECC({
      filename: 'style.css',
    }),
    new HWP({
      template: 'src/index.html',
    }),
  ],
};
