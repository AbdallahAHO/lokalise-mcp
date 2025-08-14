#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

// Use dynamic import meta for ESM compatibility
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");
const binScript = path.join(rootDir, "bin", "lokalise-mcp.js");
const entryPoint = path.join(rootDir, "dist", "index.js");

try {
	// Make the bin script executable
	if (fs.existsSync(binScript)) {
		try {
			fs.chmodSync(binScript, 0o755);
		} catch (_err) {
			// Silently fail if chmod is not available (Windows, some containers)
		}
	}

	// Also make the dist entry point executable if it exists
	if (fs.existsSync(entryPoint)) {
		// Ensure the file is executable (cross-platform)
		const currentMode = fs.statSync(entryPoint).mode;
		// Check if executable bits are set (user, group, or other)
		// Mode constants differ slightly across platforms, checking broadly
		const isExecutable =
			currentMode & fs.constants.S_IXUSR ||
			currentMode & fs.constants.S_IXGRP ||
			currentMode & fs.constants.S_IXOTH;

		if (!isExecutable) {
			// Set permissions to 755 (rwxr-xr-x) if not executable
			fs.chmodSync(entryPoint, 0o755);
			console.log(`Made ${path.relative(rootDir, entryPoint)} executable`);
		} else {
			// console.log(`${path.relative(rootDir, entryPoint)} is already executable`);
		}
	} else {
		// console.warn(`${path.relative(rootDir, entryPoint)} not found, skipping chmod`);
	}
} catch (err) {
	console.warn(`Failed to set executable permissions: ${err.message}`);
	// We use '|| true' in package.json, so no need to exit here
}
