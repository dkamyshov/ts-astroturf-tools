const path = require('path');
const runner = require('./runner');
const fs = require('fs');

jest.setTimeout(30000);

describe('typescript-webpack', () => {
  const workingDirectory = path.resolve(__dirname, '../typescript-webpack');

  beforeAll(async () => {
    await runner.run(workingDirectory, 'yarn', []);
    await runner.run(workingDirectory, 'yarn', ['build-all']);
  });

  const executeTest = async (workingDirectory, testName) => {
    return runner.run(workingDirectory, 'yarn', [
      'webpack',
      `src/integration-tests-sources/${testName}.tsx`,
      '--config',
      'webpack.config.externals.js',
      '--output-path',
      `dist/${testName}`,
    ]);
  };

  const basicSnapshotTests = [
    'css',
    'styled',
    'xcss',
    'xcss-property-assignment',
    'css-local-interpolation',
    'styled-local-interpolation',
    'xcss-local-interpolation',
    'xcss-property-assignment-local-interpolation',
    'styled-remote-interpolation',
    'xcss-remote-interpolation',
    'xcss-property-assignment-remote-interpolation',
  ];

  basicSnapshotTests.forEach(basicSnapshotTest => {
    it(`basic snapshot test - ${basicSnapshotTest}`, async () => {
      const resultCssFileContent = fs
        .readFileSync(
          path.resolve(workingDirectory, `dist/${basicSnapshotTest}/style.css`)
        )
        .toString();

      expect(resultCssFileContent).toMatchSnapshot();
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
