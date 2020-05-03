const path = require('path');
const runner = require('./runner');

jest.setTimeout(30000);

describe('typescript-raw', () => {
  const workingDirectory = path.resolve(
    __dirname,
    '../projects/integration-javascript-babel'
  );

  beforeAll(async () => {
    await runner.run(workingDirectory, 'yarn', ['--frozen-lockfile']);
  });

  const executeTest = async (workingDirectory, testName) => {
    return runner.run(workingDirectory, 'yarn', [
      'babel',
      `src/${testName}.js`,
      '--out-dir',
      'dist',
    ]);
  };

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
