import type { Command } from "commander";
import type { DomainCli, DomainMeta } from "../../shared/types/domain.types.js";
import { handleCliError } from "../../shared/utils/error.util.js";
import { Logger } from "../../shared/utils/logger.util.js";
import glossaryController from "./glossary.controller.js";

/**
 * Glossary CLI commands implementation.
 * Generated on 2025-07-10 for Glossary terms management for consistent translations.
 */

const logger = Logger.forContext("glossary.cli.ts");

/**
 * Register Glossary CLI commands
 * @param program The Commander program instance
 */
function register(program: Command) {
	const methodLogger = logger.forMethod("register");
	methodLogger.debug("Registering Glossary CLI commands...");

	// List Glossary Terms Command
	program
		.command("list-glossary-terms")
		.description(
			"Lists glossary terms in a Lokalise project with cursor pagination",
		)
		.argument("<projectId>", "Project ID to list glossary terms for")
		.option(
			"-l, --limit <number>",
			"Number of terms to return (1-5000, default: 100)",
			(value) => {
				const parsed = Number.parseInt(value, 10);
				if (Number.isNaN(parsed) || parsed < 1 || parsed > 5000) {
					throw new Error("Limit must be a number between 1 and 5000");
				}
				return parsed;
			},
		)
		.option(
			"-c, --cursor <cursor>",
			"Cursor for pagination (from previous response)",
		)
		.action(async (projectId, options) => {
			const actionLogger = logger.forMethod("action:list-glossary-terms");
			try {
				actionLogger.debug("CLI list-glossary-terms called", {
					projectId,
					limit: options.limit,
					cursor: options.cursor,
				});

				// Build arguments
				const args = {
					projectId: projectId.trim(),
					limit: options.limit,
					cursor: options.cursor,
				};

				// Call controller
				const result = await glossaryController.listGlossaryTerms(args);
				console.log(result.content);
			} catch (error) {
				handleCliError(error);
			}
		});

	// Get Glossary Term Command
	program
		.command("get-glossary-term")
		.description(
			"Gets details of a specific glossary term including translations",
		)
		.argument("<projectId>", "Project ID containing the glossary term")
		.argument("<termId>", "Glossary term ID to get details for")
		.action(async (projectId, termId) => {
			const actionLogger = logger.forMethod("action:get-glossary-term");
			try {
				actionLogger.debug("CLI get-glossary-term called", {
					projectId,
					termId,
				});

				// Parse term ID as number
				const parsedTermId = Number.parseInt(termId, 10);
				if (Number.isNaN(parsedTermId)) {
					throw new Error("Term ID must be a number");
				}

				// Build arguments
				const args = {
					projectId: projectId.trim(),
					termId: parsedTermId,
				};

				// Call controller
				const result = await glossaryController.getGlossaryTerm(args);
				console.log(result.content);
			} catch (error) {
				handleCliError(error);
			}
		});

	// Create Glossary Terms Command
	program
		.command("create-glossary-term")
		.description(
			"Creates a new glossary term to maintain translation consistency",
		)
		.argument("<projectId>", "Project ID to add glossary term to")
		.requiredOption("-t, --term <term>", "The glossary term text")
		.requiredOption(
			"-d, --description <description>",
			"Description of the term",
		)
		.option("--case-sensitive", "Term matching is case-sensitive", false)
		.option("--not-translatable", "Term should not be translated", false)
		.option("--forbidden", "Term should be flagged as forbidden", false)
		.option("--tags <tags>", "Comma-separated tags", (value) =>
			value.split(",").map((t) => t.trim()),
		)
		.action(async (projectId, options) => {
			const actionLogger = logger.forMethod("action:create-glossary-term");
			try {
				actionLogger.debug("CLI create-glossary-term called", {
					projectId,
					options,
				});

				// Build arguments
				const args = {
					projectId: projectId.trim(),
					terms: [
						{
							term: options.term,
							description: options.description,
							caseSensitive: options.caseSensitive,
							translatable: !options.notTranslatable,
							forbidden: options.forbidden,
							tags: options.tags,
						},
					],
				};

				// Call controller
				const result = await glossaryController.createGlossaryTerms(args);
				console.log(result.content);
			} catch (error) {
				handleCliError(error);
			}
		});

	methodLogger.debug("Glossary CLI commands registered successfully");
}

// Export the domain CLI implementation
const glossaryCli: DomainCli = {
	register,
	getMeta(): DomainMeta {
		return {
			name: "glossary",
			description: "Glossary CLI commands",
			version: "1.0.0",
			cliCommandsCount: 3,
		};
	},
};

export default glossaryCli;
