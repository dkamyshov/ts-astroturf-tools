module.exports = {
  preset: 'ts-jest',
  collectCoverage: true,
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/utils/constants.ts',
    '!src/utils/getSourceFile.ts',
  ],
};
