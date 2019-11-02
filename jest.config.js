module.exports = {
  preset: 'ts-jest',
  collectCoverage: true,
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/core/constants.ts', // variable declarations
    '!src/core/getSourceFile.ts', // too simple to be covered
    '!src/loader/cache.ts', // just a variable declaration
    '!src/transformer/index.ts', // covered by integration tests
    '!src/test-utils/**/*.ts', // test utils, not part of a codebase
    '!src/babel-plugin/index.ts', // covered by integration tests
  ],
};
