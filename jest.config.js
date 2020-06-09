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

  collectCoverage: true,

  coverageThreshold: {
    global: {
      branches: 66,
      functions: 52,
      lines: 70,
      statements: 70,
    },
  },
};
