const path = require('path');
const runner = require('./runner');
const fs = require('fs');
const testlist = require('../projects/integration-typescript-raw/testlist');

jest.setTimeout(30000);

describe('typescript-raw', () => {
  const workingDirectory = path.resolve(
    __dirname,
    '../projects/integration-typescript-raw'
  );

  beforeAll(async () => {
    await runner.run(workingDirectory, 'yarn', ['--frozen-lockfile']);
  });

  testlist.forEach(filename => {
    it(`css snapshot test - ${filename}`, async () => {
      const resultCSSFileContent = fs
        .readFileSync(path.resolve(workingDirectory, `lib/${filename}.js`))
        .toString();

      expect(resultCSSFileContent).toMatchSnapshot();
    });
  });
});
