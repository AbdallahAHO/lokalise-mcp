import type { Command } from "commander";
import type { DomainCli, DomainMeta } from "../../shared/types/domain.types.js";
import { handleCliError } from "../../shared/utils/error.util.js";
import { Logger } from "../../shared/utils/logger.util.js";
import teamusersController from "./teamusers.controller.js";

/**
 * Teamusers CLI commands implementation.
 * Generated on 2025-08-11 for Team users management for Lokalise teams.
 */

const logger = Logger.forContext("teamusers.cli.ts");

/**
 * Register Teamusers CLI commands
 * @param program The Commander program instance
 */
function register(program: Command) {
	const methodLogger = logger.forMethod("register");
	methodLogger.debug("Registering Teamusers CLI commands...");

	// List Teamuserss Command
	program
		.command("list-teamuserss")
		.description("Lists all teamusers in a Lokalise project")
		.argument("<projectId>", "Project ID to list teamusers for")
		.option(
			"-l, --limit <number>",
			"Number of teamusers to return (1-100, default: 100)",
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
			const actionLogger = logger.forMethod("action:list-teamuserss");
			try {
				actionLogger.debug("CLI list-teamuserss called", {
					projectId,
					limit: options.limit,
					page: options.page,
				});

				// Build arguments
				const args = {
					teamId: projectId.trim(),
					limit: options.limit,
					page: options.page,
				};

				// Call controller
				const result = await teamusersController.listTeamusers(args);
				console.log(result.content);
			} catch (error) {
				handleCliError(error);
			}
		});

	// Get Teamusers Command
	program
		.command("get-teamusers")
		.description("Gets details of a specific teamusers")
		.argument("<projectId>", "Project ID containing the teamusers")
		.argument("<teamusersId>", "Teamusers ID to get details for")
		.action(async (projectId, teamusersId) => {
			const actionLogger = logger.forMethod("action:get-teamusers");
			try {
				actionLogger.debug("CLI get-teamusers called", {
					projectId,
					teamusersId,
				});

				// Build arguments
				const args = {
					teamId: projectId.trim(),
					userId: teamusersId.trim(),
				};

				// Call controller
				const result = await teamusersController.getTeamusers(args);
				console.log(result.content);
			} catch (error) {
				handleCliError(error);
			}
		});

	// Update Teamusers Command
	program
		.command("update-teamusers")
		.description("Updates an existing teamusers")
		.argument("<projectId>", "Project ID containing the teamusers")
		.argument("<teamusersId>", "Teamusers ID to update")
		// Add domain-specific options here
		.action(async (projectId, teamusersId, options) => {
			const actionLogger = logger.forMethod("action:update-teamusers");
			try {
				actionLogger.debug("CLI update-teamusers called", {
					projectId,
					teamusersId,
					options,
				});

				// Build arguments
				const args = {
					teamId: projectId.trim(),
					userId: teamusersId.trim(),
					role: "member" as const, // Default role, should be from options
				};

				// Call controller
				const result = await teamusersController.updateTeamusers(args);
				console.log(result.content);
			} catch (error) {
				handleCliError(error);
			}
		});

	// Remove Teamusers Command
	program
		.command("remove-teamusers")
		.description("Removes a teamusers from a project")
		.argument("<projectId>", "Project ID containing the teamusers")
		.argument("<teamusersId>", "Teamusers ID to remove")
		.action(async (projectId, teamusersId) => {
			const actionLogger = logger.forMethod("action:remove-teamusers");
			try {
				actionLogger.debug("CLI remove-teamusers called", {
					projectId,
					teamusersId,
				});

				// Build arguments
				const args = {
					teamId: projectId.trim(),
					userId: teamusersId.trim(),
				};

				// Call controller
				const result = await teamusersController.deleteTeamusers(args);
				console.log(result.content);
			} catch (error) {
				handleCliError(error);
			}
		});

	methodLogger.debug("Teamusers CLI commands registered successfully");
}

// Export the domain CLI implementation
const teamusersCli: DomainCli = {
	register,
	getMeta(): DomainMeta {
		return {
			name: "teamusers",
			description: "Teamusers CLI commands",
			version: "1.0.0",
			cliCommandsCount: 3,
		};
	},
};

export default teamusersCli;
