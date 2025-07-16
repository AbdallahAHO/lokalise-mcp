#!/usr/bin/env node

/**
 * Shared utilities for domain scaffolding scripts
 */

import path from "path";
import { fileURLToPath } from "url";

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Path constants
export const PROJECT_ROOT = path.resolve(__dirname, "../../");
export const DOMAINS_DIR = path.join(PROJECT_ROOT, "src/domains");
export const TEMPLATES_DIR = path.join(PROJECT_ROOT, "scripts/templates");

/**
 * String transformation utilities
 */
export const stringUtils = {
	toPascalCase(str) {
		return str
			.split(/[-_\s]+/)
			.map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
			.join("");
	},

	toKebabCase(str) {
		return str
			.replace(/([a-z])([A-Z])/g, "$1-$2")
			.replace(/[\s_]+/g, "-")
			.toLowerCase();
	},

	toCamelCase(str) {
		const pascal = this.toPascalCase(str);
		return pascal.charAt(0).toLowerCase() + pascal.slice(1);
	},
};

/**
 * Template processing utilities
 */
export const templateUtils = {
	/**
	 * Process template content with replacements
	 */
	processTemplate(content, replacements) {
		let processed = content;

		for (const [key, value] of Object.entries(replacements)) {
			const regex = new RegExp(`{{${key}}}`, "g");
			processed = processed.replace(regex, value);
		}

		return processed;
	},

	/**
	 * Process conditional sections in templates
	 */
	processConditionalSections(content, conditions) {
		let processed = content;

		// First, find all conditional blocks in the template
		const ifBlockRegex = /{{#if:(\w+)}}([\s\S]*?){{\/if:\1}}/g;
		const unlessBlockRegex = /{{#unless:(\w+)}}([\s\S]*?){{\/unless:\1}}/g;

		// Process if blocks
		processed = processed.replace(ifBlockRegex, (match, condition, block) => {
			// If condition exists and is true, keep the block content
			// Otherwise, remove the entire block
			return conditions[condition] ? block : "";
		});

		// Process unless blocks
		processed = processed.replace(
			unlessBlockRegex,
			(match, condition, block) => {
				// If condition exists and is false (or doesn't exist), keep the block content
				// Otherwise, remove the entire block
				return !conditions[condition] ? block : "";
			},
		);

		return processed;
	},
};

/**
 * File generation utilities
 */
export const fileUtils = {
	/**
	 * Get all template replacements for a domain
	 */
	getTemplateReplacements(config) {
		const domainPascal = stringUtils.toPascalCase(config.name);
		const domainCamel = stringUtils.toCamelCase(config.name);
		const domainKebab = stringUtils.toKebabCase(config.name);

		return {
			domainName: config.name,
			domainNamePascal: domainPascal,
			domainNameCamel: domainCamel,
			domainNameKebab: domainKebab,
			domainDescription: config.description,
			apiEndpoint: config.apiEndpoint || `/${config.name}`,
			toolsCount: (config.tools || []).length,
			resourcesCount: (config.resources || []).length,
			cliCommandsCount: (config.cliCommands || []).length,
			date: new Date().toISOString().split("T")[0],
			...(config.customReplacements || {}),
		};
	},

	/**
	 * Get template conditions based on configuration
	 */
	getTemplateConditions(config) {
		const conditions = {};

		// Add tool conditions (templates use tool names directly)
		if (config.tools) {
			config.tools.forEach((tool) => {
				conditions[tool] = true;
			});
		}

		// Add resource conditions
		if (config.resources) {
			config.resources.forEach((resource) => {
				conditions[resource] = true;
			});
		}

		// Add any custom conditions
		Object.assign(conditions, config.customConditions || {});

		return conditions;
	},
};

/**
 * Validation utilities
 */
export const validationUtils = {
	/**
	 * Validate domain name
	 */
	validateDomainName(name) {
		if (!name || typeof name !== "string") {
			throw new Error("Domain name is required");
		}

		if (!/^[a-z][a-z0-9-]*$/.test(name)) {
			throw new Error(
				"Domain name must start with lowercase letter and contain only lowercase letters, numbers, and hyphens",
			);
		}

		return true;
	},

	/**
	 * Check if domain already exists
	 */
	async domainExists(domainName) {
		const fs = await import("fs/promises");
		const domainPath = path.join(DOMAINS_DIR, domainName);

		try {
			await fs.access(domainPath);
			return true;
		} catch {
			return false;
		}
	},
};

/**
 * Summary display utilities
 */
export const summaryUtils = {
	/**
	 * Format file list for display
	 */
	formatFileList(files, domainName) {
		return files
			.map((file) => `  - src/domains/${domainName}/${file}`)
			.join("\n");
	},

	/**
	 * Get summary statistics
	 */
	getStats(config) {
		const toolCount = config.tools?.length || 0;
		const resourceCount = config.resources?.length || 0;
		const cliCount = config.cliCommands?.length || 0;

		return {
			toolCount,
			resourceCount,
			cliCount,
			totalFiles: 8, // Standard domain structure
		};
	},

	/**
	 * Generate summary message
	 */
	generateSummary(config, files) {
		const stats = this.getStats(config);

		return `
Domain "${config.name}" scaffolded successfully!

Created files:
${this.formatFileList(files, config.name)}

Summary:
- ${stats.toolCount} MCP tools
- ${stats.resourceCount} MCP resources  
- ${stats.cliCount} CLI commands
- ${stats.totalFiles} total files

Next steps:
1. Update the service layer with actual Lokalise API calls
2. Customize the formatters for your specific needs
3. Add proper error handling and validation
4. Write tests for your new domain

Run the following to see your new CLI commands:
  npm run cli -- --help
`;
	},
};
