const nextJest = require("next/jest");

const createJestConfig = nextJest({
  dir: "./",
});

const customJestConfig = {
  setupFilesAfterEnv: ["<rootDir>/jest.setup.js"],
  testEnvironment: "jest-environment-jsdom",
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1",
  },
  transform: {
    "^.+\\.(js|jsx|ts|tsx)$": ["babel-jest", { presets: [["@babel/preset-env", { modules: false }]] }],
  },
  transformIgnorePatterns: ["/node_modules/(?!mongodb|bson)/"],
};

module.exports = createJestConfig(customJestConfig);
