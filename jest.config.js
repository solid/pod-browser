/**
 * Copyright 2020 Inrupt Inc.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal in
 * the Software without restriction, including without limitation the rights to use,
 * copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the
 * Software, and to permit persons to whom the Software is furnished to do so,
 * subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED,
 * INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A
 * PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
 * HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
 * OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
 * SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

const tsConfig = require("./tsconfig.json");

module.exports = {
  // Automatically clear mock calls and instances between every test
  clearMocks: true,

  // The test environment that will be used for testing
  testEnvironment: "jsdom",
  setupFilesAfterEnv: ["<rootDir>jest/setupTests.js"],

  testPathIgnorePatterns: ["/node_modules/", "/__testUtils/"],

  transform: {
    "^.+\\.(js|jsx|ts|tsx)$": "ts-jest",
    "^.+\\.ttl$": "jest-raw-loader",
  },

  // ts config
  globals: {
    "ts-jest": {
      tsConfig: { ...tsConfig.compilerOptions, jsx: "react" },
    },
  },

  // Coverage configs
  collectCoverage: true,

  coveragePathIgnorePatterns: [
    "/node_modules/",
    "/__testUtils/",
    "styles.ts",
    "/src/windowHelpers",
  ],

  coverageThreshold: {
    global: {
      branches: 86,
      functions: 87,
      lines: 95,
      statements: 95,
    },
  },
};
