const path = require('path');
const runner = require('./runner');

jest.setTimeout(30000);

describe('integration tests', () => {
  describe('typescript-babel', () => {
    it('completes successfully and shows a warning', async () => {
      const workingDirectory = path.resolve(__dirname, '../typescript-babel');
      await expect(runner.run(workingDirectory, 'yarn', [])).resolves.toContain(
        `Identifier "classB" is unused.`
      );
    });
  });

  describe('typescript-webpack', () => {
    it('completes successfully and shows a warning', async () => {
      const workingDirectory = path.resolve(__dirname, '../typescript-webpack');
      await expect(runner.run(workingDirectory, 'yarn', [])).resolves.toContain(
        `Identifier "classB" is unused.`
      );
    });
  });
});
