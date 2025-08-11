import { beforeEach, describe, expect, test } from "@jest/globals";
import { config } from "./config.util.js";

describe("ConfigLoader MCP Initialization", () => {
	beforeEach(() => {
		// Reset the config instance for each test
		// biome-ignore lint/suspicious/noExplicitAny: Needed for testing private properties
		(config as any).configLoaded = false;
		// biome-ignore lint/suspicious/noExplicitAny: Needed for testing private properties
		(config as any).mcpInitConfig = {};
		// biome-ignore lint/suspicious/noExplicitAny: Needed for testing private properties
		(config as any).httpQueryConfig = {};
		// biome-ignore lint/suspicious/noExplicitAny: Needed for testing private properties
		(config as any).smitheryConfig = null;
		// biome-ignore lint/suspicious/noExplicitAny: Needed for testing private properties
		(config as any).mergedConfig = {};

		// Clear any environment variables that might interfere
		delete process.env.TEST_KEY;
		delete process.env.LOKALISE_API_KEY;
		delete process.env.LOKALISE_API_HOSTNAME;
	});

	test("should prioritize MCP init config over environment variables", () => {
		// Set up environment variable
		process.env.TEST_KEY = "env_value";

		// Set up MCP init config (should have higher priority)
		config.setMcpInitConfig({ TEST_KEY: "mcp_value" });

		// Load config from all sources
		config.load();

		// MCP config should take precedence
		expect(config.get("TEST_KEY")).toBe("mcp_value");
	});

	test("should fall back to environment variables when MCP config is not set", () => {
		// Set up environment variable - use a key that's in the schema
		process.env.LOKALISE_API_HOSTNAME = "https://test.lokalise.com/api2/";

		// Don't set MCP config for this key
		config.setMcpInitConfig({});

		// Load config from all sources
		config.load();

		// Should fall back to environment variable
		expect(config.get("LOKALISE_API_HOSTNAME")).toBe(
			"https://test.lokalise.com/api2/",
		);
	});

	test("should return default value when key is not found in any source", () => {
		// Don't set the key anywhere
		config.setMcpInitConfig({});
		config.load();

		// Should return the default value
		expect(config.get("NONEXISTENT_KEY", "default_value")).toBe(
			"default_value",
		);
	});

	test("should handle boolean values from MCP config", () => {
		// Set up MCP init config with boolean-like values
		config.setMcpInitConfig({
			BOOL_TRUE: "true",
			BOOL_FALSE: "false",
			BOOL_INVALID: "invalid",
		});

		config.load();

		expect(config.getBoolean("BOOL_TRUE")).toBe(true);
		expect(config.getBoolean("BOOL_FALSE")).toBe(false);
		expect(config.getBoolean("BOOL_INVALID")).toBe(false);
	});

	test("should handle nested config object in MCP init", () => {
		// Simulate what Smithery might pass
		const mcpConfig = {
			LOKALISE_API_KEY: "test_api_key",
			LOKALISE_API_HOSTNAME: "https://api.example.com/api2/",
			DEBUG: "true",
		};

		config.setMcpInitConfig(mcpConfig);
		config.load();

		expect(config.get("LOKALISE_API_KEY")).toBe("test_api_key");
		expect(config.get("LOKALISE_API_HOSTNAME")).toBe(
			"https://api.example.com/api2/",
		);
		expect(config.getBoolean("DEBUG")).toBe(true);
	});

	test("should extract hostname correctly from MCP config", () => {
		config.setMcpInitConfig({
			LOKALISE_API_HOSTNAME: "https://api.stage.lokalise.cloud/api2/",
		});

		config.load();

		expect(config.getLokaliseHostname()).toBe("stage.lokalise.cloud");
	});
});
