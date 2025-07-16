import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { Command } from "commander";
import { Logger } from "../shared/utils/logger.util.js";
import { domainRegistry } from "./registry.js";

const logger = Logger.forContext("domains/index.ts");

/**
 * Register all domain MCP tools with the server
 * This is the main entry point for tool registration
 */
export async function registerAllTools(server: McpServer): Promise<void> {
	const methodLogger = logger.forMethod("registerAllTools");
	methodLogger.info("Starting domain tools registration");

	try {
		await domainRegistry.registerAllTools(server);
		methodLogger.info("Domain tools registration completed successfully");
	} catch (error) {
		methodLogger.error("Failed to register domain tools", { error });
		throw error;
	}
}

/**
 * Register all domain CLI commands with the Commander program
 * This is the main entry point for CLI registration
 */
export async function registerAllCli(program: Command): Promise<void> {
	const methodLogger = logger.forMethod("registerAllCli");
	methodLogger.info("Starting domain CLI registration");

	try {
		await domainRegistry.registerAllCli(program);
		methodLogger.info("Domain CLI registration completed successfully");
	} catch (error) {
		methodLogger.error("Failed to register domain CLI", { error });
		throw error;
	}
}

/**
 * Register all domain MCP resources with the server
 * This is the main entry point for resource registration
 */
export async function registerAllResources(server: McpServer): Promise<void> {
	const methodLogger = logger.forMethod("registerAllResources");
	methodLogger.info("Starting domain resources registration");

	try {
		await domainRegistry.registerAllResources(server);
		methodLogger.info("Domain resources registration completed successfully");
	} catch (error) {
		methodLogger.error("Failed to register domain resources", { error });
		throw error;
	}
}

/**
 * Get domain registry status and health information
 * Useful for debugging and monitoring
 */
export function getDomainRegistryStatus() {
	return domainRegistry.getRegistryStatus();
}

/**
 * Discover all available domains
 * Can be used for diagnostics or dynamic domain listing
 */
export async function discoverDomains() {
	return domainRegistry.discoverDomains();
}

/**
 * Load a specific domain module
 * Useful for testing or selective domain loading
 */
export async function loadDomain(name: string) {
	return domainRegistry.loadDomain(name);
}

// Re-export types for consumers
export type {
	DomainCli,
	DomainDiscoveryResult,
	DomainMeta,
	DomainModule,
	DomainRegistryEntry,
	DomainResource,
	DomainTool,
} from "../shared/types/domain.types.js";

// Re-export the registry instance for advanced usage
export { domainRegistry } from "./registry.js";
