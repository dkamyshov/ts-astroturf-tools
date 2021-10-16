const path = require('path');
const fs = require('fs');

const excluded = {
  'stylesheet-missing-css': true,
  'stylesheet-unused-css': true,
};

module.exports = fs
  .readdirSync(path.resolve(__dirname, 'src'))
  .reduce((entries, current) => {
    const fileNameWithoutExtension = current.replace(/\..+$/, '');

    if (
      excluded[fileNameWithoutExtension] ||
      fs.statSync(path.resolve(__dirname, 'src', current)).isDirectory()
    ) {
      return entries;
    }

    entries.push(fileNameWithoutExtension);

    return entries;
  }, []);
