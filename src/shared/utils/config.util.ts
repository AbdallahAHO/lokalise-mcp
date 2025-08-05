import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import dotenv from "dotenv";
import { Logger } from "./logger.util.js";

/**
 * Configuration loader that handles multiple sources with priority:
 * 1. MCP initialization config (from clientInfo)
 * 2. Direct ENV pass (process.env)
 * 3. .env file in project root
 * 4. Global config file at $HOME/.mcp/configs.json
 */
class ConfigLoader {
	private packageName: string;
	private configLoaded = false;
	private mcpInitConfig: Record<string, unknown> = {};

	/**
	 * Create a new ConfigLoader instance
	 * @param packageName The package name to use for global config lookup
	 */
	constructor(packageName: string) {
		this.packageName = packageName;
	}

	/**
	 * Set configuration from MCP initialization (highest priority)
	 * @param config Configuration object from MCP clientInfo
	 */
	setMcpInitConfig(config: Record<string, unknown>): void {
		const methodLogger = Logger.forContext(
			"utils/config.util.ts",
			"setMcpInitConfig",
		);

		this.mcpInitConfig = { ...config };
		methodLogger.debug("MCP initialization configuration set", {
			keysCount: Object.keys(config).length,
		});
	}

	/**
	 * Load configuration from all sources with proper priority
	 */
	load(): void {
		const methodLogger = Logger.forContext("utils/config.util.ts", "load");

		if (this.configLoaded) {
			methodLogger.debug("Configuration already loaded, skipping");
			return;
		}

		methodLogger.debug("Loading configuration...");

		// Priority 4: Load from global config file
		this.loadFromGlobalConfig();

		// Priority 3: Load from .env file
		this.loadFromEnvFile();

		// Priority 2: Direct ENV pass is already in process.env
		// No need to do anything as it already has highest priority

		// Priority 1: MCP init config is handled in get() method
		// No need to set process.env as it might conflict with existing values

		this.configLoaded = true;
		methodLogger.debug("Configuration loaded successfully");
	}

	/**
	 * Load configuration from .env file in project root
	 */
	private loadFromEnvFile(): void {
		const methodLogger = Logger.forContext(
			"utils/config.util.ts",
			"loadFromEnvFile",
		);

		try {
			const result = dotenv.config();
			if (result.error) {
				methodLogger.debug("No .env file found or error reading it");
				return;
			}
			methodLogger.debug("Loaded configuration from .env file");
		} catch (error) {
			methodLogger.error("Error loading .env file", error);
		}
	}

	/**
	 * Load configuration from global config file at $HOME/.mcp/configs.json
	 */
	private loadFromGlobalConfig(): void {
		const methodLogger = Logger.forContext(
			"utils/config.util.ts",
			"loadFromGlobalConfig",
		);

		try {
			const homedir = os.homedir();
			const globalConfigPath = path.join(homedir, ".mcp", "configs.json");

			if (!fs.existsSync(globalConfigPath)) {
				methodLogger.debug("Global config file not found");
				return;
			}

			const configContent = fs.readFileSync(globalConfigPath, "utf8");
			const config = JSON.parse(configContent);

			// Determine the potential keys for the current package
			const shortKey = "boilerplate"; // Project-specific short key
			const fullPackageName = this.packageName; // e.g., 'lokalise-mcp'
			const unscopedPackageName =
				fullPackageName.split("/")[1] || fullPackageName; // e.g., 'boilerplate-mcp-server'

			const potentialKeys = [shortKey, fullPackageName, unscopedPackageName];
			let foundConfigSection: {
				environments?: Record<string, unknown>;
			} | null = null;
			let usedKey: string | null = null;

			for (const key of potentialKeys) {
				if (
					config[key] &&
					typeof config[key] === "object" &&
					config[key].environments
				) {
					foundConfigSection = config[key];
					usedKey = key;
					methodLogger.debug(`Found configuration using key: ${key}`);
					break; // Stop once found
				}
			}

			if (!foundConfigSection || !foundConfigSection.environments) {
				methodLogger.debug(
					`No configuration found for ${this.packageName} using keys: ${potentialKeys.join(", ")}`,
				);
				return;
			}

			const environments = foundConfigSection.environments;
			for (const [key, value] of Object.entries(environments)) {
				// Only set if not already defined in process.env
				if (process.env[key] === undefined) {
					process.env[key] = String(value);
				}
			}

			methodLogger.debug(
				`Loaded configuration from global config file using key: ${usedKey}`,
			);
		} catch (error) {
			methodLogger.error("Error loading global config file", error);
		}
	}

	/**
	 * Get a configuration value
	 * @param key The configuration key
	 * @param defaultValue The default value if the key is not found
	 * @returns The configuration value or the default value
	 */
	get(key: string, defaultValue?: string): string | undefined {
		// Priority 1: MCP initialization config
		if (this.mcpInitConfig[key] !== undefined) {
			return String(this.mcpInitConfig[key]);
		}

		// Priority 2: Environment variables
		return process.env[key] || defaultValue;
	}

	/**
	 * Get the Lokalise hostname from the configuration
	 * @param defaultValue The default value if the key is not found
	 * @returns The Lokalise hostname or the default value
	 */
	getLokaliseHostname(defaultValue?: string): string | undefined {
		const value = this.get("LOKALISE_API_HOSTNAME");

		if (value === undefined) {
			return defaultValue;
		}

		try {
			const url = new URL(value);
			const hostname = url.hostname;
			const parts = hostname.split(".");

			// If we have more than 2 parts, include the first subdomain
			// api.stage.lokalise.cloud → stage.lokalise.cloud
			// api.lokalise.com → lokalise.com
			if (parts.length > 2) {
				return parts.slice(-3).join(".");
			}
			if (parts.length >= 2) {
				return parts.slice(-2).join(".");
			}
			return hostname;
		} catch {
			return defaultValue;
		}
	}

	/**
	 * Get a boolean configuration value
	 * @param key The configuration key
	 * @param defaultValue The default value if the key is not found
	 * @returns The boolean configuration value or the default value
	 */
	getBoolean(key: string, defaultValue = false): boolean {
		const value = this.get(key);
		if (value === undefined) {
			return defaultValue;
		}
		return value.toLowerCase() === "true";
	}
}

// Create and export a singleton instance with the package name from package.json
export const config = new ConfigLoader("lokalise-mcp");
