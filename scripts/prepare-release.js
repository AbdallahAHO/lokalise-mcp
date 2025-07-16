#!/usr/bin/env node

/**
 * Prepare release assets including DXT package generation
 * This script is called by semantic-release during the prepare phase
 */

import { execSync } from "node:child_process";
import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, "..");
const releaseDir = join(rootDir, "release");

// Get version from command line or package.json
const version =
	process.argv[2] ||
	JSON.parse(readFileSync(join(rootDir, "package.json"), "utf8")).version;

console.log(`📦 Preparing release assets for version ${version}...`);

try {
	// Create release directory
	if (!existsSync(releaseDir)) {
		mkdirSync(releaseDir, { recursive: true });
		console.log("✅ Created release directory");
	}

	// Clean previous release files
	console.log("🧹 Cleaning previous release files...");
	execSync(`rm -f ${releaseDir}/*.dxt ${releaseDir}/*.sha256`, {
		cwd: rootDir,
	});

	// Ensure manifest.json has the correct version
	console.log("📝 Verifying manifest.json version...");
	const manifestPath = join(rootDir, "manifest.json");
	const manifest = JSON.parse(readFileSync(manifestPath, "utf8"));
	if (manifest.version !== version) {
		manifest.version = version;
		writeFileSync(manifestPath, JSON.stringify(manifest, null, "\t"));
		console.log(`✅ Updated manifest.json version to ${version}`);
	}

	// Build the DXT package
	console.log("🔨 Building DXT package...");
	try {
		// Check if @anthropic-ai/dxt is available
		execSync("npx @anthropic-ai/dxt --version", { stdio: "ignore" });

		// Run the DXT pack command
		execSync("npx @anthropic-ai/dxt pack", {
			cwd: rootDir,
			stdio: "inherit",
			env: { ...process.env, NODE_ENV: "production" },
		});

		// Move the generated DXT file to release directory
		const generatedDxtPath = join(rootDir, `lokalise-mcp-${version}.dxt`);
		const releaseDxtPath = join(releaseDir, `lokalise-mcp-${version}.dxt`);

		if (existsSync(generatedDxtPath)) {
			execSync(`mv "${generatedDxtPath}" "${releaseDxtPath}"`);
			console.log("✅ Moved DXT package to release directory");
		} else {
			// DXT might generate with a different name pattern
			const dxtFiles = execSync("ls *.dxt 2>/dev/null || true", {
				cwd: rootDir,
				encoding: "utf8",
			})
				.trim()
				.split("\n")
				.filter(Boolean);

			if (dxtFiles.length > 0) {
				const sourcePath = join(rootDir, dxtFiles[0]);
				execSync(`mv "${sourcePath}" "${releaseDxtPath}"`);
				console.log(
					`✅ Moved DXT package (${dxtFiles[0]}) to release directory`,
				);
			} else {
				throw new Error("No DXT file was generated");
			}
		}
	} catch (error) {
		console.error("❌ Error building DXT package:", error.message);
		console.log(
			"⚠️  Continuing without DXT package (it may need to be installed)",
		);
	}

	// Generate checksums for all release assets
	console.log("🔐 Generating checksums...");
	const checksums = [];

	// Add DXT checksum if it exists
	const dxtPath = join(releaseDir, `lokalise-mcp-${version}.dxt`);
	if (existsSync(dxtPath)) {
		const dxtContent = readFileSync(dxtPath);
		const dxtHash = createHash("sha256").update(dxtContent).digest("hex");
		checksums.push(`${dxtHash}  lokalise-mcp-${version}.dxt`);
	}

	// Add npm tarball checksum (if it exists from npm pack)
	const tarballPath = join(rootDir, `lokalise-mcp-${version}.tgz`);
	if (existsSync(tarballPath)) {
		const tarballContent = readFileSync(tarballPath);
		const tarballHash = createHash("sha256")
			.update(tarballContent)
			.digest("hex");
		checksums.push(`${tarballHash}  lokalise-mcp-${version}.tgz`);

		// Move tarball to release directory
		execSync(`mv "${tarballPath}" "${releaseDir}/"`);
		console.log("✅ Moved npm tarball to release directory");
	}

	// Write checksums file
	if (checksums.length > 0) {
		const checksumsPath = join(releaseDir, "checksums.sha256");
		writeFileSync(checksumsPath, `${checksums.join("\n")}\n`);
		console.log(`✅ Generated checksums for ${checksums.length} files`);
	}

	// Create a release summary
	const summaryPath = join(releaseDir, "release-summary.json");
	const summary = {
		version,
		date: new Date().toISOString(),
		assets: checksums.map((line) => {
			const [hash, filename] = line.split("  ");
			return { filename, sha256: hash };
		}),
		npm: {
			package: "lokalise-mcp",
			version,
			registry: "https://registry.npmjs.org/",
		},
		github: {
			repository: "AbdallahAHO/lokalise-mcp",
			tag: `v${version}`,
		},
	};
	writeFileSync(summaryPath, JSON.stringify(summary, null, 2));
	console.log("✅ Created release summary");

	console.log(
		`\n🎉 Release assets prepared successfully for version ${version}!`,
	);
	console.log(`📁 Release directory: ${releaseDir}`);

	// List generated files
	const files = execSync(`ls -la ${releaseDir}/`, { encoding: "utf8" });
	console.log("\n📋 Generated files:");
	console.log(files);
} catch (error) {
	console.error("\n❌ Error preparing release:", error.message);
	process.exit(1);
}
