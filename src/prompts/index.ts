import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { Logger } from "../shared/utils/logger.util.js";
import { registerPrompts } from "./prompts.js";

const logger = Logger.forContext("prompts/index.ts");

/**
 * Register all MCP prompts with the server
 * This is the main entry point for prompt registration
 */
export async function registerAllPrompts(server: McpServer): Promise<void> {
	const methodLogger = logger.forMethod("registerAllPrompts");
	methodLogger.info("Starting prompts registration");

	try {
		registerPrompts(server);
		methodLogger.info("Prompts registration completed successfully");
	} catch (error) {
		methodLogger.error("Failed to register prompts", { error });
		throw error;
	}
}

// Re-export prompt types for external use
export * from "./prompts.types.js";
