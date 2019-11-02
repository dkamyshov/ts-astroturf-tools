const path = require('path');
const ECC = require('extract-css-chunks-webpack-plugin');
const externalsConfig = require('./webpack.config.externals');

const sourceTests = [
  'css-local-interpolation.tsx',
  'css.tsx',
  'styled-local-interpolation.tsx',
  'styled-remote-interpolation.tsx',
  'styled.tsx',
  'xcss-local-interpolation.tsx',
  'xcss-property-assignment-local-interpolation.tsx',
  'xcss-property-assignment-remote-interpolation.tsx',
  'xcss-property-assignment.tsx',
  'xcss-remote-interpolation.tsx',
  'xcss.tsx',
];

module.exports = {
  ...externalsConfig,

  entry: sourceTests.reduce((acc, current) => {
    const normalizedName = current.replace(/\.[^/.]+$/, '');
    acc[normalizedName] = `./src/integration-tests-sources/${current}`;
    return acc;
  }, {}),

  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: '[name]/app.js',
    publicPath: '/',
  },

  plugins: [
    new ECC({
      filename: '[name]/style.css',
    }),
  ],
};
