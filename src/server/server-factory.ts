/**
 * MCP Server Factory
 * Creates and configures MCP server instances
 */

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { registerAllResources, registerAllTools } from "../domains/index.js";
import { registerAllPrompts } from "../prompts/index.js";
import { config } from "../shared/utils/config.util.js";
import { PACKAGE_NAME, VERSION } from "../shared/utils/constants.util.js";
import { Logger } from "../shared/utils/logger.util.js";

const logger = Logger.forContext("server/server-factory.ts");

/**
 * Create and configure a new MCP server instance
 */
export async function createMcpServer(): Promise<McpServer> {
	logger.info(`Creating Lokalise MCP server v${VERSION}`);

	// Create server instance
	const server = new McpServer({
		name: PACKAGE_NAME,
		version: VERSION,
		title: "Lokalise MCP Server",
	});

	// Set up MCP initialization handler to extract configuration
	setupMcpInitializationHandler(server);

	// Register all capabilities
	logger.info("Registering MCP tools, resources, and prompts...");
	await registerAllTools(server);
	await registerAllResources(server);
	await registerAllPrompts(server);

	logger.info("MCP server created and configured successfully");
	return server;
}

/**
 * Set up MCP initialization handler to extract configuration from clientInfo
 */
function setupMcpInitializationHandler(server: McpServer): void {
	const initLogger = Logger.forContext(
		"server-factory.ts",
		"setupMcpInitializationHandler",
	);

	// Store the original oninitialized callback
	const originalOnInitialized = server.server.oninitialized;

	// Set up a custom oninitialized callback to extract configuration
	server.server.oninitialized = () => {
		initLogger.debug("MCP initialization completed");

		// Try to extract configuration from the client info
		const clientVersion = server.server.getClientVersion();
		if (clientVersion && typeof clientVersion === "object") {
			// Look for configuration in clientInfo - Smithery typically passes config here
			const configData: Record<string, unknown> = {};

			// Extract all non-standard fields from clientInfo as potential config
			for (const [key, value] of Object.entries(clientVersion)) {
				if (!["name", "version", "title"].includes(key)) {
					configData[key] = value;
				}
			}

			// Also check for explicit config object
			if (
				"config" in clientVersion &&
				typeof clientVersion.config === "object" &&
				clientVersion.config
			) {
				Object.assign(configData, clientVersion.config);
			}

			if (Object.keys(configData).length > 0) {
				initLogger.info("Extracted configuration from MCP initialization", {
					configKeys: Object.keys(configData),
				});
				config.setMcpInitConfig(configData);
			}
		}

		// Call the original callback if it existed
		if (originalOnInitialized) {
			originalOnInitialized();
		}
	};
}
