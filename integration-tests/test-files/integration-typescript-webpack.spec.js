const path = require('path');
const runner = require('./runner');
const fs = require('fs');
const testlist = require('../projects/integration-typescript-webpack/testlist');

jest.setTimeout(30000);

describe('typescript-webpack', () => {
  const workingDirectory = path.resolve(
    __dirname,
    '../projects/integration-typescript-webpack'
  );

  beforeAll(async () => {
    await runner.run(workingDirectory, 'yarn', []);
  });

  const executeTest = async (workingDirectory, testName) => {
    return runner.run(workingDirectory, 'yarn', [
      'webpack',
      `src/${testName}.tsx`,
      '--output-path',
      `dist/${testName}`,
    ]);
  };

  testlist.forEach(filename => {
    it(`css snapshot test - ${filename}`, async () => {
      const resultCSSFileContent = fs
        .readFileSync(
          path.resolve(workingDirectory, `dist/${filename}/style.css`)
        )
        .toString();

      expect(resultCSSFileContent).toMatchSnapshot();
    });
  });

  it(`shows missing CSS error for 'css'`, async () => {
    await expect(
      runner.rejectWithOutput(executeTest(workingDirectory, 'css-missing-css'))
    ).rejects.toContain(`Identifier "classB" is missing in corresponding CSS.`);
  });

  it(`shows unused CSS identifier warning for 'css'`, async () => {
    await expect(
      runner.resolveWithOutput(executeTest(workingDirectory, 'css-unused-css'))
    ).resolves.toContain(
      `Identifier "classB" is unused. Consider removing it from CSS.`
    );
  });
});
