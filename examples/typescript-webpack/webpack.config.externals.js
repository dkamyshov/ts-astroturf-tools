const base = require('./webpack.config');

module.exports = {
  ...base,
  externals: {
    react: 'commonjs2 react',
    'react-dom': 'commonjs2 react-dom',
    astroturf: 'commonjs2 astroturf',
  },
};
