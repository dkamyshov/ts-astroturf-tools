module.exports = {
  preset: 'ts-jest',
  collectCoverage: true,
  collectCoverageFrom: [
    '*.ts',
    'utils/*.ts',
    '!utils/constants.ts',
    '!utils/getSourceFile.ts',
  ],
};
