/**
 * HTTP Transport Module
 * Handles HTTP-based MCP server communication with Express
 */

import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import cors from "cors";
import type { Request, Response } from "express";
import express, { type Express } from "express";
import { config } from "../../shared/utils/config.util.js";
import { VERSION } from "../../shared/utils/constants.util.js";
import { Logger } from "../../shared/utils/logger.util.js";

const logger = Logger.forContext("transports/http.transport.ts");

export interface HttpTransportConfig {
	port?: number;
	mcpEndpoint?: string;
}

/**
 * Parse Smithery base64-encoded config parameter
 * @param configParam Base64-encoded JSON configuration string
 * @returns Parsed configuration object or null if invalid
 */
function parseSmitheryConfig(
	configParam: string,
): Record<string, unknown> | null {
	try {
		// URL decode first (in case it's URL-encoded)
		const urlDecoded = decodeURIComponent(configParam);
		// Then base64 decode
		const jsonString = Buffer.from(urlDecoded, "base64").toString("utf-8");
		// Parse the JSON
		return JSON.parse(jsonString);
	} catch (error) {
		logger.error("Failed to parse Smithery config", error);
		return null;
	}
}

/**
 * Parse dot-notation query parameters into nested objects
 * e.g., "server.host" -> { server: { host: value } }
 */
function parseQueryConfig(
	query: Record<string, unknown>,
): Record<string, unknown> {
	const parsed: Record<string, unknown> = {};

	for (const [key, value] of Object.entries(query)) {
		// Skip the 'config' parameter as it's handled separately for Smithery
		if (key === "config") {
			continue;
		}

		const parts = key.split(".");
		let current = parsed;

		for (let i = 0; i < parts.length - 1; i++) {
			const part = parts[i];
			if (!(part in current)) {
				current[part] = {};
			}
			current = current[part] as Record<string, unknown>;
		}

		current[parts[parts.length - 1]] = value;
	}

	return parsed;
}

/**
 * Create Express app with MCP endpoint
 */
function createExpressApp(
	transport: StreamableHTTPServerTransport,
	mcpEndpoint: string,
): Express {
	const app = express();

	// Middleware
	app.use(cors());
	app.use(express.json());

	// Health check endpoint
	app.get("/", (_req: Request, res: Response) => {
		res.send(`Lokalise MCP Server v${VERSION} is running`);
	});

	// MCP endpoint
	app.all(mcpEndpoint, (req: Request, res: Response) => {
		// Extract query parameters for Smithery configuration
		const queryParams = req.query;

		// Check for Smithery base64-encoded config parameter first
		if (queryParams.config && typeof queryParams.config === "string") {
			logger.debug("Received Smithery config parameter", {
				configLength: queryParams.config.length,
			});

			// Parse the base64-encoded config
			const smitheryConfig = parseSmitheryConfig(queryParams.config);
			if (smitheryConfig) {
				// Set the Smithery configuration (highest priority)
				config.setSmitheryConfig(queryParams.config);

				// Force reload configuration to apply the Smithery config
				config.reload();

				logger.info("Configuration loaded from Smithery", {
					hasApiKey: !!smitheryConfig.LOKALISE_API_KEY,
					hostname: smitheryConfig.LOKALISE_API_HOSTNAME,
					debug: smitheryConfig.debug_mode,
				});
			}
		} else if (Object.keys(queryParams).length > 0) {
			// Fall back to regular query parameters if no Smithery config
			logger.debug("Received query parameters", {
				keys: Object.keys(queryParams),
			});

			// Parse and set configuration with high priority
			const parsedConfig = parseQueryConfig(queryParams);
			if (Object.keys(parsedConfig).length > 0) {
				config.setHttpQueryConfig(parsedConfig);

				// Force reload configuration to apply the HTTP query parameters
				config.reload();

				logger.info("Configuration reloaded with HTTP query parameters");
			}
		}

		// Handle MCP request
		transport.handleRequest(req, res, req.body).catch((err: unknown) => {
			logger.error("Error in transport.handleRequest", err);
			if (!res.headersSent) {
				res.status(500).json({
					error: "Internal Server Error",
				});
			}
		});
	});

	return app;
}

/**
 * Start Express server
 */
async function startExpressServer(app: Express, port: number): Promise<void> {
	return new Promise<void>((resolve, reject) => {
		const server = app.listen(port, () => {
			logger.info(`HTTP transport listening on http://localhost:${port}/mcp`);
			resolve();
		});

		server.on("error", (err) => {
			reject(err);
		});
	});
}

/**
 * Initialize and connect HTTP transport to MCP server
 */
export async function initializeHttpTransport(
	server: McpServer,
	transportConfig?: HttpTransportConfig,
): Promise<StreamableHTTPServerTransport> {
	logger.info("Initializing HTTP transport");

	const port = transportConfig?.port ?? config.getPort();
	const mcpEndpoint = transportConfig?.mcpEndpoint ?? "/mcp";

	const transport = new StreamableHTTPServerTransport({
		sessionIdGenerator: undefined,
	});

	try {
		// Connect transport to MCP server
		await server.connect(transport);

		// Create and start Express app
		const app = createExpressApp(transport, mcpEndpoint);
		await startExpressServer(app, port);

		return transport;
	} catch (error) {
		logger.error("Failed to start HTTP transport", error);
		throw new Error(`HTTP transport initialization failed: ${error}`);
	}
}
