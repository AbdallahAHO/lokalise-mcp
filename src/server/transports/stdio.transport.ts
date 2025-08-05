/**
 * STDIO Transport Module
 * Handles STDIO-based MCP server communication
 */

import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { Logger } from "../../shared/utils/logger.util.js";

const logger = Logger.forContext("transports/stdio.transport.ts");

/**
 * Initialize and connect STDIO transport to MCP server
 */
export async function initializeStdioTransport(
	server: McpServer,
): Promise<StdioServerTransport> {
	logger.info("Initializing STDIO transport");

	const transport = new StdioServerTransport();

	try {
		await server.connect(transport);
		logger.info("MCP server started successfully on STDIO transport");
		return transport;
	} catch (error) {
		logger.error("Failed to start server on STDIO transport", error);
		throw new Error(`STDIO transport initialization failed: ${error}`);
	}
}
