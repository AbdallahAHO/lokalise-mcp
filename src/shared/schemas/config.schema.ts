/**
 * Configuration Schema
 * Strongly-typed configuration validation using Zod
 *
 * This schema defines all environment variables and configuration options
 * used by the Lokalise MCP server, sourced from:
 * - manifest.json (DXT package configuration)
 * - .env and .env.example files
 * - smithery.yaml (Smithery configuration)
 * - Runtime environment variables
 */

import { z } from "zod";

/**
 * Transport mode for the MCP server
 */
export const TransportModeSchema = z.enum(["stdio", "http"]).default("stdio");

/**
 * Node environment
 */
export const NodeEnvSchema = z
	.enum(["development", "test", "production"])
	.optional();

/**
 * HTTP Query Configuration Schema
 * Configuration that can be passed via HTTP query parameters (Smithery)
 */
export const HttpQueryConfigSchema = z
	.object({
		LOKALISE_API_KEY: z.string().optional(),
		LOKALISE_API_HOSTNAME: z.string().url().optional(),
		debug_mode: z.boolean().optional(),
	})
	.passthrough(); // Allow additional fields for future expansion

/**
 * Smithery Configuration Schema
 * Configuration passed via base64-encoded config parameter from Smithery
 */
export const SmitheryConfigSchema = z.object({
	LOKALISE_API_KEY: z.string(),
	LOKALISE_API_HOSTNAME: z
		.string()
		.url()
		.default("https://api.lokalise.com/api2/"),
	debug_mode: z.boolean().default(false),
});

/**
 * MCP Initialization Configuration Schema
 * Configuration passed during MCP client initialization
 */
export const McpInitConfigSchema = z
	.object({
		LOKALISE_API_KEY: z.string().optional(),
		LOKALISE_API_HOSTNAME: z.string().url().optional(),
		DEBUG: z.union([z.boolean(), z.string()]).optional(),
		debug_mode: z.boolean().optional(),
	})
	.passthrough();

/**
 * Main Runtime Configuration Schema
 * Complete configuration for the Lokalise MCP server
 */
export const RuntimeConfigSchema = z.object({
	// Core Lokalise Configuration (Required)
	LOKALISE_API_KEY: z
		.string()
		.min(1, "LOKALISE_API_KEY is required")
		.describe("Your Lokalise API token"),

	// Lokalise API Configuration (Optional)
	LOKALISE_API_HOSTNAME: z
		.string()
		.url()
		.default("https://api.lokalise.com/api2/")
		.describe("Custom Lokalise API endpoint for enterprise deployments"),

	// Server Configuration
	TRANSPORT_MODE: TransportModeSchema.describe(
		"Transport mode for MCP server: stdio or http",
	),

	PORT: z
		.number()
		.int()
		.min(1)
		.max(65535)
		.default(3000)
		.describe("HTTP server port (only used in http transport mode)"),

	// Debug and Development
	DEBUG: z
		.union([
			z.boolean(),
			z.string(), // Can be a pattern like "mcp:*" or "controllers/*"
		])
		.default(false)
		.describe("Debug mode or debug pattern for selective logging"),

	debug_mode: z
		.boolean()
		.default(false)
		.describe("Alternative debug flag (from manifest.json)"),

	// Environment and Runtime
	NODE_ENV: NodeEnvSchema.describe(
		"Node environment (development, test, production)",
	),

	MCP_SERVER_MODE: z
		.boolean()
		.default(false)
		.describe("Indicates if running as MCP server (vs CLI mode)"),

	JEST_WORKER_ID: z
		.string()
		.optional()
		.describe("Jest worker ID (present when running tests)"),
});

/**
 * Partial configuration for updates
 */
export const PartialRuntimeConfigSchema = RuntimeConfigSchema.partial();

/**
 * TypeScript types derived from schemas
 */
export type TransportMode = z.infer<typeof TransportModeSchema>;
export type NodeEnv = z.infer<typeof NodeEnvSchema>;
export type HttpQueryConfig = z.infer<typeof HttpQueryConfigSchema>;
export type SmitheryConfig = z.infer<typeof SmitheryConfigSchema>;
export type McpInitConfig = z.infer<typeof McpInitConfigSchema>;
export type RuntimeConfig = z.infer<typeof RuntimeConfigSchema>;
export type PartialRuntimeConfig = z.infer<typeof PartialRuntimeConfigSchema>;

/**
 * Configuration validation functions
 */

/**
 * Validate and parse runtime configuration
 */
export function validateRuntimeConfig(config: unknown): RuntimeConfig {
	return RuntimeConfigSchema.parse(config);
}

/**
 * Safely parse runtime configuration (returns result object)
 */
export function safeValidateRuntimeConfig(config: unknown) {
	return RuntimeConfigSchema.safeParse(config);
}

/**
 * Validate HTTP query configuration
 */
export function validateHttpQueryConfig(config: unknown): HttpQueryConfig {
	return HttpQueryConfigSchema.parse(config);
}

/**
 * Validate Smithery configuration
 */
export function validateSmitheryConfig(config: unknown): SmitheryConfig {
	return SmitheryConfigSchema.parse(config);
}

/**
 * Validate MCP initialization configuration
 */
export function validateMcpInitConfig(config: unknown): McpInitConfig {
	return McpInitConfigSchema.parse(config);
}

/**
 * Default configuration values
 */
export const DEFAULT_CONFIG: Partial<RuntimeConfig> = {
	LOKALISE_API_HOSTNAME: "https://api.lokalise.com/api2/",
	TRANSPORT_MODE: "stdio",
	PORT: 3000,
	DEBUG: false,
	debug_mode: false,
	MCP_SERVER_MODE: false,
};
