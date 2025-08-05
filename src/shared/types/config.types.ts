/**
 * Configuration Types
 * TypeScript type definitions for configuration management
 *
 * These types are re-exported from the Zod schema for convenience
 * and to maintain a clear separation between schema validation and type usage
 */

export type {
	HttpQueryConfig,
	McpInitConfig,
	NodeEnv,
	PartialRuntimeConfig,
	RuntimeConfig,
	TransportMode,
} from "../schemas/config.schema.js";

// Import for use in this file
import type {
	NodeEnv,
	RuntimeConfig,
	TransportMode,
} from "../schemas/config.schema.js";

/**
 * Configuration source priority (highest to lowest)
 */
export enum ConfigPriority {
	HTTP_QUERY = 1, // HTTP query parameters (Smithery)
	MCP_INIT = 2, // MCP initialization config
	ENVIRONMENT = 3, // Process environment variables
	ENV_FILE = 4, // .env file
	GLOBAL_CONFIG = 5, // Global config file (~/.mcp/configs.json)
}

/**
 * Configuration source information
 */
export interface ConfigSource {
	priority: ConfigPriority;
	source: string;
	value: unknown;
}

/**
 * Debug configuration can be boolean or a pattern string
 */
export type DebugConfig = boolean | string;

/**
 * Configuration error types
 */
export class ConfigurationError extends Error {
	constructor(
		message: string,
		public readonly key?: string,
		public readonly source?: ConfigSource,
	) {
		super(message);
		this.name = "ConfigurationError";
	}
}

/**
 * Configuration validation result
 */
export interface ConfigValidationResult {
	valid: boolean;
	errors?: Array<{
		key: string;
		message: string;
		expected?: string;
		received?: unknown;
	}>;
	warnings?: Array<{
		key: string;
		message: string;
	}>;
}

/**
 * Configuration methods interface
 * Defines all typed getter methods for configuration values
 */
export interface IConfigLoader {
	// Core configuration
	load(): void;
	reload(): void;
	get(key: string, defaultValue?: string): string | undefined;
	getBoolean(key: string, defaultValue?: boolean): boolean;

	// Typed getters
	getLokaliseApiKey(): string;
	getLokaliseApiHostname(): string;
	getTransportMode(): TransportMode;
	getPort(): number;
	getDebugConfig(): DebugConfig;
	isDebugEnabled(): boolean;
	getDebugPattern(): string | undefined;
	isTestEnvironment(): boolean;
	isMcpServerMode(): boolean;
	getNodeEnv(): NodeEnv | undefined;

	// Configuration setters for different sources
	setHttpQueryConfig(config: Record<string, unknown>): void;
	setMcpInitConfig(config: Record<string, unknown>): void;

	// Validation
	validate(): ConfigValidationResult;
	getFullConfig(): RuntimeConfig;
}

/**
 * Helper type for configuration keys
 */
export type ConfigKey = keyof RuntimeConfig;

/**
 * Helper type for configuration values
 */
export type ConfigValue<K extends ConfigKey> = RuntimeConfig[K];
