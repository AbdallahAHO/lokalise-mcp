import type { UpdateLanguageParams } from "@lokalise/node-api";
import type { Command } from "commander";
import type { DomainCli, DomainMeta } from "../../shared/types/domain.types.js";
import { handleCliError } from "../../shared/utils/error.util.js";
import { Logger } from "../../shared/utils/logger.util.js";
import languagesController from "./languages.controller.js";

const logger = Logger.forContext("cli/languages.cli.ts");

/**
 * Register Languages CLI commands
 * @param program The Commander program instance
 */
function register(program: Command) {
	const methodLogger = logger.forMethod("register");
	methodLogger.debug("Registering Languages CLI commands...");

	// List System Languages Command
	program
		.command("list-system-languages")
		.description(
			"Lists all available system languages in Lokalise with their ISO codes and details.",
		)
		.option(
			"-l, --limit <number>",
			"Number of languages to return (1-500, default: 100)",
			(value) => {
				const parsed = Number.parseInt(value, 10);
				if (Number.isNaN(parsed) || parsed < 1 || parsed > 500) {
					throw new Error("Limit must be a number between 1 and 500");
				}
				return parsed;
			},
		)
		.option(
			"-p, --page <number>",
			"Page number for pagination (default: 1)",
			(value) => {
				const parsed = Number.parseInt(value, 10);
				if (Number.isNaN(parsed) || parsed < 1) {
					throw new Error("Page must be a number greater than 0");
				}
				return parsed;
			},
		)
		.action(async (options) => {
			const actionLogger = logger.forMethod("action:list-system-languages");
			try {
				actionLogger.debug("CLI list-system-languages called", {
					limit: options.limit,
					page: options.page,
				});

				const args = {
					limit: options.limit,
					page: options.page,
				};

				const result = await languagesController.listSystemLanguages(args);
				console.log(result.content);
			} catch (error) {
				handleCliError(error);
			}
		});

	// List Project Languages Command
	program
		.command("list-project-languages")
		.description(
			"Lists all languages in a specific Lokalise project with completion statistics.",
		)
		.argument("<projectId>", "Project ID to list languages for")
		.option(
			"--include-progress",
			"Include translation progress percentages for each language",
		)
		.action(async (projectId, options) => {
			const actionLogger = logger.forMethod("action:list-project-languages");
			try {
				actionLogger.debug("CLI list-project-languages called", {
					projectId,
					options,
				});

				const args = {
					projectId,
					includeProgress: options.includeProgress || false,
				};

				const result = await languagesController.listProjectLanguages(args);
				console.log(result.content);
			} catch (error) {
				handleCliError(error);
			}
		});

	// Add Project Languages Command
	program
		.command("add-project-languages")
		.description("Adds new languages to a Lokalise project from JSON file")
		.argument("<projectId>", "Project ID to add languages to")
		.argument("<languagesFile>", "Path to JSON file containing languages array")
		.action(async (projectId, languagesFile) => {
			const actionLogger = logger.forMethod("action:add-project-languages");
			try {
				actionLogger.debug("CLI add-project-languages called", {
					projectId,
					languagesFile,
				});

				// Read and parse the languages file
				const fs = await import("node:fs/promises");
				const languagesData = JSON.parse(
					await fs.readFile(languagesFile, "utf-8"),
				);

				if (!Array.isArray(languagesData)) {
					throw new Error(
						"Languages file must contain an array of language objects",
					);
				}

				const args = {
					projectId,
					languages: languagesData,
				};

				const result = await languagesController.addProjectLanguages(args);
				console.log(result.content);
			} catch (error) {
				handleCliError(error);
			}
		});

	// Get Language Command
	program
		.command("get-language")
		.description("Gets detailed information about a specific language")
		.argument("<projectId>", "Project ID containing the language")
		.argument("<languageId>", "Language ID to get details for", (value) => {
			const parsed = Number.parseInt(value, 10);
			if (Number.isNaN(parsed) || parsed <= 0) {
				throw new Error("Language ID must be a positive number");
			}
			return parsed;
		})
		.action(async (projectId, languageId) => {
			const actionLogger = logger.forMethod("action:get-language");
			try {
				actionLogger.debug("CLI get-language called", {
					projectId,
					languageId,
				});

				const args = {
					projectId,
					languageId,
				};

				const result = await languagesController.getLanguage(args);
				console.log(result.content);
			} catch (error) {
				handleCliError(error);
			}
		});

	// Update Language Command
	program
		.command("update-language")
		.description("Updates an existing language")
		.argument("<projectId>", "Project ID containing the language")
		.argument("<languageId>", "Language ID to update", (value) => {
			const parsed = Number.parseInt(value, 10);
			if (Number.isNaN(parsed) || parsed <= 0) {
				throw new Error("Language ID must be a positive number");
			}
			return parsed;
		})
		.option("--lang-iso <iso>", "New language ISO code")
		.option("--lang-name <name>", "New language name")
		.option("--plural-forms <forms...>", "New plural forms (space-separated)")
		.action(async (projectId, languageId, options) => {
			const actionLogger = logger.forMethod("action:update-language");
			try {
				actionLogger.debug("CLI update-language called", {
					projectId,
					languageId,
					options,
				});

				const languageData: UpdateLanguageParams = {};

				if (options.langIso) {
					languageData.lang_iso = options.langIso;
				}

				if (options.langName) {
					languageData.lang_name = options.langName;
				}

				if (options.pluralForms) {
					languageData.plural_forms = options.pluralForms;
				}

				if (Object.keys(languageData).length === 0) {
					throw new Error(
						"At least one field must be provided to update (lang-iso, lang-name, or plural-forms)",
					);
				}

				const args = {
					projectId,
					languageId,
					languageData,
				};

				const result = await languagesController.updateLanguage(args);
				console.log(result.content);
			} catch (error) {
				handleCliError(error);
			}
		});

	// Remove Language Command
	program
		.command("remove-language")
		.description(
			"Removes a language from a project (WARNING: This action cannot be undone!)",
		)
		.argument("<projectId>", "Project ID containing the language")
		.argument("<languageId>", "Language ID to remove", (value) => {
			const parsed = Number.parseInt(value, 10);
			if (Number.isNaN(parsed) || parsed <= 0) {
				throw new Error("Language ID must be a positive number");
			}
			return parsed;
		})
		.option(
			"--confirm",
			"Confirm that you want to permanently remove this language and all its translations",
		)
		.action(async (projectId, languageId, options) => {
			const actionLogger = logger.forMethod("action:remove-language");
			try {
				actionLogger.debug("CLI remove-language called", {
					projectId,
					languageId,
					options,
				});

				if (!options.confirm) {
					throw new Error(
						"Language removal requires confirmation. Use --confirm flag to proceed. WARNING: This action cannot be undone and will remove all translations!",
					);
				}

				const args = {
					projectId,
					languageId,
				};

				const result = await languagesController.removeLanguage(args);
				console.log(result.content);
			} catch (error) {
				handleCliError(error);
			}
		});

	methodLogger.debug("Languages CLI commands registered successfully");
}

const languagesCli: DomainCli = {
	register,
	getMeta(): DomainMeta {
		return {
			name: "languages",
			description: "Languages management CLI commands",
			version: "1.0.0",
			cliCommandsCount: 6,
		};
	},
};

export default languagesCli;
