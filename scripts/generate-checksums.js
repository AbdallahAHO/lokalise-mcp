#!/usr/bin/env node

/**
 * Generate SHA256 checksums for release artifacts
 * This script creates a checksums file for all files in a directory
 */

import { createHash } from "node:crypto";
import { readFileSync, writeFileSync, readdirSync, statSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Parse command line arguments
const args = process.argv.slice(2);
const targetDir = args[0] || join(dirname(__dirname), "release");
const outputFile = args[1] || "checksums.sha256";

console.log(`🔐 Generating checksums for files in: ${targetDir}`);

try {
	// Get all files in the target directory
	const files = readdirSync(targetDir)
		.filter((file) => {
			const filepath = join(targetDir, file);
			const stat = statSync(filepath);
			// Only process regular files, skip directories and the checksum file itself
			return stat.isFile() && file !== outputFile;
		})
		.sort();

	if (files.length === 0) {
		console.log("⚠️  No files found to generate checksums for");
		process.exit(0);
	}

	console.log(`📋 Found ${files.length} files to process`);

	// Generate checksums
	const checksums = [];
	for (const file of files) {
		const filepath = join(targetDir, file);
		const content = readFileSync(filepath);
		const hash = createHash("sha256").update(content).digest("hex");
		checksums.push(`${hash}  ${file}`);
		console.log(`✅ ${file}: ${hash}`);
	}

	// Write checksums file
	const outputPath = join(targetDir, outputFile);
	writeFileSync(outputPath, `${checksums.join("\n")}\n`);

	console.log(`\n✅ Checksums written to: ${outputPath}`);

	// Also generate a JSON version for programmatic use
	const jsonOutput = {
		generated: new Date().toISOString(),
		algorithm: "sha256",
		files: files.map((file, index) => {
			const [hash] = checksums[index].split("  ");
			return {
				name: file,
				sha256: hash,
				size: statSync(join(targetDir, file)).size,
			};
		}),
	};

	const jsonPath = join(targetDir, "checksums.json");
	writeFileSync(jsonPath, JSON.stringify(jsonOutput, null, 2));
	console.log(`✅ JSON checksums written to: ${jsonPath}`);
} catch (error) {
	console.error(`❌ Error generating checksums: ${error.message}`);
	process.exit(1);
}
