const path = require('path');
const runner = require('./runner');

jest.setTimeout(30000);

describe('typescript-raw', () => {
  const workingDirectory = path.resolve(
    __dirname,
    '../projects/integration-typescript-babel-library'
  );

  it('builds without errors', async () => {
    await expect(
      runner.resolveWithCode(
        runner.run(workingDirectory, 'yarn', ['--frozen-lockfile'])
      )
    ).resolves.toBe(0);
  });
});
