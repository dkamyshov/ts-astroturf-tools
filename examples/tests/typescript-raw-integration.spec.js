const path = require('path');
const runner = require('./runner');
const fs = require('fs');

jest.setTimeout(30000);

describe('typescript-raw', () => {
  const workingDirectory = path.resolve(__dirname, '../typescript-raw');

  beforeAll(async () => {
    await runner.run(workingDirectory, 'yarn', []);
  });

  const executeTest = async (workingDirectory, testName) => {
    return runner.run(workingDirectory, 'yarn', [
      'ttsc',
      `src/${testName}.tsx`,
    ]);
  };

  const basicSnapshotTests = [
    'xcss',
    'xcss-property-assignment',
    'xcss-local-interpolation',
    'xcss-property-assignment-local-interpolation',
    'styled-remote-interpolation',
    'xcss-remote-interpolation',
    'xcss-property-assignment-remote-interpolation',
  ];

  basicSnapshotTests.forEach(basicSnapshotTest => {
    it(`basic snapshot test - ${basicSnapshotTest}`, async () => {
      await executeTest(workingDirectory, basicSnapshotTest);

      const resultJSFileContent = fs
        .readFileSync(
          path.resolve(workingDirectory, `lib/${basicSnapshotTest}.js`)
        )
        .toString();

      expect(resultJSFileContent).toMatchSnapshot();
    });
  });
});
