#!/usr/bin/env node

/**
 * Sign DXT packages using the DXT CLI
 * Supports both self-signed certificates (for development) and production certificates
 */

import { execSync } from "node:child_process";
import { existsSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, "..");

// Parse command line arguments
const args = process.argv.slice(2);
const dxtFile = args[0];
const _selfSigned = args.includes("--self-signed");
const production = args.includes("--production");
const verify = args.includes("--verify");

// Help text
if (!dxtFile || dxtFile === "--help" || dxtFile === "-h") {
	console.log(`
DXT Package Signing Tool

Usage: node sign-dxt.js <dxt-file> [options]

Arguments:
  dxt-file              Path to the .dxt file to sign

Options:
  --self-signed         Use self-signed certificate (default for development)
  --production          Use production certificates from environment/certs directory
  --verify              Verify signature after signing
  --help, -h            Show this help message

Environment Variables (for production signing):
  SIGNING_CERT_FILE     Path to production certificate (PEM format)
  SIGNING_KEY_FILE      Path to production private key (PEM format)
  SIGNING_INTERMEDIATE  Comma-separated paths to intermediate certificates

Examples:
  # Development signing with self-signed certificate
  node sign-dxt.js release/extension.dxt --self-signed

  # Production signing
  node sign-dxt.js release/extension.dxt --production

  # Sign and verify
  node sign-dxt.js release/extension.dxt --verify
`);
	process.exit(0);
}

console.log("🔏 DXT Package Signing Tool\n");

try {
	// Check if DXT CLI is available
	try {
		execSync("dxt --version", { stdio: "pipe" });
	} catch {
		console.error("❌ DXT CLI not found. Please install it first:");
		console.error("   npm install -g @anthropic-ai/dxt");
		process.exit(1);
	}

	// Verify DXT file exists
	if (!existsSync(dxtFile)) {
		throw new Error(`DXT file not found: ${dxtFile}`);
	}

	console.log(`📦 DXT file: ${dxtFile}`);

	// Determine signing mode
	const isProduction =
		production ||
		(process.env.SIGNING_CERT_FILE && process.env.SIGNING_KEY_FILE);

	if (isProduction) {
		// Production signing
		console.log("🏭 Using production certificates...\n");

		const certFile =
			process.env.SIGNING_CERT_FILE || join(rootDir, "certs/cert.pem");
		const keyFile =
			process.env.SIGNING_KEY_FILE || join(rootDir, "certs/key.pem");
		const intermediates =
			process.env.SIGNING_INTERMEDIATE?.split(",").map((p) => p.trim()) || [];

		// Check if certificates exist
		if (!existsSync(certFile)) {
			throw new Error(`Certificate not found: ${certFile}`);
		}
		if (!existsSync(keyFile)) {
			throw new Error(`Private key not found: ${keyFile}`);
		}

		console.log(`🔑 Certificate: ${certFile}`);
		console.log(`🔐 Private key: ${keyFile}`);
		if (intermediates.length > 0) {
			console.log(`🔗 Intermediates: ${intermediates.join(", ")}`);
		}

		// Build signing command
		let signCmd = `dxt sign "${dxtFile}" --cert "${certFile}" --key "${keyFile}"`;

		// Add intermediate certificates if provided
		if (intermediates.length > 0) {
			const validIntermediates = intermediates.filter((f) => existsSync(f));
			if (validIntermediates.length > 0) {
				signCmd += ` --intermediate ${validIntermediates.map((f) => `"${f}"`).join(" ")}`;
			}
		}

		// Execute signing
		console.log("\n📝 Signing DXT package...");
		execSync(signCmd, { stdio: "inherit" });
	} else {
		// Development signing with self-signed certificate
		console.log("🔧 Using self-signed certificate for development...\n");

		// Create certs directory if it doesn't exist
		const certsDir = join(rootDir, "certs");
		if (!existsSync(certsDir)) {
			mkdirSync(certsDir, { recursive: true });
		}

		// Sign with self-signed certificate
		console.log("📝 Signing DXT package with self-signed certificate...");
		execSync(`dxt sign "${dxtFile}" --self-signed`, {
			stdio: "inherit",
			cwd: certsDir, // Use certs directory as working directory
		});
	}

	console.log("\n✅ DXT package signed successfully!");

	// Display package info
	console.log("\n📋 Package Information:");
	execSync(`dxt info "${dxtFile}"`, { stdio: "inherit" });

	// Additional instructions
	if (!isProduction) {
		console.log(
			"\n⚠️  Note: This package is signed with a self-signed certificate.",
		);
		console.log("   For production distribution, use proper certificates:");
		console.log(
			"   - Set SIGNING_CERT_FILE and SIGNING_KEY_FILE environment variables",
		);
		console.log(
			"   - Or place certificates in certs/cert.pem and certs/key.pem",
		);
		console.log("   - Run with --production flag");
	}
} catch (error) {
	console.error(`\n❌ Error: ${error.message}`);

	// Provide helpful error messages
	if (error.message.includes("not found")) {
		console.error(
			"\n💡 Tip: Make sure the file path is correct and the file exists.",
		);
	} else if (error.message.includes("certificate")) {
		console.error(
			"\n💡 Tip: Check that your certificate files are in PEM format.",
		);
		console.error("   You can convert other formats using OpenSSL:");
		console.error("   openssl x509 -in cert.crt -out cert.pem -outform PEM");
	}

	process.exit(1);
}
