import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { Command } from "commander";

/**
 * Domain metadata interface for standardized domain information
 */
export interface DomainMeta {
	name: string;
	description: string;
	version: string;
	toolsCount?: number;
	cliCommandsCount?: number;
	resourcesCount?: number;
}

/**
 * Domain tool interface that all domain tool modules must implement
 */
export interface DomainTool {
	/**
	 * Register all MCP tools for this domain with the server
	 * @param server The MCP server instance to register tools with
	 */
	registerTools(server: McpServer): void;

	/**
	 * Get metadata about this domain's tools
	 */
	getMeta?(): DomainMeta;
}

/**
 * Domain CLI interface that all domain CLI modules must implement
 */
export interface DomainCli {
	/**
	 * Register all CLI commands for this domain with the program
	 * @param program The Commander program instance to register commands with
	 */
	register(program: Command): void;

	/**
	 * Get metadata about this domain's CLI commands
	 */
	getMeta?(): DomainMeta;
}

/**
 * Domain resource interface that all domain resource modules must implement
 */
export interface DomainResource {
	/**
	 * Register all MCP resources for this domain with the server
	 * @param server The MCP server instance to register resources with
	 */
	registerResources(server: McpServer): void;

	/**
	 * Get metadata about this domain's resources
	 */
	getMeta?(): DomainMeta;
}

/**
 * Complete domain module interface that includes tools, CLI, and resources
 */
export interface DomainModule {
	tool?: DomainTool;
	cli?: DomainCli;
	resource?: DomainResource;
	meta?: DomainMeta;
}

/**
 * Domain registry entry for tracking loaded domains
 */
export interface DomainRegistryEntry {
	name: string;
	path: string;
	module: DomainModule;
	loaded: boolean;
	error?: string;
}

/**
 * Domain discovery result for auto-discovery process
 */
export interface DomainDiscoveryResult {
	name: string;
	path: string;
	hasTools: boolean;
	hasCli: boolean;
	hasResources: boolean;
	isValid: boolean;
	error?: string;
}
