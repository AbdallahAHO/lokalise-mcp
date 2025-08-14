#!/usr/bin/env node

/**
 * Lokalise MCP Server CLI Wrapper
 *
 * This wrapper ensures the MCP server runs correctly whether installed
 * globally, locally, or via npx.
 */

import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Path to the actual compiled entry point
const entryPoint = join(__dirname, "..", "dist", "index.js");

// Pass through all arguments and environment variables
const args = process.argv.slice(2);
const env = { ...process.env };

// Ensure MCP_SERVER_MODE is set if no arguments (server mode)
if (args.length === 0 && !env.MCP_SERVER_MODE) {
	env.MCP_SERVER_MODE = "true";
}

// Spawn the actual process
const child = spawn(process.execPath, [entryPoint, ...args], {
	env,
	stdio: "inherit",
});

// Forward the exit code
child.on("exit", (code) => {
	process.exit(code || 0);
});

// Handle errors
child.on("error", (err) => {
	console.error("Failed to start Lokalise MCP Server:", err);
	process.exit(1);
});
