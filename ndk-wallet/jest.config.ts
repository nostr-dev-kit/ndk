import type { Config } from "jest";

const config: Config = {
    preset: "ts-jest",
    testEnvironment: "node",
    moduleNameMapper: {
        "^@nostr-dev-kit/ndk$": "<rootDir>/../ndk/src/index.ts",
        "^(\\.{1,2}/.*)\\.js$": "$1",
    },
    moduleDirectories: ["node_modules", "<rootDir>/../ndk/node_modules"],
    transform: {
        "^.+\\.tsx?$": ["ts-jest", { tsconfig: "<rootDir>/tsconfig.json" }],
    },
};

export default config;
