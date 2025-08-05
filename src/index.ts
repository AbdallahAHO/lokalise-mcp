#!/usr/bin/env node
/**
 * Lokalise MCP Server Entry Point
 *
 * This is the main entry point for the Lokalise MCP server.
 * It handles both CLI and server modes with STDIO or HTTP transport.
 */

import { runCli } from "./cli/index.js";
import { setupErrorHandlers } from "./server/lifecycle.js";
import { getTransportMode, initializeServer } from "./server/server.js";
import { config } from "./shared/utils/config.util.js";
import { Logger } from "./shared/utils/logger.util.js";

const logger = Logger.forContext("index.ts");

/**
 * Determine if running in CLI mode
 */
function isCliMode(): boolean {
	const cliArgs = process.argv.slice(2);
	return cliArgs.length > 0 && !config.isMcpServerMode();
}

/**
 * Main entry point
 */
async function main(): Promise<void> {
	try {
		// Load configuration first
		config.load();

		logger.debug("Process arguments", {
			argv: process.argv,
			mcpServerMode: config.isMcpServerMode(),
			cwd: process.cwd(),
		});

		// Check if running in CLI mode
		if (isCliMode()) {
			const cliArgs = process.argv.slice(2);
			logger.info("CLI mode detected", { args: cliArgs });
			await runCli(cliArgs);
			return;
		}

		// Server mode - determine transport and start
		const mode = getTransportMode();
		logger.info(`Starting server with ${mode.toUpperCase()} transport`);
		await initializeServer(mode);
	} catch (error) {
		logger.error("Fatal error in main process", error);
		process.exit(1);
	}
}

/**
 * Check if this module is the main module
 */
function isMainModule(): boolean {
	return (
		import.meta.url === `file://${process.argv[1]}` ||
		import.meta.url.endsWith(process.argv[1]) ||
		process.argv[1].endsWith("index.js") ||
		process.argv[1].endsWith("dist/index.js")
	);
}

// Set up global error handlers
setupErrorHandlers();

// Run main if this is the entry point
if (isMainModule()) {
	main().catch((err) => {
		logger.error("Unhandled error in main process", err);
		process.exit(1);
	});
}

export type { ServerStartResult, TransportMode } from "./server/server.js";
// Export for testing and programmatic use
export { getTransportMode, initializeServer } from "./server/server.js";
