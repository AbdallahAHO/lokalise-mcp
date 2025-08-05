/**
 * MCP Server Module
 * Main server orchestration and startup logic
 */

import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import type { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { config } from "../shared/utils/config.util.js";
import { Logger } from "../shared/utils/logger.util.js";
import { validateConfiguration } from "./config-validator.js";
import { setupGracefulShutdown } from "./lifecycle.js";
import { createMcpServer } from "./server-factory.js";
import {
	initializeHttpTransport,
	initializeStdioTransport,
} from "./transports/index.js";

const logger = Logger.forContext("server/server.ts");

export type TransportMode = "stdio" | "http";
export type TransportInstance =
	| StreamableHTTPServerTransport
	| StdioServerTransport;

export interface ServerStartResult {
	server: McpServer;
	transport: TransportInstance;
}

/**
 * Start the MCP server with the specified transport mode
 */
export async function startServer(
	mode: TransportMode = "stdio",
): Promise<ServerStartResult> {
	logger.info(`Starting MCP server with ${mode.toUpperCase()} transport`);

	// Check debug mode
	if (config.isDebugEnabled()) {
		logger.debug("Debug mode enabled", {
			pattern: config.getDebugPattern(),
		});
	}

	// Create and configure server
	const server = await createMcpServer();

	// Initialize transport based on mode
	let transport: TransportInstance;

	try {
		if (mode === "stdio") {
			transport = await initializeStdioTransport(server);
		} else {
			transport = await initializeHttpTransport(server);
		}

		// Set up graceful shutdown
		setupGracefulShutdown(server, transport);

		logger.info(
			`MCP server started successfully with ${mode.toUpperCase()} transport`,
		);
		return { server, transport };
	} catch (error) {
		logger.error(`Failed to start server with ${mode} transport`, error);
		// Attempt cleanup
		if (server && typeof server.close === "function") {
			await server.close().catch(() => {});
		}
		throw error;
	}
}

/**
 * Initialize and start the server with configuration validation
 */
export async function initializeServer(
	mode: TransportMode = "stdio",
): Promise<ServerStartResult> {
	// Load configuration
	config.load();
	logger.debug("Configuration loaded");

	// Validate configuration only for STDIO transport
	// HTTP transport will get configuration from query parameters on first request
	if (mode === "stdio") {
		const validation = await validateConfiguration();
		if (!validation.valid) {
			throw new Error(validation.error);
		}
	} else {
		logger.info(
			"Skipping API key validation for HTTP transport - will be provided via query params",
		);
	}

	// Start server
	return startServer(mode);
}

/**
 * Determine transport mode from configuration
 */
export function getTransportMode(): TransportMode {
	return config.getTransportMode();
}
