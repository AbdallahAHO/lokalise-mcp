#!/usr/bin/env node

/**
 * Generate manifest.json with auto-discovered tools from the codebase
 * This script reads all domain tools and generates the tools array for the DXT manifest
 */

import { readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import chalk from "chalk";

// Get script directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = join(fileURLToPath(new URL(".", import.meta.url)));
const PROJECT_ROOT = join(__dirname, "..");

// Paths
const MANIFEST_PATH = join(PROJECT_ROOT, "manifest.json");
const MANIFEST_TEMPLATE_PATH = join(
	PROJECT_ROOT,
	"scripts/templates/manifest.template.json",
);
const DOMAINS_PATH = join(PROJECT_ROOT, "src/domains");
const PACKAGE_PATH = join(PROJECT_ROOT, "package.json");

/**
 * Extract tool registrations from a tool file
 */
async function extractToolsFromFile(filePath) {
	try {
		const content = await readFile(filePath, "utf-8");
		const tools = [];

		// Find all server.tool() calls and parse their arguments properly
		const toolCallRegex = /server\.tool\(\s*/g;
		let match;

		// biome-ignore lint/suspicious/noAssignInExpressions: Need to iterate through matches
		while ((match = toolCallRegex.exec(content)) !== null) {
			const startIndex = match.index + match[0].length;

			// Parse the first argument (tool name)
			const nameResult = parseStringLiteral(content, startIndex);
			if (!nameResult) continue;

			// Skip comma and whitespace
			let nextIndex = nameResult.endIndex;
			while (nextIndex < content.length && /[\s,]/.test(content[nextIndex])) {
				nextIndex++;
			}

			// Parse the second argument (description)
			const descResult = parseStringLiteral(content, nextIndex);
			if (!descResult) continue;

			tools.push({
				name: nameResult.value,
				description: descResult.value,
			});
		}

		return tools;
	} catch (error) {
		console.error(chalk.red(`Error reading ${filePath}:`), error.message);
		return [];
	}
}

/**
 * Parse a string literal from the given position, handling escape sequences properly
 */
function parseStringLiteral(content, startIndex) {
	if (startIndex >= content.length) return null;

	const quote = content[startIndex];
	if (quote !== '"' && quote !== "'" && quote !== "`") return null;

	let i = startIndex + 1;
	let value = "";

	while (i < content.length) {
		const char = content[i];

		if (char === quote) {
			// Found closing quote
			return { value, endIndex: i + 1 };
		}

		if (char === "\\") {
			// Handle escape sequence
			i++;
			if (i < content.length) {
				const escaped = content[i];
				switch (escaped) {
					case "n":
						value += "\n";
						break;
					case "t":
						value += "\t";
						break;
					case "r":
						value += "\r";
						break;
					case "\\":
						value += "\\";
						break;
					case '"':
						value += '"';
						break;
					case "'":
						value += "'";
						break;
					case "`":
						value += "`";
						break;
					default:
						value += escaped;
						break;
				}
			}
		} else {
			value += char;
		}

		i++;
	}

	// Unclosed string
	return null;
}

/**
 * Discover all domain tool files
 */
async function discoverToolFiles() {
	const { readdir } = await import("node:fs/promises");
	const toolFiles = [];

	try {
		// Read all domain directories
		const domains = await readdir(DOMAINS_PATH, { withFileTypes: true });

		for (const domain of domains) {
			if (domain.isDirectory() && !domain.name.startsWith(".")) {
				const domainPath = join(DOMAINS_PATH, domain.name);
				const files = await readdir(domainPath);

				// Find tool files
				const toolFile = files.find(
					(f) => f.endsWith(".tool.ts") || f.endsWith(".tool.js"),
				);
				if (toolFile) {
					toolFiles.push(join(domainPath, toolFile));
				}
			}
		}
	} catch (error) {
		console.error(chalk.red("Error discovering domains:"), error.message);
	}

	return toolFiles;
}

/**
 * Extract all prompts from the codebase (future enhancement)
 */
async function extractPrompts() {
	// TODO: Implement prompt extraction from domains
	// For now, return empty array or read from existing manifest
	try {
		const existingManifest = JSON.parse(await readFile(MANIFEST_PATH, "utf-8"));
		return existingManifest.prompts || [];
	} catch {
		return [];
	}
}

/**
 * Load package.json data
 */
async function loadPackageJson() {
	try {
		const content = await readFile(PACKAGE_PATH, "utf-8");
		return JSON.parse(content);
	} catch (error) {
		console.error(chalk.red("Error loading package.json:"), error.message);
		return {};
	}
}

/**
 * Load existing manifest or template
 */
async function loadManifestBase() {
	try {
		// Try to load existing manifest first
		const content = await readFile(MANIFEST_PATH, "utf-8");
		return JSON.parse(content);
	} catch {
		try {
			// Fall back to template
			const content = await readFile(MANIFEST_TEMPLATE_PATH, "utf-8");
			return JSON.parse(content);
		} catch {
			// Return minimal structure
			return {
				dxt_version: "0.1",
				name: "lokalise-mcp",
				display_name: "Lokalise MCP",
				description: "Lokalise integration for AI assistants",
			};
		}
	}
}

/**
 * Generate compelling long description based on available tools
 */
function generateLongDescription(tools, domainCounts) {
	// Count tools by operation type
	const operationCounts = {};
	tools.forEach((tool) => {
		const operation = tool.name.split("_").slice(-1)[0]; // Get last part (create, list, update, etc.)
		operationCounts[operation] = (operationCounts[operation] || 0) + 1;
	});

	// Calculate domain statistics
	const totalDomains = Object.keys(domainCounts).length;
	const totalTools = tools.length;

	// Build the description
	let description = `# Lokalise MCP Server

> **Disclaimer**: This is an independent project and not affiliated with Lokalise Inc. It uses the publicly available Lokalise Node.js SDK to provide MCP integration.

## Transform Your Localization Workflow with Conversational AI

**Stop clicking, start commanding.** With ${totalTools} intelligent tools across ${totalDomains} domains, this MCP server transforms Lokalise from a complex UI into your personal localization assistant. Simply describe what you need in natural language, and watch as your AI orchestrates sophisticated API workflows in seconds.

Instead of clicking through multiple screens, just chat with your AI assistant:
- *"Show me all projects with less than 80% translation progress"*
- *"Create a new mobile app project with German, French, and Spanish support"*
- *"Find all untranslated keys in the iOS app and assign them to the German team"*
- *"Archive all keys tagged 'v1_deprecated' across all projects"*

### ${totalTools} Production-Ready Tools Across ${totalDomains} Domains

`;

	// Group tools by actual domain (not operation)
	const actualDomainCounts = {};
	tools.forEach((tool) => {
		// Extract domain name from the tool name (e.g., lokalise_list_projects -> projects)
		const parts = tool.name.split("_");
		let domain = parts[parts.length - 1]; // Get last part as initial guess

		// Special cases where domain is in a different position
		if (tool.name.includes("_project_")) {
			domain = "projects";
		} else if (tool.name.includes("_key_") || tool.name.includes("_keys")) {
			domain = "keys";
		} else if (
			tool.name.includes("_language") ||
			tool.name.includes("_project_languages")
		) {
			domain = "languages";
		} else if (tool.name.includes("_task")) {
			domain = "tasks";
		} else if (tool.name.includes("_translation")) {
			domain = "translations";
		} else if (tool.name.includes("_contributor")) {
			domain = "contributors";
		} else if (tool.name.includes("_glossary")) {
			domain = "glossary";
		} else if (tool.name.includes("_comment")) {
			domain = "comments";
		}

		// Normalize plural to singular for consistency
		if (domain.endsWith("s") && domain !== "glossary") {
			const singular = domain.slice(0, -1);
			if (
				[
					"project",
					"key",
					"language",
					"task",
					"translation",
					"contributor",
					"comment",
				].includes(singular)
			) {
				// Keep plural for display
			}
		}

		actualDomainCounts[domain] = (actualDomainCounts[domain] || 0) + 1;
	});

	// Add domain breakdown
	const sortedDomains = Object.entries(actualDomainCounts)
		.sort((a, b) => b[1] - a[1])
		.slice(0, 8); // Show up to 8 domains

	sortedDomains.forEach(([domain, count]) => {
		const domainTitle = domain.charAt(0).toUpperCase() + domain.slice(1);
		description += `**${domainTitle} (${count} tools)** - `;

		// Add domain-specific value prop
		switch (domain) {
			case "projects":
				description +=
					"Complete project lifecycle management from creation to archival\n";
				break;
			case "keys":
				description +=
					"Intelligent key management with bulk operations and smart filtering\n";
				break;
			case "languages":
				description += "Multi-language orchestration with progress tracking\n";
				break;
			case "tasks":
				description += "Workflow automation and deadline management\n";
				break;
			case "translations":
				description += "Direct translation management with review workflows\n";
				break;
			case "contributors":
				description += "Team collaboration and permission management\n";
				break;
			case "glossary":
				description += "Terminology consistency and brand voice enforcement\n";
				break;
			case "comments":
				description += "Contextual discussions and translator guidance\n";
				break;
			default:
				description += `Comprehensive ${domain} management capabilities\n`;
		}
	});

	description += `
### Real-World Workflows That Save Hours

**For Localization Managers:**
- *Morning standup in 10 seconds*: "Give me the health check for all active projects. Who's behind schedule?"
- *Instant team scaling*: "Add marie@company.com as a French reviewer to all e-commerce projects"
- *Proactive monitoring*: "Alert me when any project drops below 70% completion"

**For Developers:**
- *Zero-friction deployment*: "Sync the feature/new-login branch to Lokalise and create tasks for Spanish and German"
- *Instant validation*: "Check if all keys in the Android app have iOS equivalents"
- *Automated QA*: "Find all keys with unbalanced brackets and create a cleanup task"

**For Marketing Teams:**
- *Campaign launch in one command*: "Create a project from this Google Doc, translate to our tier-1 markets, use informal tone"
- *Brand consistency*: "Add 'QuantumLeap' to the glossary as non-translatable across all projects"
- *Content updates*: "Update all homepage headlines with the new tagline across all languages"

**Traditional UI Workflow:**
- Navigate through multiple screens
- Click through complex forms
- Context switch between tools
- Time: 10-15 minutes per task

**Conversational MCP Workflow:**
- Express intent in natural language
- AI orchestrates API calls
- Results delivered instantly
- Time: 10-30 seconds per task


### Get Started in 30 Seconds

1. Install the MCP server
2. Add your Lokalise API token
3. Start commanding your localization workflow
`;

	return description;
}

/**
 * Generate the manifest
 */
async function generateManifest() {
	console.log(chalk.cyan.bold("\n🔧 Generating manifest.json...\n"));

	// Load base manifest
	const manifest = await loadManifestBase();

	// Load package.json for metadata
	const packageJson = await loadPackageJson();

	// Update version from package.json
	if (packageJson.version) {
		manifest.version = packageJson.version;
	}

	// Update author info
	if (packageJson.author) {
		manifest.author = packageJson.author;
	}

	// Update repository
	if (packageJson.repository) {
		manifest.repository = packageJson.repository;
	}

	// Preserve manually crafted display_name and description if they exist and are custom
	if (!manifest.display_name || manifest.display_name === "Lokalise MCP") {
		manifest.display_name = "Lokalise MCP";
	}

	if (
		!manifest.description ||
		manifest.description.includes("Manage 59 tools across 11 domains")
	) {
		manifest.description =
			"Transform Lokalise into your conversational AI assistant. Manage tools across domains with natural language - from project creation to translation workflows, team management to bulk operations. Stop clicking, start commanding.";
	}

	// Discover and extract tools
	console.log(chalk.yellow("📂 Discovering domain tools..."));
	const toolFiles = await discoverToolFiles();
	console.log(chalk.gray(`Found ${toolFiles.length} domain tool files`));

	const allTools = [];
	for (const file of toolFiles) {
		const domainName = file.split("/").slice(-2)[0];
		console.log(chalk.gray(`  - Extracting from ${domainName} domain...`));
		const tools = await extractToolsFromFile(file);
		allTools.push(...tools);
	}

	console.log(chalk.green(`✅ Extracted ${allTools.length} tools`));

	// Sort tools alphabetically
	allTools.sort((a, b) => a.name.localeCompare(b.name));

	// Calculate domain counts
	const domainCounts = {};
	for (const tool of allTools) {
		const domain = tool.name.split("_")[1]; // Extract domain from tool name
		domainCounts[domain] = (domainCounts[domain] || 0) + 1;
	}

	// Update manifest
	manifest.tools = allTools;
	manifest.tools_generated = true;

	// Only generate long description if it doesn't exist or is the old auto-generated format
	if (
		!manifest.long_description ||
		manifest.long_description.includes(
			"Transform Your Localization Workflow with Conversational AI",
		)
	) {
		console.log(chalk.yellow("📝 Generating long description..."));
		manifest.long_description = generateLongDescription(allTools, domainCounts);
	} else {
		console.log(chalk.gray("📝 Preserving existing long description..."));
	}

	// Extract prompts (if implemented)
	const prompts = await extractPrompts();
	if (prompts.length > 0) {
		manifest.prompts = prompts;
		manifest.prompts_generated = true; // Set to true when auto-generation is implemented
	}

	// Write the manifest
	const manifestContent = JSON.stringify(manifest, null, "\t");
	await writeFile(MANIFEST_PATH, manifestContent);

	console.log(
		chalk.green.bold(
			`\n✅ Generated manifest.json with ${allTools.length} tools\n`,
		),
	);

	// Display summary
	console.log(chalk.cyan("📋 Tool Summary:"));
	Object.entries(domainCounts).forEach(([domain, count]) => {
		console.log(chalk.gray(`  - ${domain}: ${count} tools`));
	});

	console.log(chalk.gray(`\nManifest saved to: ${MANIFEST_PATH}`));
}

/**
 * Validate the generated manifest against DXT schema
 */
async function validateManifest() {
	// TODO: Implement validation against DXT schema
	// For now, just check required fields
	try {
		const manifest = JSON.parse(await readFile(MANIFEST_PATH, "utf-8"));
		const required = [
			"dxt_version",
			"name",
			"version",
			"description",
			"author",
			"server",
		];
		const missing = required.filter((field) => !manifest[field]);

		if (missing.length > 0) {
			console.log(
				chalk.yellow(`\n⚠️  Missing required fields: ${missing.join(", ")}`),
			);
			return false;
		}

		console.log(chalk.green("\n✅ Manifest validation passed"));
		return true;
	} catch (error) {
		console.error(chalk.red("\n❌ Manifest validation failed:"), error.message);
		return false;
	}
}

// Main execution
async function main() {
	try {
		await generateManifest();
		await validateManifest();
	} catch (error) {
		console.error(chalk.red("\n❌ Error generating manifest:"), error.message);
		process.exit(1);
	}
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
	main();
}

export { generateManifest, validateManifest };
