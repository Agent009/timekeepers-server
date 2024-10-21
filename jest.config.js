/** @returns {Promise<import('jest').Config>} */
module.exports = async () => {
  return {
    testEnvironment: "node",
    globals: {
      __DEV__: true,
    },
    // This option allows the use of a custom global setup module, which must export a function
    // (it can be sync or async). The function will be triggered once before all test suites and it will receive
    // two arguments: Jest's globalConfig and projectConfig.
    // globalSetup: "./__tests__/integ/setup.js",
    // globalTeardown: "./__tests__/integ/teardown.js",
    testMatch: ["**/__tests__/**/*test.js"],
    // testPathIgnorePatterns: ["/node_modules/", "__tests__/unit"],
    testPathIgnorePatterns: ["/node_modules/"],
    testTimeout: 5000,
    coverageReporters: ["lcov", "text"],
    collectCoverageFrom: ["**/*.{js,jsx}", "!**/node_modules/**", "!**/vendor/**"],
    coverageDirectory: "coverage",
    verbose: true,
  };
};
