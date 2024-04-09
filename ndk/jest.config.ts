import type { Config } from "jest";

const config: Config = {
    preset: "ts-jest",
    verbose: true,
    expand: true,
    testEnvironment: "node",
    testTimeout: 10000,
    openHandlesTimeout: 4000,
    moduleNameMapper: {
        "^(\\.{1,2}/.*)\\.js$": "$1",
    },
};

export default config;
