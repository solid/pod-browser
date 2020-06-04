module.exports = {
  // Automatically clear mock calls and instances between every test
  clearMocks: true,

  // The test environment that will be used for testing
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>jest/setupTests.js'],
  testPathIgnorePatterns: [
    '/lib/',
    '/node_modules/',
  ],
  /*
  transform: {
    '^.+\\.(ts|tsx)?$': 'ts-jest',
  },
  */
  collectCoverage: true,
  collectCoverageFrom: [
    'components/**/*',
    'src/**/*',
  ],
  coverageThreshold: {
    global: {
      branches: 55,
      functions: 53,
      lines: 62,
      statements: 62,
    },
  },
};
