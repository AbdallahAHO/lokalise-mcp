import type { Command } from "commander";
import type { DomainCli, DomainMeta } from "../../shared/types/domain.types.js";
import { handleCliError } from "../../shared/utils/error.util.js";
import { Logger } from "../../shared/utils/logger.util.js";
import contributorsController from "./contributors.controller.js";

/**
 * Contributors CLI commands implementation.
 * Generated on 2025-07-08 for Team member and contributor management.
 */

const logger = Logger.forContext("contributors.cli.ts");

/**
 * Register Contributors CLI commands
 * @param program The Commander program instance
 */
function register(program: Command) {
	const methodLogger = logger.forMethod("register");
	methodLogger.debug("Registering Contributors CLI commands...");

	// List Contributors Command
	program
		.command("list-contributors")
		.description("Lists all contributors in a Lokalise project")
		.argument("<projectId>", "Project ID to list contributors for")
		.option(
			"-l, --limit <number>",
			"Number of contributors to return (1-100, default: 100)",
			(value) => {
				const parsed = Number.parseInt(value, 10);
				if (Number.isNaN(parsed) || parsed < 1 || parsed > 100) {
					throw new Error("Limit must be a number between 1 and 100");
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
		.action(async (projectId, options) => {
			const actionLogger = logger.forMethod("action:list-contributors");
			try {
				actionLogger.debug("CLI list-contributors called", {
					projectId,
					limit: options.limit,
					page: options.page,
				});

				// Build arguments
				const args = {
					projectId: projectId.trim(),
					limit: options.limit,
					page: options.page,
				};

				// Call controller
				const result = await contributorsController.listContributors(args);
				console.log(result.content);
			} catch (error) {
				handleCliError(error);
			}
		});

	// Get Contributor Command
	program
		.command("get-contributor")
		.description("Gets details of a specific contributor")
		.argument("<projectId>", "Project ID containing the contributor")
		.argument("<contributorId>", "Contributor ID to get details for")
		.action(async (projectId, contributorId) => {
			const actionLogger = logger.forMethod("action:get-contributor");
			try {
				actionLogger.debug("CLI get-contributor called", {
					projectId,
					contributorId,
				});

				// Build arguments
				const args = {
					projectId: projectId.trim(),
					contributorId: contributorId.trim(),
				};

				// Call controller
				const result = await contributorsController.getContributor(args);
				console.log(result.content);
			} catch (error) {
				handleCliError(error);
			}
		});

	// Get Current User Command
	program
		.command("me")
		.description("Gets the current user's contributor profile")
		.argument("<projectId>", "Project ID to get current user profile for")
		.action(async (projectId) => {
			const actionLogger = logger.forMethod("action:me");
			try {
				actionLogger.debug("CLI me called", { projectId });

				// Build arguments
				const args = {
					projectId: projectId.trim(),
				};

				// Call controller
				const result = await contributorsController.getCurrentUser(args);
				console.log(result.content);
			} catch (error) {
				handleCliError(error);
			}
		});

	// Add Contributors Command
	program
		.command("add-contributors")
		.description("Adds one or more contributors to a project")
		.argument("<projectId>", "Project ID to add contributors to")
		.argument("<email>", "Email address of the contributor")
		.argument(
			"<languages>",
			"Languages (comma-separated, format: 'en,de:write,fr')",
		)
		.option("-n, --name <name>", "Full name of the contributor")
		.option(
			"--admin-rights <rights>",
			"Admin rights (comma-separated: upload,activity,download,settings,create_branches,statistics,keys,screenshots,glossary,contributors,languages,tasks)",
		)
		.action(async (projectId, email, languages, options) => {
			const actionLogger = logger.forMethod("action:add-contributors");
			try {
				actionLogger.debug("CLI add-contributors called", {
					projectId,
					email,
					languages,
					options,
				});

				// Parse languages
				const languageList = languages.split(",").map((lang: string) => {
					const [iso, access] = lang.trim().split(":");
					return {
						lang_iso: iso,
						is_writable: access === "write" || access === "rw",
					};
				});

				// Parse admin rights if provided
				const adminRights = options.adminRights
					? options.adminRights.split(",").map((r: string) => r.trim())
					: undefined;

				// Build contributor data
				const contributorData = {
					email,
					fullname: options.name,
					languages: languageList,
					admin_rights: adminRights,
				};

				// Build arguments
				const args = {
					projectId: projectId.trim(),
					contributors: [contributorData],
				};

				// Call controller
				const result = await contributorsController.addContributors(args);
				console.log(result.content);
			} catch (error) {
				handleCliError(error);
			}
		});

	methodLogger.debug("Contributors CLI commands registered successfully");
}

// Export the domain CLI implementation
const contributorsCli: DomainCli = {
	register,
	getMeta(): DomainMeta {
		return {
			name: "contributors",
			description: "Contributors CLI commands",
			version: "1.0.0",
			cliCommandsCount: 4,
		};
	},
};

export default contributorsCli;
