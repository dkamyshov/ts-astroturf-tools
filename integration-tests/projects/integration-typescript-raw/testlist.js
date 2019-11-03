const path = require('path');
const fs = require('fs');

module.exports = fs
  .readdirSync(path.resolve(__dirname, 'src'))
  .reduce((entries, current) => {
    const fileNameWithoutExtension = current.replace(/\..+$/, '');

    if (fs.statSync(path.resolve(__dirname, 'src', current)).isDirectory()) {
      return entries;
    }

    entries.push(fileNameWithoutExtension);

    return entries;
  }, []);
