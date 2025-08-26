import { resolve } from "node:path";
import { defineConfig } from "vitest/config";

export default defineConfig({
	test: {
		globals: true,
		environment: "node",
		setupFiles: ["./src/test-utils/setup.ts"],
		include: ["src/**/*.test.ts"],
		unstubGlobals: true,
		coverage: {
			provider: "v8",
			reporter: ["text", "json", "html"],
			exclude: [
				"node_modules/",
				"dist/",
				"**/*.test.ts",
				"src/test-utils/",
				"scripts/",
			],
		},
		clearMocks: true,
		restoreMocks: true,
		mockReset: true,
		// Support for snapshots
		snapshotFormat: {
			escapeString: false,
			printBasicPrototype: false,
		},
	},
	resolve: {
		alias: {
			"@": resolve(__dirname, "./src"),
		},
	},
});
