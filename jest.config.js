// jest.config.js — Guardian test configuration
export default {
  testEnvironment: 'node',
  transform: {},           // ESM modules — no transform needed
  testMatch: [
    '<rootDir>/tests/unit/**/*.test.js',
    '<rootDir>/tests/integration/**/*.test.js',
  ],
  collectCoverage: false,
  verbose: true,
};
