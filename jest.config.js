module.exports = {
  // Automatically clear mock calls and instances between every test
  clearMocks: true,

  // The test environment that will be used for testing
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>jest/setupTests.js'],

  testPathIgnorePatterns: [
    '/node_modules/',
    '/__testUtils/',
  ],

  collectCoverage: true,

  coveragePathIgnorePatterns: [
    "/node_modules/",
    "/__testUtils/",
    "styles.ts",
  ],

  coverageThreshold: {
    global: {
      branches: 90,
      functions: 94,
      lines: 95,
      statements: 95,
    },
  },
};
