import type { UpdateProjectParams } from "@lokalise/node-api";
import type { Command } from "commander";
import type { DomainCli, DomainMeta } from "../../shared/types/domain.types.js";
import { handleCliError } from "../../shared/utils/error.util.js";
import { Logger } from "../../shared/utils/logger.util.js";
import projectsController from "./projects.controller.js";

const logger = Logger.forContext("cli/projects.cli.ts");

/**
 * Register Projects CLI commands
 * @param program The Commander program instance
 */
function register(program: Command) {
	const methodLogger = logger.forMethod("register");
	methodLogger.debug("Registering Projects CLI commands...");

	// List Projects Command
	program
		.command("list-projects")
		.description(
			"Lists all Lokalise projects accessible with your API token. Shows project names, IDs, completion rates, and key statistics.",
		)
		.option(
			"-l, --limit <number>",
			"Number of projects to return (1-500, default: 100)",
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
		.option(
			"--include-stats",
			"Include detailed project statistics (keys count, languages, etc.)",
		)
		.action(async (options) => {
			const actionLogger = logger.forMethod("action:list-projects");
			try {
				actionLogger.debug("CLI list-projects called", {
					limit: options.limit,
					page: options.page,
					includeStats: options.includeStats,
				});

				// Create a single args object to pass to the controller
				const args = {
					limit: options.limit,
					page: options.page,
					includeStats: options.includeStats || false,
				};

				const result = await projectsController.listProjects(args);
				console.log(result.content);
			} catch (error) {
				handleCliError(error);
			}
		});

	// Get Project Details Command
	program
		.command("get-project-details")
		.description(
			"Gets detailed information about a specific Lokalise project including languages, keys, and completion status.",
		)
		.argument("<projectId>", "Project ID to get details for")
		.option(
			"--include-languages",
			"Include detailed language information and completion rates",
		)
		.option(
			"--include-keys-summary",
			"Include summary of keys (total, translated, missing)",
		)
		.action(async (projectId, options) => {
			const actionLogger = logger.forMethod("action:get-project-details");
			try {
				actionLogger.debug("CLI get-project-details called", {
					projectId,
					options,
				});

				// Create a single args object to pass to the controller
				const args = {
					projectId,
					includeLanguages: options.includeLanguages || false,
					includeKeysSummary: options.includeKeysSummary || false,
				};

				const result = await projectsController.getProjectDetails(args);
				console.log(result.content);
			} catch (error) {
				handleCliError(error);
			}
		});

	// Create Project Command
	program
		.command("create-project")
		.description("Creates a new Lokalise project with specified settings")
		.argument("<name>", "Name of the project to create")
		.option("-d, --description <text>", "Optional description for the project")
		.option(
			"-l, --base-lang <iso>",
			"Base language ISO code (default: 'en')",
			"en",
		)
		.action(async (name, options) => {
			const actionLogger = logger.forMethod("action:create-project");
			try {
				actionLogger.debug("CLI create-project called", {
					name,
					options,
				});

				const args = {
					name,
					description: options.description,
					base_lang_iso: options.baseLang,
				};

				const result = await projectsController.createProject(args);
				console.log(result.content);
			} catch (error) {
				handleCliError(error);
			}
		});

	// Update Project Command
	program
		.command("update-project")
		.description("Updates an existing Lokalise project")
		.argument("<projectId>", "Project ID to update")
		.option("-n, --name <text>", "New project name")
		.option("-d, --description <text>", "New project description")
		.action(async (projectId, options) => {
			const actionLogger = logger.forMethod("action:update-project");
			try {
				actionLogger.debug("CLI update-project called", {
					projectId,
					options,
				});

				const projectData: Partial<UpdateProjectParams> = {};

				if (options.name) {
					projectData.name = options.name;
				}

				if (options.description) {
					projectData.description = options.description;
				}

				if (Object.keys(projectData).length === 0) {
					throw new Error(
						"At least one field must be provided to update (name or description)",
					);
				}

				const args = {
					projectId,
					projectData,
				};

				const result = await projectsController.updateProject(args);
				console.log(result.content);
			} catch (error) {
				handleCliError(error);
			}
		});

	// Delete Project Command
	program
		.command("delete-project")
		.description(
			"Permanently deletes a Lokalise project (WARNING: This action cannot be undone!)",
		)
		.argument("<projectId>", "Project ID to delete")
		.option(
			"--confirm",
			"Confirm that you want to permanently delete this project",
		)
		.action(async (projectId, options) => {
			const actionLogger = logger.forMethod("action:delete-project");
			try {
				actionLogger.debug("CLI delete-project called", {
					projectId,
					options,
				});

				if (!options.confirm) {
					throw new Error(
						"Project deletion requires confirmation. Use --confirm flag to proceed. WARNING: This action cannot be undone!",
					);
				}

				const args = {
					projectId,
				};

				const result = await projectsController.deleteProject(args);
				console.log(result.content);
			} catch (error) {
				handleCliError(error);
			}
		});

	// Empty Project Command
	program
		.command("empty-project")
		.description(
			"Empties a Lokalise project (removes all keys and translations but keeps the project)",
		)
		.argument("<projectId>", "Project ID to empty")
		.option(
			"--confirm",
			"Confirm that you want to empty this project (remove all keys and translations)",
		)
		.action(async (projectId, options) => {
			const actionLogger = logger.forMethod("action:empty-project");
			try {
				actionLogger.debug("CLI empty-project called", {
					projectId,
					options,
				});

				if (!options.confirm) {
					throw new Error(
						"Project emptying requires confirmation. Use --confirm flag to proceed. This will remove all keys and translations!",
					);
				}

				const args = {
					projectId,
				};

				const result = await projectsController.emptyProject(args);
				console.log(result.content);
			} catch (error) {
				handleCliError(error);
			}
		});

	methodLogger.debug("Projects CLI commands registered successfully");
}

const projectsCli: DomainCli = {
	register,
	getMeta(): DomainMeta {
		return {
			name: "projects",
			description: "Projects management CLI commands",
			version: "1.0.0",
			cliCommandsCount: 6,
		};
	},
};

export default projectsCli;
