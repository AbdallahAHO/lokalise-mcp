/**
 * Server Lifecycle Management
 * Handles graceful shutdown and cleanup
 */

import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import type { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { Logger } from "../shared/utils/logger.util.js";

const logger = Logger.forContext("server/lifecycle.ts");

type TransportInstance =
	| StreamableHTTPServerTransport
	| StdioServerTransport
	| null;

/**
 * Set up graceful shutdown handlers
 */
export function setupGracefulShutdown(
	serverInstance: McpServer | null,
	transportInstance: TransportInstance,
): void {
	const shutdown = async () => {
		try {
			logger.info("Shutting down gracefully...");

			// Close transport if available
			if (
				transportInstance &&
				"close" in transportInstance &&
				typeof transportInstance.close === "function"
			) {
				await transportInstance.close();
			}

			// Close server if available
			if (serverInstance && typeof serverInstance.close === "function") {
				await serverInstance.close();
			}

			process.exit(0);
		} catch (err) {
			logger.error("Error during shutdown", err);
			process.exit(1);
		}
	};

	// Register shutdown handlers
	["SIGINT", "SIGTERM"].forEach((signal) => {
		process.on(signal as NodeJS.Signals, () => {
			shutdown();
		});
	});
}

/**
 * Set up global error handlers
 */
export function setupErrorHandlers(): void {
	process.on("uncaughtException", (error) => {
		logger.error("Uncaught Exception:", error);
		process.exit(1);
	});

	process.on("unhandledRejection", (reason) => {
		logger.error("Unhandled Rejection:", reason);
		process.exit(1);
	});
}
