#!/usr/bin/env node

/**
 * CLI Domain Scaffolding for Lokalise MCP
 *
 * Non-interactive version using shared scaffolding utilities
 */

import chalk from "chalk";
import { program } from "commander";
import { BaseScaffolder } from "./shared/base-scaffolder.js";

class CliScaffolder extends BaseScaffolder {
	constructor(options) {
		super();
		this.options = options;
	}

	/**
	 * Configure the domain from CLI arguments
	 */
	async configure() {
		// Basic configuration
		this.config.name = this.options.name;
		this.config.description = this.options.description;
		this.config.apiEndpoint =
			this.options.apiEndpoint || `/${this.options.name}`;

		// Parse tools
		this.config.tools = this.parseList(
			this.options.tools || "list,get,create,update,delete",
		);

		// Parse resources
		this.config.resources = this.parseList(this.options.resources || "");

		// Auto-add resources based on tools if not specified
		if (this.config.resources.length === 0) {
			if (this.config.tools.includes("list")) {
				this.config.resources.push("collection");
			}
			if (this.config.tools.includes("get")) {
				this.config.resources.push("detail");
			}
		}

		// Parse CLI commands
		this.config.cliCommands = this.parseList(
			this.options.cli || this.config.tools.join(","),
		);

		// Add custom tool support if needed
		if (this.options.customTools) {
			this.parseCustomTools(this.options.customTools);
		}

		// Add custom resource support if needed
		if (this.options.customResources) {
			this.parseCustomResources(this.options.customResources);
		}

		// Validate configuration
		this.validateCliConfig();
	}

	parseList(value) {
		if (!value || value === "none") return [];
		return value
			.split(",")
			.map((item) => item.trim())
			.filter(Boolean);
	}

	parseCustomTools(customTools) {
		const tools = customTools.split(",").map((t) => {
			const [name, description] = t.split(":");
			return {
				name: name.trim(),
				description: description?.trim() || `Custom ${name} operation`,
				custom: true,
			};
		});

		// Add to config
		this.config.customTools = tools;
		this.config.tools.push(...tools.map((t) => t.name));
	}

	parseCustomResources(customResources) {
		const resources = customResources.split(",").map((r) => {
			const [name, description] = r.split(":");
			return {
				name: name.trim(),
				description: description?.trim() || `Custom ${name} resource`,
				custom: true,
			};
		});

		// Add to config
		this.config.customResources = resources;
		this.config.resources.push(...resources.map((r) => r.name));
	}

	validateCliConfig() {
		const validTools = [
			"list",
			"get",
			"create",
			"update",
			"delete",
			"bulkUpdate",
			"bulkDelete",
		];

		const customToolNames = this.config.customTools?.map((t) => t.name) || [];
		const allValidTools = [...validTools, ...customToolNames];

		// Validate tools
		const invalidTools = this.config.tools.filter(
			(tool) => !allValidTools.includes(tool),
		);

		if (invalidTools.length > 0) {
			throw new Error(`Invalid tools: ${invalidTools.join(", ")}`);
		}

		// Validate resources
		const validResources = ["collection", "detail"];
		const customResourceNames =
			this.config.customResources?.map((r) => r.name) || [];
		const allValidResources = [...validResources, ...customResourceNames];

		const invalidResources = this.config.resources.filter(
			(resource) => !allValidResources.includes(resource),
		);

		if (invalidResources.length > 0) {
			throw new Error(`Invalid resources: ${invalidResources.join(", ")}`);
		}
	}

	/**
	 * Override display summary for CLI output
	 */
	displaySummary(generatedFiles) {
		if (this.options.quiet) {
			console.log(this.config.name);
		} else {
			console.log(chalk.green.bold("\n✅ Success!\n"));
			super.displaySummary(generatedFiles);
		}
	}
}

// Set up CLI
program
	.name("scaffold-domain-cli")
	.description("Generate a new Lokalise MCP domain structure")
	.version("1.0.0")
	.requiredOption("-n, --name <name>", "Domain name (lowercase)")
	.requiredOption("-d, --description <description>", "Domain description")
	.option("-a, --api-endpoint <endpoint>", "API endpoint (default: /<name>)")
	.option(
		"-t, --tools <tools>",
		"Comma-separated list of tools to generate (default: list,get,create,update,delete)",
	)
	.option(
		"-r, --resources <resources>",
		"Comma-separated list of resources (collection,detail)",
	)
	.option(
		"-c, --cli <commands>",
		"Comma-separated list of CLI commands to generate",
	)
	.option(
		"--custom-tools <tools>",
		'Custom tools in format "name:description,name2:description2"',
	)
	.option(
		"--custom-resources <resources>",
		'Custom resources in format "name:description,name2:description2"',
	)
	.option("-q, --quiet", "Quiet mode - only output domain name on success")
	.action(async (options) => {
		try {
			const scaffolder = new CliScaffolder(options);
			await scaffolder.run();
		} catch (error) {
			console.error(chalk.red("Error:"), error.message);
			process.exit(1);
		}
	});

// Parse arguments
program.parse();
