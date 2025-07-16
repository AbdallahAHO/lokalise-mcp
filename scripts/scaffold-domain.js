#!/usr/bin/env node

/**
 * Interactive Domain Scaffolding Wizard for Lokalise MCP
 *
 * Uses the shared scaffolding utilities for consistency
 */

import chalk from "chalk";
import inquirer from "inquirer";
import { BaseScaffolder } from "./shared/base-scaffolder.js";

class InteractiveScaffolder extends BaseScaffolder {
	/**
	 * Configure the domain through interactive prompts
	 */
	async configure() {
		console.log(
			chalk.cyan.bold("\n🏗️  Lokalise MCP Domain Scaffolding Wizard\n"),
		);
		console.log(
			chalk.gray(
				"This wizard will generate a complete domain structure following all conventions.\n",
			),
		);

		// Basic domain information
		await this.gatherDomainInfo();

		// Tool selection
		await this.selectTools();

		// Resource selection
		await this.selectResources();

		// CLI command selection
		await this.selectCliCommands();

		// Confirm configuration
		await this.confirmConfiguration();
	}

	async gatherDomainInfo() {
		const answers = await inquirer.prompt([
			{
				type: "input",
				name: "name",
				message: 'Domain name (lowercase, e.g., "translations"):',
				validate: (input) => {
					if (!input) return "Domain name is required";
					if (!/^[a-z][a-z0-9-]*$/.test(input)) {
						return "Must start with lowercase letter and contain only lowercase letters, numbers, and hyphens";
					}
					return true;
				},
			},
			{
				type: "input",
				name: "description",
				message: "Domain description:",
				validate: (input) => (input ? true : "Description is required"),
			},
			{
				type: "input",
				name: "apiEndpoint",
				message:
					'Lokalise API endpoint (e.g., "/translations" or press Enter for default):',
				default: (answers) => `/${answers.name}`,
			},
		]);

		Object.assign(this.config, answers);
	}

	async selectTools() {
		console.log(chalk.yellow("\n🔧 Tool Selection"));
		console.log(chalk.gray("Select which MCP tools to generate:\n"));

		const { tools } = await inquirer.prompt([
			{
				type: "checkbox",
				name: "tools",
				message: "Select tools to include:",
				choices: [
					{ name: "List (paginated listing)", value: "list", checked: true },
					{ name: "Get (single item details)", value: "get", checked: true },
					{ name: "Create (add new items)", value: "create", checked: true },
					{
						name: "Update (modify single item)",
						value: "update",
						checked: true,
					},
					{
						name: "Delete (remove single item)",
						value: "delete",
						checked: true,
					},
					{ name: "Bulk Update (modify multiple)", value: "bulkUpdate" },
					{ name: "Bulk Delete (remove multiple)", value: "bulkDelete" },
				],
				validate: (input) =>
					input.length > 0 ? true : "Select at least one tool",
			},
		]);

		this.config.tools = tools;
	}

	async selectResources() {
		console.log(chalk.yellow("\n📦 Resource Selection"));
		console.log(chalk.gray("Select which MCP resources to generate:\n"));

		const { resources } = await inquirer.prompt([
			{
				type: "checkbox",
				name: "resources",
				message: "Select resources to include:",
				choices: [
					{
						name: "Collection Resource (list/browse)",
						value: "collection",
						checked: this.config.tools.includes("list"),
					},
					{
						name: "Detail Resource (single item)",
						value: "detail",
						checked: this.config.tools.includes("get"),
					},
				],
			},
		]);

		this.config.resources = resources;
	}

	async selectCliCommands() {
		if (this.config.tools.length === 0) {
			this.config.cliCommands = [];
			return;
		}

		console.log(chalk.yellow("\n💻 CLI Command Selection"));
		console.log(chalk.gray("Select which tools should have CLI commands:\n"));

		const cliChoices = this.config.tools.map((tool) => ({
			name: this.getToolDisplayName(tool),
			value: tool,
			checked: ["list", "get", "create"].includes(tool),
		}));

		const { cliCommands } = await inquirer.prompt([
			{
				type: "checkbox",
				name: "cliCommands",
				message: "Select CLI commands to generate:",
				choices: cliChoices,
			},
		]);

		this.config.cliCommands = cliCommands;
	}

	async confirmConfiguration() {
		console.log(chalk.yellow("\n📋 Configuration Summary\n"));

		console.log(chalk.white("Domain Configuration:"));
		console.log(`  • Name: ${chalk.green(this.config.name)}`);
		console.log(`  • Description: ${chalk.green(this.config.description)}`);
		console.log(`  • API Endpoint: ${chalk.green(this.config.apiEndpoint)}`);

		console.log(chalk.white("\nMCP Tools:"));
		this.config.tools.forEach((tool) => {
			console.log(`  • ${chalk.green(this.getToolDisplayName(tool))}`);
		});

		if (this.config.resources.length > 0) {
			console.log(chalk.white("\nMCP Resources:"));
			this.config.resources.forEach((resource) => {
				console.log(
					`  • ${chalk.green(this.getResourceDisplayName(resource))}`,
				);
			});
		}

		if (this.config.cliCommands.length > 0) {
			console.log(chalk.white("\nCLI Commands:"));
			this.config.cliCommands.forEach((cmd) => {
				console.log(`  • ${chalk.green(this.getToolDisplayName(cmd))}`);
			});
		}

		const { confirm } = await inquirer.prompt([
			{
				type: "confirm",
				name: "confirm",
				message: "\nGenerate domain with this configuration?",
				default: true,
			},
		]);

		if (!confirm) {
			console.log(chalk.yellow("\nScaffolding cancelled."));
			process.exit(0);
		}
	}

	getToolDisplayName(tool) {
		const names = {
			list: "List items",
			get: "Get single item",
			create: "Create items",
			update: "Update single item",
			delete: "Delete single item",
			bulkUpdate: "Bulk update items",
			bulkDelete: "Bulk delete items",
		};
		return names[tool] || tool;
	}

	getResourceDisplayName(resource) {
		const names = {
			collection: "Collection resource (browseable list)",
			detail: "Detail resource (single item lookup)",
		};
		return names[resource] || resource;
	}

	/**
	 * Override display summary to use chalk
	 */
	displaySummary(generatedFiles) {
		console.log(chalk.green.bold("\n✅ Success!\n"));
		super.displaySummary(generatedFiles);
	}
}

// Run the interactive scaffolder
const scaffolder = new InteractiveScaffolder();
scaffolder.run().catch((error) => {
	console.error(chalk.red("Error:"), error.message);
	process.exit(1);
});
