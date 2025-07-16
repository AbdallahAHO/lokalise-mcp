export default {
	preset: "ts-jest/presets/default-esm",
	testEnvironment: "node",
	testMatch: ["**/src/**/*.test.ts"],
	collectCoverageFrom: ["src/**/*.ts", "!src/**/*.test.ts"],
	transform: {
		"^.+\\.tsx?$": [
			"ts-jest",
			{
				useESM: true,
			},
		],
	},
	moduleNameMapper: {
		"^(\\.{1,2}/.*)\\.js$": "$1",
	},
	extensionsToTreatAsEsm: [".ts"],
	transformIgnorePatterns: ["node_modules/(?!(@lokalise/node-api)/)"],
};
