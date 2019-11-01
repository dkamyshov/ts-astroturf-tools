module.exports = {
  preset: 'ts-jest',
  collectCoverage: true,
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/core/constants.ts',
    '!src/core/getSourceFile.ts',
    '!src/loader/cache.ts',
    '!src/transformer/index.ts',
    '!src/test-utils/**/*.ts',
  ],
};
