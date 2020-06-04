module.exports = {
  env: {
    browser: true,
    es6: true,
  },

  // Airbnb base provides many style rules; it is then overridden by our current defaults
  // (jest, eslint, typescript, and finally prettier recommended configs.)
  extends: [
    "airbnb",
    "airbnb/hooks",
    "airbnb-base",
    "eslint:recommended",
    "plugin:jest/recommended",
    "plugin:jest/style",
    "plugin:@typescript-eslint/recommended",
    "plugin:prettier/recommended",
    "prettier/@typescript-eslint"
  ],

  // Set up es6 and typescript linting, and add lint rules for jest
  plugins: [
    "react",
    "@typescript-eslint",
    "jest",
    "prettier",
  ],

  // A few fixes for broken .eslint rules
  globals: {
    Atomics: "readonly",
    SharedArrayBuffer: "readonly",
  },

  parser: "@typescript-eslint/parser",

  // Load typescript rules to handle es6 and typescript
  parserOptions: {
    ecmaFeatures: {
      jsx: true,
    },
    project: "./tsconfig.json",
    ecmaVersion: 2018,
    sourceType: "module",
  },

  settings: {
    "import/resolver": {
      node: {
        extensions: [".js", ".ts", ".tsx"],
      },
    },
  },

  ignorePatterns: [
    '__mocks__',
    '__snapshots__',
  ],

  rules: {
    // Make everything work with .ts and .tsx as well
    "import/extensions": [2, {
      js: "never",
      ts: "never",
      tsx: "never",
    }],

    // Allow devDeps in test files
    "import/no-extraneous-dependencies": [0, {
      "devDependencies": ["**/*.test.ts", "**/*.test.tsx"],
    }],

    "prettier/prettier": "error",

    // Use .tsx for jsx files
    "react/jsx-filename-extension": [1, { "extensions": [".tsx"] }],

    // Import react by default via webpack config
    "react/react-in-jsx-scope": 0,

    // Order the properties of react components nicely
    "react/static-property-placement": [2, "static public field"],

    // Allow Nextjs <Link> tags to contain a href attribute
    "jsx-a11y/anchor-is-valid": ["error", {
      "components": ["Link"],
      "specialLink": ["hrefLeft", "hrefRight"],
      "aspects": ["invalidHref", "preferButton"]
    }],

    // Make everything work with .tsx as well as .ts
    "import/extensions": [2, {
      js: "never",
      ts: "never",
      tsx: "never",
    }],

    "@typescript-eslint/no-empty-function": [
      "error", { "allow": ["arrowFunctions"] }
    ]
  },
};
