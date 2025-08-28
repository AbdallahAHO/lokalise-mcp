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
	port: number,
): Express {
	const app = express();

	// Middleware
	app.use(cors());
	app.use(express.json());

	// Health check endpoint
	app.get("/", (_req: Request, res: Response) => {
		res.type("html").send(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Lokalise MCP Server</title>
  <link rel="icon" type="image/png" sizes="96x96" href="https://static.lokalise.com/img/favicon/favicon-96x96.png">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: 'SF Mono', 'Monaco', 'Cascadia Code', 'Roboto Mono', Consolas, 'Courier New', monospace;
      background: linear-gradient(135deg, #0c0c0c 0%, #1a1a1a 100%);
      color: #e0e0e0;
      min-height: 100vh;
      padding: 2rem;
      line-height: 1.6;
    }
    .container {
      max-width: 800px;
      margin: 0 auto;
      background: rgba(0, 0, 0, 0.6);
      border-radius: 12px;
      border: 1px solid #333;
      backdrop-filter: blur(10px);
      overflow: hidden;
    }
    .header {
      background: linear-gradient(90deg, #00c851 0%, #00ff41 100%);
      color: #000;
      padding: 1.5rem 2rem;
      text-align: center;
    }
    .logo {
      font-size: 0.5rem;
      line-height: 1;
      color: #000;
      margin-bottom: 0.5rem;
      font-weight: 400;
      font-family: 'Courier New', monospace;
      letter-spacing: -0.05em;
      white-space: pre;
    }
    .title {
      font-size: 1.2rem;
      font-weight: 700;
      margin-top: 0.5rem;
    }
    .subtitle {
      font-size: 0.9rem;
      font-weight: 400;
      color: rgba(0, 0, 0, 0.8);
      margin: 0.5rem 0 1rem 0;
    }
    .badges {
      display: flex;
      justify-content: center;
      gap: 0.5rem;
      flex-wrap: wrap;
      margin-top: 0.5rem;
    }
    .badges img {
      height: 20px;
      border-radius: 3px;
      transition: transform 0.2s ease;
    }
    .badges img:hover {
      transform: translateY(-1px);
    }
    .content {
      padding: 2rem;
    }
    .section {
      margin-bottom: 2rem;
    }
    .section:last-child {
      margin-bottom: 0;
    }
    h3 {
      color: #00c851;
      font-size: 1rem;
      margin-bottom: 0.8rem;
      font-weight: 600;
    }
    .install-cmd {
      background: #1a1a1a;
      border: 1px solid #333;
      border-radius: 6px;
      padding: 0.8rem 1rem;
      font-family: inherit;
      color: #00ff41;
      font-size: 0.9rem;
      margin: 0.5rem 0;
      user-select: all;
      cursor: pointer;
      transition: all 0.2s ease;
    }
    .install-cmd:hover {
      background: #222;
      border-color: #00c851;
    }
    .code-block {
      background: #0f0f0f;
      border: 1px solid #2a2a2a;
      border-radius: 6px;
      padding: 1rem;
      font-size: 0.8rem;
      color: #b0b0b0;
      margin: 0.5rem 0;
      overflow-x: auto;
      font-family: 'SF Mono', 'Monaco', 'Cascadia Code', 'Roboto Mono', Consolas, 'Courier New', monospace;
      line-height: 1.4;
      white-space: pre;
    }
    .url {
      background: #1a1a1a;
      color: #00ff41;
      padding: 0.2rem 0.5rem;
      border-radius: 4px;
      user-select: all;
      cursor: pointer;
    }
    a {
      color: #00c851;
      text-decoration: none;
      transition: color 0.2s ease;
    }
    a:hover {
      color: #00ff41;
    }
    .steps {
      list-style: none;
      counter-reset: step-counter;
    }
    .steps li {
      counter-increment: step-counter;
      margin-bottom: 0.5rem;
      position: relative;
      padding-left: 2rem;
    }
    .steps li::before {
      content: counter(step-counter);
      position: absolute;
      left: 0;
      top: 0;
      background: #00c851;
      color: #000;
      width: 1.5rem;
      height: 1.5rem;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 0.7rem;
      font-weight: 600;
    }
    .grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 2rem;
      margin-top: 1rem;
    }
    @media (max-width: 768px) {
      body { padding: 1rem; }
      .grid { grid-template-columns: 1fr; gap: 1rem; }
      .header { padding: 1rem; }
      .content { padding: 1.5rem; }
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="logo">@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
@@@@@@@@@@@                        @@@@@@@@@@@
@@@@@@@@@@@                        @@@@@@@@@@@
@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
@@@@@@@@@@@                        @@@@@@@@@@@
@@@@@@@@@@@                        @@@@@@@@@@@
@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
@@@@@@@@@@@        @@@@@@@@        @@@@@@@@@@@
@@@@@@@@@@@          @@@@          @@@@@@@@@@@
@@@@@@@@@@@@@@@@@<           @@@@@@@@@@@@@@@@@
@@@@@@@@@@@@@@@@@@@        @@@@@@@@@@@@@@@@@@@
@@@@@@@@@@@@@@@@@@@@@    @@@@@@@@@@@@@@@@@@@@@
@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@</div>
      <div class="title">Lokalise MCP Server v${VERSION}</div>
      <div class="subtitle">Bring the power of Lokalise to your AI assistant</div>
      <div class="badges">
        <a href="https://smithery.ai/server/@AbdallahAHO/lokalise-mcp" target="_blank">
          <img src="https://smithery.ai/badge/@AbdallahAHO/lokalise-mcp" alt="Smithery Badge" />
        </a>
        <a href="https://www.npmjs.com/package/lokalise-mcp" target="_blank">
          <img src="https://img.shields.io/npm/v/lokalise-mcp" alt="NPM Version" />
        </a>
        <a href="https://opensource.org/licenses/MIT" target="_blank">
          <img src="https://img.shields.io/badge/License-MIT-blue.svg" alt="License: MIT" />
        </a>
        <a href="https://www.typescriptlang.org/" target="_blank">
          <img src="https://img.shields.io/badge/TypeScript-5.0%2B-blue" alt="TypeScript" />
        </a>
        <a href="https://nodejs.org/" target="_blank">
          <img src="https://img.shields.io/badge/Node.js-18%2B-green" alt="Node.js" />
        </a>
      </div>
    </div>

    <div class="content">
      <div class="section">
        <h3>🚀 Quick Install</h3>
        <div class="install-cmd">npx -y @smithery/cli install @AbdallahAHO/lokalise-mcp --client claude</div>
      </div>

      <div class="grid">
        <div class="section">
          <h3>🔧 Manual Setup</h3>
          <div class="code-block"><span style="color: #666;">{</span>
  <span style="color: #00c851;">"mcpServers"</span><span style="color: #666;">:</span> <span style="color: #666;">{</span>
    <span style="color: #00c851;">"lokalise"</span><span style="color: #666;">:</span> <span style="color: #666;">{</span>
      <span style="color: #00c851;">"command"</span><span style="color: #666;">:</span> <span style="color: #00ff41;">"npx"</span><span style="color: #666;">,</span>
      <span style="color: #00c851;">"args"</span><span style="color: #666;">:</span> <span style="color: #666;">[</span><span style="color: #00ff41;">"-y"</span><span style="color: #666;">,</span> <span style="color: #00ff41;">"lokalise-mcp"</span><span style="color: #666;">],</span>
      <span style="color: #00c851;">"env"</span><span style="color: #666;">:</span> <span style="color: #666;">{</span>
        <span style="color: #00c851;">"LOKALISE_API_KEY"</span><span style="color: #666;">:</span> <span style="color: #00ff41;">"your-api-key-here"</span>
      <span style="color: #666;">}</span>
    <span style="color: #666;">}</span>
  <span style="color: #666;">}</span>
<span style="color: #666;">}</span></div>
        </div>

        <div class="section">
          <h3>🌐 Direct Connection</h3>
          <p>Connect to: <span class="url">http://localhost:${port}/mcp</span></p>
          <p style="margin-top: 0.5rem; font-size: 0.85rem; color: #888;">Set PORT=${port} in environment</p>
        </div>
      </div>

      <div class="section">
        <h3>🔑 Get API Key</h3>
        <ol class="steps">
          <li>Login to <a href="https://app.lokalise.com" target="_blank">Lokalise</a></li>
          <li>Go to <a href="https://app.lokalise.com/profile#apitokens" target="_blank">Profile → API Tokens</a></li>
          <li>Click "Generate new token"</li>
          <li>Copy and configure securely</li>
        </ol>
      </div>

      <div class="section">
        <h3>✅ Test</h3>
        <p>Ask your AI assistant: <em>"Can you list my Lokalise projects?"</em></p>
        <p style="margin-top: 0.5rem;"><a href="https://github.com/AbdallahAHO/lokalise-mcp" target="_blank">Documentation</a> • <a href="https://smithery.ai/server/@AbdallahAHO/lokalise-mcp" target="_blank">Smithery</a></p>
      </div>
    </div>
  </div>
</body>
</html>`);
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
		const app = createExpressApp(transport, mcpEndpoint, port);
		await startExpressServer(app, port);

		return transport;
	} catch (error) {
		logger.error("Failed to start HTTP transport", error);
		throw new Error(`HTTP transport initialization failed: ${error}`);
	}
}
