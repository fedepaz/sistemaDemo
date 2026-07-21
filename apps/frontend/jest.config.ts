import type { Config } from "jest";
import nextJest from "next/jest";

process.env.NEXT_PUBLIC_API_URL = "http://localhost:3001";
const createJestConfig = nextJest({
  dir: "./",
});

const customJestConfig: Config = {
  testEnvironment: "jest-fixed-jsdom",
  testEnvironmentOptions: {
    customExportConditions: ["node", "node-addons"],
  },
  setupFilesAfterEnv: ["<rootDir>/jest.setup.ts"],
  testPathIgnorePatterns: ["<rootDir>/.next/", "<rootDir>/node_modules/", "<rootDir>/src/__tests__/setup.ts", "<rootDir>/postcss.config.test.mjs"],
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1",
  },
  collectCoverageFrom: [
    "src/**/*.{ts,tsx}",
    "!src/**/*.d.ts",
    "!src/**/*.stories.{ts,tsx}",
    "!src/mocks/**",
  ],
  coverageThreshold: {
    global: {
      branches: 60,
      functions: 80,
      lines: 70,
      statements: 70,
    },
  },
};

async function jestConfig(): Promise<Config> {
  const jestConfig = await createJestConfig(customJestConfig)();

  return {
    ...jestConfig,
    transformIgnorePatterns: [
      ...(jestConfig.transformIgnorePatterns?.filter(
        (pattern: string | RegExp) =>
          typeof pattern === "string" && !pattern.includes("node_modules"),
      ) ?? []),
    ],
  };
}

export default jestConfig;
