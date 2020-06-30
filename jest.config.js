module.exports = {
  // Automatically clear mock calls and instances between every test
  clearMocks: true,

  // The test environment that will be used for testing
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>jest/setupTests.js'],

  testPathIgnorePatterns: [
    '/lib/',
    '/node_modules/',
    '/__testUtils/',
  ],

  collectCoverage: true,

  coveragePathIgnorePatterns: [
    "/node_modules/",
    "/lib/",
    '/__testUtils/',
  ],

  coverageThreshold: {
    global: {
      branches: 93,
      functions: 87,
      lines: 95,
      statements: 95,
    },
  },
};
