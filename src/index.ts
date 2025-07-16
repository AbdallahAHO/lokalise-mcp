#!/usr/bin/env node
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import cors from "cors";
import type { Request, Response } from "express";
import express from "express";
import { runCli } from "./cli/index.js";
import { registerAllResources, registerAllTools } from "./domains/index.js";
import { registerAllPrompts } from "./prompts/index.js";
import { config } from "./shared/utils/config.util.js";
import { PACKAGE_NAME, VERSION } from "./shared/utils/constants.util.js";
import { Logger } from "./shared/utils/logger.util.js";

const logger = Logger.forContext("index.ts");

process.on("uncaughtException", (error) => {
	logger.error("Uncaught Exception:", error);
	process.exit(1);
});

process.on("unhandledRejection", (reason) => {
	logger.error("Unhandled Rejection:", reason);
	process.exit(1);
});

let serverInstance: McpServer | null = null;
let transportInstance:
	| StreamableHTTPServerTransport
	| StdioServerTransport
	| null = null;

/**
 * Start the MCP server with the specified transport mode
 */
export async function startServer(
	mode: "stdio" | "http" = "stdio",
): Promise<McpServer> {
	const serverLogger = Logger.forContext("index.ts", "startServer");

	try {
		config.load();

		if (config.getBoolean("DEBUG")) {
			serverLogger.debug("Debug mode enabled");
		}

		serverLogger.info(`Initializing Lokalise MCP server v${VERSION}`);

		serverInstance = new McpServer({
			name: PACKAGE_NAME,
			version: VERSION,
			title: "Lokalise MCP Server",
		});

		serverLogger.info("Registering MCP tools, resources, and prompts...");
		await registerAllTools(serverInstance);
		await registerAllResources(serverInstance);
		await registerAllPrompts(serverInstance);

		if (mode === "stdio") {
			serverLogger.info("Using STDIO transport");
			transportInstance = new StdioServerTransport();

			try {
				await serverInstance.connect(transportInstance);
				serverLogger.info("MCP server started successfully on STDIO transport");
				setupGracefulShutdown();
				return serverInstance;
			} catch (err) {
				serverLogger.error("Failed to start server on STDIO transport", err);
				process.exit(1);
			}
		} else {
			serverLogger.info("Using Streamable HTTP transport");
			const app = express();
			app.use(cors());
			app.use(express.json());

			const mcpEndpoint = "/mcp";
			const transport = new StreamableHTTPServerTransport({
				sessionIdGenerator: undefined,
			});

			await serverInstance.connect(transport);
			transportInstance = transport;

			app.all(mcpEndpoint, (req: Request, res: Response) => {
				transport.handleRequest(req, res, req.body).catch((err: unknown) => {
					serverLogger.error("Error in transport.handleRequest", err);
					if (!res.headersSent) {
						res.status(500).json({
							error: "Internal Server Error",
						});
					}
				});
			});

			app.get("/", (_req: Request, res: Response) => {
				res.send(`Lokalise MCP Server v${VERSION} is running`);
			});

			const PORT = Number(process.env.PORT ?? 3000);
			await new Promise<void>((resolve, reject) => {
				const server = app.listen(PORT, () => {
					serverLogger.info(
						`HTTP transport listening on http://localhost:${PORT}${mcpEndpoint}`,
					);
					resolve();
				});

				server.on("error", (err) => {
					reject(err);
				});
			});

			setupGracefulShutdown();
			return serverInstance;
		}
	} catch (error) {
		serverLogger.error("Error in startServer function", error);
		throw error;
	}
}

/**
 * Main entry point
 */
async function main() {
	const mainLogger = Logger.forContext("index.ts", "main");

	try {
		config.load();

		mainLogger.debug("Process arguments", {
			argv: process.argv,
			mcpServerMode: process.env.MCP_SERVER_MODE,
			cwd: process.cwd(),
		});

		// CLI mode - only if explicit command arguments are provided
		const cliArgs = process.argv.slice(2);
		if (cliArgs.length > 0 && !process.env.MCP_SERVER_MODE) {
			mainLogger.info("CLI mode detected", { args: cliArgs });
			await runCli(cliArgs);
			return;
		}

		// Server mode - determine transport
		const transportModeRaw = process.env.TRANSPORT_MODE;
		const transportMode = (transportModeRaw || "stdio").toLowerCase();

		let mode: "http" | "stdio";
		if (transportMode === "stdio") {
			mode = "stdio";
		} else if (transportMode === "http") {
			mode = "http";
		} else {
			mainLogger.warn(
				`Unknown TRANSPORT_MODE "${transportMode}", defaulting to stdio`,
			);
			mode = "stdio";
		}

		mainLogger.info(`Starting server with ${mode.toUpperCase()} transport`);
		await startServer(mode);
	} catch (error) {
		mainLogger.error("Error in main function", error);
		throw error;
	}
}

// Check if this module is the main module
const isMainModule =
	import.meta.url === `file://${process.argv[1]}` ||
	import.meta.url.endsWith(process.argv[1]) ||
	process.argv[1].endsWith("index.js") ||
	process.argv[1].endsWith("dist/index.js");

if (isMainModule) {
	main().catch((err) => {
		logger.error("Unhandled error in main process", err);
		process.exit(1);
	});
}

/**
 * Graceful shutdown handler
 */
function setupGracefulShutdown() {
	const shutdownLogger = Logger.forContext("index.ts", "shutdown");

	const shutdown = async () => {
		try {
			shutdownLogger.info("Shutting down gracefully...");

			if (
				transportInstance &&
				"close" in transportInstance &&
				typeof transportInstance.close === "function"
			) {
				await transportInstance.close();
			}

			if (serverInstance && typeof serverInstance.close === "function") {
				await serverInstance.close();
			}

			process.exit(0);
		} catch (err) {
			shutdownLogger.error("Error during shutdown", err);
			process.exit(1);
		}
	};

	["SIGINT", "SIGTERM"].forEach((signal) => {
		process.on(signal as NodeJS.Signals, () => {
			shutdown();
		});
	});
}
