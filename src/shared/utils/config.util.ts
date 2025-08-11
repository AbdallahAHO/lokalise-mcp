import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import dotenv from "dotenv";
import type { ZodError } from "zod";
import {
	DEFAULT_CONFIG,
	type HttpQueryConfig,
	type McpInitConfig,
	type PartialRuntimeConfig,
	type RuntimeConfig,
	RuntimeConfigSchema,
	type SmitheryConfig,
	type TransportMode,
	validateHttpQueryConfig,
	validateMcpInitConfig,
	validateSmitheryConfig,
} from "../schemas/config.schema.js";
import type {
	ConfigValidationResult,
	DebugConfig,
	IConfigLoader,
	NodeEnv,
} from "../types/config.types.js";
import { Logger } from "./logger.util.js";

/**
 * Configuration loader that handles multiple sources with priority:
 * 1. HTTP query config (from Smithery query parameters)
 * 2. MCP initialization config (from clientInfo)
 * 3. Direct ENV pass (process.env)
 * 4. .env file in project root
 * 5. Global config file at $HOME/.mcp/configs.json
 *
 * This is the SINGLE ENTRY POINT for all configuration access in the application.
 * All files and modules should read environment variables through this utility,
 * not directly from process.env. All configuration access is strongly typed through Zod schemas.
 *
 * @example
 * import { config } from "./shared/utils/config.util.js";
 *
 * // Get typed configuration values
 * const apiKey = config.getLokaliseApiKey();
 * const transportMode = config.getTransportMode();
 * const isDebug = config.isDebugEnabled();
 */
class ConfigLoader implements IConfigLoader {
	private packageName: string;
	private configLoaded = false;
	private mcpInitConfig: McpInitConfig = {};
	private httpQueryConfig: HttpQueryConfig = {};
	private smitheryConfig: SmitheryConfig | null = null;
	private mergedConfig: PartialRuntimeConfig = {};

	/**
	 * Create a new ConfigLoader instance
	 * @param packageName The package name to use for global config lookup
	 */
	constructor(packageName: string) {
		this.packageName = packageName;
	}

	/**
	 * Set configuration from Smithery base64-encoded config parameter (highest priority)
	 * @param configBase64 Base64-encoded JSON configuration string
	 */
	setSmitheryConfig(configBase64: string): void {
		const methodLogger = Logger.forContext(
			"utils/config.util.ts",
			"setSmitheryConfig",
		);

		try {
			// Decode base64 and parse JSON
			const configJson = Buffer.from(configBase64, "base64").toString("utf-8");
			const config = JSON.parse(configJson);

			// Validate with Smithery schema
			this.smitheryConfig = validateSmitheryConfig(config);
			methodLogger.debug("Smithery configuration set", {
				keys: Object.keys(this.smitheryConfig),
			});
		} catch (error) {
			methodLogger.error("Invalid Smithery configuration", error);
			this.smitheryConfig = null;
		}
	}

	/**
	 * Set configuration from HTTP query parameters (second highest priority)
	 * @param config Configuration object from HTTP query parameters
	 */
	setHttpQueryConfig(config: Record<string, unknown>): void {
		const methodLogger = Logger.forContext(
			"utils/config.util.ts",
			"setHttpQueryConfig",
		);

		try {
			this.httpQueryConfig = validateHttpQueryConfig(config);
			methodLogger.debug("HTTP query parameter configuration set", {
				keysCount: Object.keys(config).length,
				keys: Object.keys(config),
			});
		} catch (error) {
			methodLogger.error("Invalid HTTP query configuration", error);
			this.httpQueryConfig = {};
		}
	}

	/**
	 * Set configuration from MCP initialization (second highest priority)
	 * @param config Configuration object from MCP clientInfo
	 */
	setMcpInitConfig(config: Record<string, unknown>): void {
		const methodLogger = Logger.forContext(
			"utils/config.util.ts",
			"setMcpInitConfig",
		);

		try {
			this.mcpInitConfig = validateMcpInitConfig(config);
			methodLogger.debug("MCP initialization configuration set", {
				keysCount: Object.keys(config).length,
			});
		} catch (error) {
			methodLogger.error("Invalid MCP init configuration", error);
			this.mcpInitConfig = {};
		}
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

		// Priority 5: Load from global config file
		this.loadFromGlobalConfig();

		// Priority 4: Load from .env file
		this.loadFromEnvFile();

		// Merge all configurations
		this.mergeConfigurations();

		this.configLoaded = true;
		methodLogger.debug("Configuration loaded successfully");
	}

	/**
	 * Force reload configuration from all sources.
	 * This is useful when configuration changes at runtime (e.g., from HTTP query params).
	 */
	reload(): void {
		const methodLogger = Logger.forContext("utils/config.util.ts", "reload");
		methodLogger.debug("Force reloading configuration...");

		// Reset the loaded flag to force a full reload
		this.configLoaded = false;

		// Clear existing merged config to start fresh
		this.mergedConfig = {};
		// Note: We don't clear smitheryConfig here as it should persist across reloads

		// Reload configuration
		this.load();

		// Reset the Lokalise API singleton to use new configuration
		// This import is done dynamically to avoid circular dependency at module load time
		import("./lokalise-api.util.js")
			.then(({ resetLokaliseApi }) => {
				if (resetLokaliseApi) {
					resetLokaliseApi();
					methodLogger.debug(
						"Reset Lokalise API client after configuration reload",
					);
				}
			})
			.catch((error) => {
				methodLogger.error("Failed to reset Lokalise API client", error);
			});
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
			const fullPackageName = this.packageName; // e.g., 'lokalise-mcp'
			const unscopedPackageName =
				fullPackageName.split("/")[1] || fullPackageName; // e.g., 'lokalise-mcp'

			const potentialKeys = [fullPackageName, unscopedPackageName];
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
	 * Merge configurations from all sources according to priority
	 */
	private mergeConfigurations(): void {
		const methodLogger = Logger.forContext(
			"utils/config.util.ts",
			"mergeConfigurations",
		);

		// Start with defaults
		this.mergedConfig = { ...DEFAULT_CONFIG };

		// Apply environment variables (priority 4)
		for (const key of Object.keys(RuntimeConfigSchema.shape)) {
			const envValue = process.env[key];
			if (envValue !== undefined) {
				// Special handling for different types
				if (key === "PORT") {
					const port = Number(envValue);
					if (!Number.isNaN(port)) {
						(this.mergedConfig as Record<string, unknown>)[key] = port;
					}
				} else if (key === "MCP_SERVER_MODE" || key === "debug_mode") {
					(this.mergedConfig as Record<string, unknown>)[key] =
						envValue === "true";
				} else if (key === "DEBUG") {
					// DEBUG can be boolean or string
					if (envValue === "true" || envValue === "false") {
						(this.mergedConfig as Record<string, unknown>)[key] =
							envValue === "true";
					} else {
						(this.mergedConfig as Record<string, unknown>)[key] = envValue;
					}
				} else {
					(this.mergedConfig as Record<string, unknown>)[key] = envValue;
				}
			}
		}

		// Apply MCP init config (priority 3)
		if (this.mcpInitConfig) {
			Object.assign(this.mergedConfig, this.mcpInitConfig);
			// Handle debug_mode alias for DEBUG
			if (this.mcpInitConfig.debug_mode !== undefined) {
				this.mergedConfig.DEBUG = this.mcpInitConfig.debug_mode;
			}
		}

		// Apply HTTP query config (priority 2)
		if (this.httpQueryConfig) {
			Object.assign(this.mergedConfig, this.httpQueryConfig);
			// Handle debug_mode alias for DEBUG
			if (this.httpQueryConfig.debug_mode !== undefined) {
				this.mergedConfig.DEBUG = this.httpQueryConfig.debug_mode;
			}
		}

		// Apply Smithery config (priority 1 - highest)
		if (this.smitheryConfig) {
			Object.assign(this.mergedConfig, this.smitheryConfig);
			// Handle debug_mode alias for DEBUG
			if (this.smitheryConfig.debug_mode !== undefined) {
				this.mergedConfig.DEBUG = this.smitheryConfig.debug_mode;
			}
		}

		methodLogger.debug("Configuration merged", {
			keys: Object.keys(this.mergedConfig),
			hasSmitheryConfig: this.smitheryConfig !== null,
		});
	}

	/**
	 * Get a configuration value
	 * @param key The configuration key
	 * @param defaultValue The default value if the key is not found
	 * @returns The configuration value or the default value
	 */
	get(key: string, defaultValue?: string): string | undefined {
		// Ensure configuration is loaded
		if (!this.configLoaded) {
			this.load();
		}

		const value = this.mergedConfig[key as keyof PartialRuntimeConfig];
		if (value !== undefined) {
			return String(value);
		}
		return defaultValue;
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
		return value.toLowerCase() === "true" || value === "1";
	}

	/**
	 * Get the Lokalise API key (required)
	 * @throws ConfigurationError if not set
	 */
	getLokaliseApiKey(): string {
		const apiKey = this.get("LOKALISE_API_KEY");
		if (!apiKey) {
			throw new Error(
				"LOKALISE_API_KEY is required but not found in configuration",
			);
		}
		return apiKey;
	}

	/**
	 * Get the Lokalise API hostname with default
	 */
	getLokaliseApiHostname(): string {
		return (
			this.get("LOKALISE_API_HOSTNAME") ||
			DEFAULT_CONFIG.LOKALISE_API_HOSTNAME ||
			"https://api.lokalise.com/api2/"
		);
	}

	/**
	 * Get the transport mode
	 */
	getTransportMode(): TransportMode {
		const mode = (this.get("TRANSPORT_MODE") || "stdio").toLowerCase();
		if (mode === "http") {
			return "http";
		}
		return "stdio";
	}

	/**
	 * Get the server port
	 */
	getPort(): number {
		const port = this.get("PORT");
		if (port) {
			const parsed = Number(port);
			if (!Number.isNaN(parsed) && parsed > 0 && parsed < 65536) {
				return parsed;
			}
		}
		const defaultPort = DEFAULT_CONFIG.PORT;
		return defaultPort !== undefined ? defaultPort : 3000;
	}

	/**
	 * Get debug configuration (can be boolean or pattern string)
	 */
	getDebugConfig(): DebugConfig {
		const debug = this.get("DEBUG");
		if (debug === undefined || debug === "false" || debug === "0") {
			return false;
		}
		if (debug === "true" || debug === "1") {
			return true;
		}
		// Return as pattern string
		return debug;
	}

	/**
	 * Check if debug is enabled
	 */
	isDebugEnabled(): boolean {
		const debug = this.getDebugConfig();
		return debug === true || (typeof debug === "string" && debug.length > 0);
	}

	/**
	 * Get debug pattern if debug is a string pattern
	 */
	getDebugPattern(): string | undefined {
		const debug = this.getDebugConfig();
		if (typeof debug === "string") {
			return debug;
		}
		if (debug === true) {
			return "*"; // Match all when debug is true
		}
		return undefined;
	}

	/**
	 * Check if running in test environment
	 */
	isTestEnvironment(): boolean {
		return (
			this.get("NODE_ENV") === "test" ||
			this.get("JEST_WORKER_ID") !== undefined
		);
	}

	/**
	 * Check if running in MCP server mode
	 */
	isMcpServerMode(): boolean {
		return this.getBoolean("MCP_SERVER_MODE", false);
	}

	/**
	 * Get the Node environment
	 */
	getNodeEnv(): NodeEnv | undefined {
		const env = this.get("NODE_ENV");
		if (env === "development" || env === "test" || env === "production") {
			return env as NodeEnv;
		}
		return undefined;
	}

	/**
	 * Validate the current configuration
	 */
	validate(): ConfigValidationResult {
		const methodLogger = Logger.forContext("utils/config.util.ts", "validate");

		try {
			// Ensure configuration is loaded
			if (!this.configLoaded) {
				this.load();
			}

			// Validate with Zod schema
			RuntimeConfigSchema.parse(this.mergedConfig);

			methodLogger.debug("Configuration validation successful");
			return { valid: true };
		} catch (error) {
			if (error instanceof Error && "errors" in error) {
				const zodError = error as ZodError;
				const errors = zodError.errors.map((err) => ({
					key: err.path.join("."),
					message: err.message,
				}));

				methodLogger.error("Configuration validation failed", { errors });
				return { valid: false, errors };
			}

			methodLogger.error("Unexpected validation error", error);
			return {
				valid: false,
				errors: [{ key: "unknown", message: String(error) }],
			};
		}
	}

	/**
	 * Get the full validated configuration object
	 */
	getFullConfig(): RuntimeConfig {
		// Ensure configuration is loaded
		if (!this.configLoaded) {
			this.load();
		}

		// Return validated config, will throw if invalid
		return RuntimeConfigSchema.parse(this.mergedConfig);
	}

	/**
	 * Get the Lokalise hostname from the configuration (legacy method)
	 * @param defaultValue The default value if the key is not found
	 * @returns The Lokalise hostname or the default value
	 * @deprecated Use getLokaliseApiHostname() instead
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
}

// Create and export a singleton instance with the package name from package.json
export const config = new ConfigLoader("lokalise-mcp");
