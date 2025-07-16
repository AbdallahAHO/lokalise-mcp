import type { Command } from "commander";
import type { DomainCli, DomainMeta } from "../../shared/types/domain.types.js";
import { handleCliError } from "../../shared/utils/error.util.js";
import { Logger } from "../../shared/utils/logger.util.js";
import translationsController from "./translations.controller.js";
import type {
	BulkUpdateTranslationsToolArgsType,
	GetTranslationToolArgsType,
	ListTranslationsToolArgsType,
	UpdateTranslationToolArgsType,
} from "./translations.types.js";

/**
 * Translations CLI commands implementation.
 * Generated on 2025-07-08 for Translation content management.
 */

const logger = Logger.forContext("translations.cli.ts");

/**
 * Register Translations CLI commands
 * @param program The Commander program instance
 */
function register(program: Command) {
	const methodLogger = logger.forMethod("register");
	methodLogger.debug("Registering Translations CLI commands...");

	// List Translations Command
	program
		.command("list-translations")
		.description(
			"Lists translations in a Lokalise project with cursor pagination",
		)
		.argument("<projectId>", "Project ID to list translations for")
		.option(
			"-l, --limit <number>",
			"Number of translations to return (1-5000, default: 100)",
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
		.option("--lang-id <id>", "Filter by language ID (numeric)", (value) => {
			const parsed = Number.parseInt(value, 10);
			if (Number.isNaN(parsed) || parsed < 1) {
				throw new Error("Language ID must be a positive number");
			}
			return parsed;
		})
		.option(
			"--reviewed <status>",
			"Filter by review status (0=not reviewed, 1=reviewed)",
		)
		.option(
			"--unverified <status>",
			"Filter by verification status (0=verified, 1=unverified)",
		)
		.option("--qa-issues <issues>", "Filter by QA issues (comma-separated)")
		.action(async (projectId, options) => {
			const actionLogger = logger.forMethod("action:list-translations");
			try {
				actionLogger.debug("CLI list-translations called", {
					projectId,
					options,
				});

				// Build arguments with proper typing
				const args: ListTranslationsToolArgsType = {
					projectId: projectId.trim(),
					limit: options.limit,
					cursor: options.cursor,
					filterLangId: options.langId,
					filterIsReviewed: options.reviewed,
					filterUnverified: options.unverified,
					filterQaIssues: options.qaIssues,
				};

				// Call controller
				const result = await translationsController.listTranslations(args);
				console.log(result.content);
			} catch (error) {
				handleCliError(error);
			}
		});

	// Get Translation Command
	program
		.command("get-translation")
		.description("Gets details of a specific translation")
		.argument("<projectId>", "Project ID containing the translation")
		.argument("<translationId>", "Translation ID to get details for")
		.option("--no-references", "Disable reference information in response")
		.action(async (projectId, translationId, options) => {
			const actionLogger = logger.forMethod("action:get-translation");
			try {
				actionLogger.debug("CLI get-translation called", {
					projectId,
					translationId,
					options,
				});

				// Build arguments with proper typing
				const args: GetTranslationToolArgsType = {
					projectId: projectId.trim(),
					translationId: Number.parseInt(translationId.trim(), 10),
					disableReferences:
						options.references === false ? ("1" as const) : undefined,
				};

				// Call controller
				const result = await translationsController.getTranslation(args);
				console.log(result.content);
			} catch (error) {
				handleCliError(error);
			}
		});

	// Update Translation Command
	program
		.command("update-translation")
		.description("Updates an existing translation")
		.argument("<projectId>", "Project ID containing the translation")
		.argument("<translationId>", "Translation ID to update")
		.argument("<translation>", "New translation text")
		.option("--reviewed", "Mark translation as reviewed")
		.option("--unverified", "Mark translation as unverified (fuzzy)")
		.option(
			"--status-ids <ids>",
			"Custom translation status IDs (comma-separated)",
		)
		.action(async (projectId, translationId, translation, options) => {
			const actionLogger = logger.forMethod("action:update-translation");
			try {
				actionLogger.debug("CLI update-translation called", {
					projectId,
					translationId,
					translation,
					options,
				});

				// Build arguments with proper typing
				const args: UpdateTranslationToolArgsType = {
					projectId: projectId.trim(),
					translationId: Number.parseInt(translationId.trim(), 10),
					translationData: {
						translation: translation,
						isReviewed: options.reviewed || undefined,
						isUnverified: options.unverified || undefined,
						customTranslationStatusIds: options.statusIds
							? options.statusIds
									.split(",")
									.map((id: string) => Number.parseInt(id.trim(), 10))
							: undefined,
					},
				};

				// Call controller
				const result = await translationsController.updateTranslation(args);
				console.log(result.content);
			} catch (error) {
				handleCliError(error);
			}
		});

	// Bulk Update Translations Command
	program
		.command("bulk-update-translations")
		.description(
			"Updates multiple translations in bulk with rate limiting and retry logic",
		)
		.argument("<projectId>", "Project ID containing the translations")
		.argument(
			"<updatesJson>",
			'JSON array of updates in format: [{"translationId":123,"translationData":{"translation":"Hello","isReviewed":true}}]',
		)
		.action(async (projectId, updatesJson) => {
			try {
				// Parse the JSON updates
				let updates: unknown;
				try {
					updates = JSON.parse(updatesJson);
				} catch {
					throw new Error(
						"Invalid JSON format. Expected array of updates with translationId and translationData",
					);
				}

				// Validate it's an array
				if (!Array.isArray(updates)) {
					throw new Error("Updates must be an array");
				}

				// Build args
				const args: BulkUpdateTranslationsToolArgsType = {
					projectId: projectId.trim(),
					updates: updates.map((update, index) => {
						if (!update.translationId || !update.translationData?.translation) {
							throw new Error(
								`Invalid update at index ${index}. Each update must have translationId and translationData.translation`,
							);
						}
						return {
							translationId: Number.parseInt(update.translationId, 10),
							translationData: {
								translation: update.translationData.translation,
								isReviewed: update.translationData.isReviewed || undefined,
								isUnverified: update.translationData.isUnverified || undefined,
								customTranslationStatusIds:
									update.translationData.customTranslationStatusIds ||
									undefined,
							},
						};
					}),
				};

				// Call controller
				const result =
					await translationsController.bulkUpdateTranslations(args);
				console.log(result.content);
			} catch (error) {
				handleCliError(error);
			}
		});

	methodLogger.debug("Translations CLI commands registered successfully");
}

// Export the domain CLI implementation
const translationsCli: DomainCli = {
	register,
	getMeta(): DomainMeta {
		return {
			name: "translations",
			description: "Translations CLI commands",
			version: "1.0.0",
			cliCommandsCount: 4,
		};
	},
};

export default translationsCli;
