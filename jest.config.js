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

  coveragePathIgnorePatterns: [
    "/node_modules/",
    "/lib/",
  ],

  coverageThreshold: {
    global: {
      branches: 78,
      functions: 73,
      lines: 82,
      statements: 83,
    },
  },
};
