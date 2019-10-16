const { join, dirname, basename, extname, relative, resolve } = require('path');

const srcDirectory = 'ts-tmp/';
const distDirectory = 'lib/';

module.exports = {
  inputSourceMap: true,
  presets: [
    [
      '@babel/preset-env',
      {
        modules: false,
      },
    ],
  ],
  plugins: [
    [
      'astroturf/plugin',
      {
        extension: '.astroturf.css',
        getFileName(hostFilePath, pluginsOptions, identifier) {
          const relativeFilePath = relative(__dirname, hostFilePath);
          const relativeFilePathWithoutSrc = relativeFilePath.replace(
            srcDirectory,
            ''
          );
          const relativeFilePathDist =
            distDirectory + relativeFilePathWithoutSrc;
          const fullFilePath = resolve(relativeFilePathDist);
          const basepath = join(
            dirname(fullFilePath),
            basename(fullFilePath, extname(fullFilePath))
          );
          return `${basepath}${identifier ? `.${identifier}` : ''}${
            pluginsOptions.extension
          }`;
        },
      },
    ],
    '../../babel-plugin',
  ],
};
