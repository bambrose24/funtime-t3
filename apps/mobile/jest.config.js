/** @type {import("jest").Config} */
module.exports = {
  preset: "jest-expo",
  roots: ["<rootDir>/tests"],
  setupFilesAfterEnv: ["<rootDir>/jest.setup.ts"],
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/$1",
    "^~/trpc/(.*)$": "<rootDir>/../../packages/api/trpc/$1",
    "^~/(.*)$": "<rootDir>/$1",
  },
  testPathIgnorePatterns: [
    "<rootDir>/node_modules/",
    "<rootDir>/dist-export-",
    "<rootDir>/.expo/",
  ],
  transformIgnorePatterns: [],
  collectCoverageFrom: [
    "<rootDir>/components/**/*.{ts,tsx}",
    "<rootDir>/lib/**/*.{ts,tsx}",
    "!<rootDir>/**/*.d.ts",
    "!<rootDir>/lib/trpc/**/*",
  ],
};
