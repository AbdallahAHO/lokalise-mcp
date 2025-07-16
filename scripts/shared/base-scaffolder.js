#!/usr/bin/env node

/**
 * Base scaffolder class for domain generation
 */

import fs from "node:fs/promises";
import path from "node:path";
import { spawn } from "node:child_process";
import {
	DOMAINS_DIR,
	TEMPLATES_DIR,
	templateUtils,
	fileUtils,
	validationUtils,
	summaryUtils,
} from "./scaffolding-utils.js";

export class BaseScaffolder {
	constructor() {
		this.config = {
			name: "",
			description: "",
			apiEndpoint: "",
			tools: [],
			resources: [],
			cliCommands: [],
		};
	}

	/**
	 * Validate the configuration
	 */
	async validateConfig() {
		validationUtils.validateDomainName(this.config.name);

		if (await validationUtils.domainExists(this.config.name)) {
			throw new Error(`Domain "${this.config.name}" already exists`);
		}

		if (!this.config.description) {
			throw new Error("Domain description is required");
		}
	}

	/**
	 * Generate a single file from template
	 */
	async generateFile(templateName, outputName) {
		const templatePath = path.join(TEMPLATES_DIR, `${templateName}.template`);
		const outputPath = path.join(DOMAINS_DIR, this.config.name, outputName);

		// Read template
		const templateContent = await fs.readFile(templatePath, "utf-8");

		// Get replacements and conditions
		const replacements = fileUtils.getTemplateReplacements(this.config);
		const conditions = fileUtils.getTemplateConditions(this.config);

		// Process template
		let processed = templateUtils.processTemplate(
			templateContent,
			replacements,
		);
		processed = templateUtils.processConditionalSections(processed, conditions);

		// Write file
		await fs.writeFile(outputPath, processed);

		return outputName;
	}

	/**
	 * Generate all domain files
	 */
	async generateDomain() {
		// Validate configuration
		await this.validateConfig();

		// Create domain directory
		const domainPath = path.join(DOMAINS_DIR, this.config.name);
		await fs.mkdir(domainPath, { recursive: true });

		// Files to generate
		const filesToGenerate = [
			{ template: "domain.types.ts", output: `${this.config.name}.types.ts` },
			{
				template: "domain.service.ts",
				output: `${this.config.name}.service.ts`,
			},
			{
				template: "domain.formatter.ts",
				output: `${this.config.name}.formatter.ts`,
			},
			{
				template: "domain.controller.ts",
				output: `${this.config.name}.controller.ts`,
			},
			{ template: "domain.tool.ts", output: `${this.config.name}.tool.ts` },
			{
				template: "domain.resource.ts",
				output: `${this.config.name}.resource.ts`,
			},
			{ template: "domain.cli.ts", output: `${this.config.name}.cli.ts` },
			{ template: "domain.index.ts", output: "index.ts" },
		];

		// Generate files
		const generatedFiles = [];
		for (const { template, output } of filesToGenerate) {
			try {
				await this.generateFile(template, output);
				generatedFiles.push(output);
			} catch (error) {
				console.error(`Failed to generate ${output}:`, error.message);
				throw error;
			}
		}

		return generatedFiles;
	}

	/**
	 * Display summary after generation
	 */
	displaySummary(generatedFiles) {
		console.log(summaryUtils.generateSummary(this.config, generatedFiles));
	}

	/**
	 * Run biome formatter on generated files
	 */
	async formatGeneratedFiles() {
		const domainPath = path.join(DOMAINS_DIR, this.config.name);

		return new Promise((resolve, _reject) => {
			console.log("\n📐 Running formatter on generated files...");

			const biome = spawn("npx", ["biome", "format", domainPath, "--write"], {
				cwd: path.dirname(DOMAINS_DIR), // Run from src directory
				stdio: "pipe",
			});

			let _output = "";
			let errorOutput = "";

			biome.stdout.on("data", (data) => {
				_output += data.toString();
			});

			biome.stderr.on("data", (data) => {
				errorOutput += data.toString();
			});

			biome.on("close", (code) => {
				if (code === 0) {
					console.log("✅ Files formatted successfully");
					resolve();
				} else {
					// Biome might exit with non-zero even if formatting succeeded
					// Check if there are actual errors vs just warnings
					if (errorOutput.includes("error") || errorOutput.includes("Error")) {
						console.warn("⚠️  Formatting completed with warnings");
						console.log(errorOutput);
					}
					// Resolve anyway as formatting issues shouldn't block generation
					resolve();
				}
			});

			biome.on("error", (err) => {
				console.warn("⚠️  Could not run formatter:", err.message);
				// Don't reject - formatting is nice to have but not critical
				resolve();
			});
		});
	}

	/**
	 * Main execution flow
	 */
	async execute() {
		try {
			const files = await this.generateDomain();
			await this.formatGeneratedFiles();
			this.displaySummary(files);
		} catch (error) {
			console.error("Error:", error.message);
			process.exit(1);
		}
	}

	/**
	 * Set configuration (to be overridden by subclasses)
	 */
	async configure() {
		throw new Error("configure() must be implemented by subclass");
	}

	/**
	 * Run the scaffolder
	 */
	async run() {
		await this.configure();
		await this.execute();
	}
}
