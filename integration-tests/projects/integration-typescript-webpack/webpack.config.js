const path = require('path');
const MCEP = require('mini-css-extract-plugin');
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
            loader: 'ts-loader',
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
              linaria: true,
            },
          },
        ],
      },
      {
        test: /\.astroturf\.local\.css$/,
        use: [
          MCEP.loader,
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
    ],
  },

  plugins: [
    new MCEP({
      filename: '[name]/style.css',
    }),
  ],

  externals: {
    astroturf: 'commonjs2 astroturf',
  },
};
