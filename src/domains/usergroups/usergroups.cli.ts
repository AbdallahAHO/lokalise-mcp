import type { Command } from "commander";
import type { DomainCli, DomainMeta } from "../../shared/types/domain.types.js";
import { handleCliError } from "../../shared/utils/error.util.js";
import { Logger } from "../../shared/utils/logger.util.js";
import usergroupsController from "./usergroups.controller.js";

/**
 * Usergroups CLI commands implementation.
 * Generated on 2025-08-11 for User groups management for team-based permissions.
 */

const logger = Logger.forContext("usergroups.cli.ts");

/**
 * Register Usergroups CLI commands
 * @param program The Commander program instance
 */
function register(program: Command) {
	const methodLogger = logger.forMethod("register");
	methodLogger.debug("Registering Usergroups CLI commands...");

	// List Usergroupss Command
	program
		.command("list-usergroupss")
		.description("Lists all usergroups in a Lokalise project")
		.argument("<projectId>", "Project ID to list usergroups for")
		.option(
			"-l, --limit <number>",
			"Number of usergroups to return (1-100, default: 100)",
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
			const actionLogger = logger.forMethod("action:list-usergroupss");
			try {
				actionLogger.debug("CLI list-usergroupss called", {
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
				const result = await usergroupsController.list(args);
				console.log(result.content);
			} catch (error) {
				handleCliError(error);
			}
		});

	// Get Usergroups Command
	program
		.command("get-usergroups")
		.description("Gets details of a specific usergroups")
		.argument("<projectId>", "Project ID containing the usergroups")
		.argument("<usergroupsId>", "Usergroups ID to get details for")
		.action(async (projectId, usergroupsId) => {
			const actionLogger = logger.forMethod("action:get-usergroups");
			try {
				actionLogger.debug("CLI get-usergroups called", {
					projectId,
					usergroupsId,
				});

				// Build arguments
				const args = {
					teamId: projectId.trim(),
					groupId: usergroupsId.trim(),
				};

				// Call controller
				const result = await usergroupsController.get(args);
				console.log(result.content);
			} catch (error) {
				handleCliError(error);
			}
		});

	// Add Usergroups Command
	program
		.command("add-usergroups")
		.description("Adds one or more usergroups to a project")
		.argument("<projectId>", "Project ID to add usergroups to")
		// Add domain-specific arguments here
		.action(async (projectId, options) => {
			const actionLogger = logger.forMethod("action:add-usergroups");
			try {
				actionLogger.debug("CLI add-usergroups called", {
					projectId,
					options,
				});

				// Build arguments - customize based on domain needs
				const args = {
					teamId: projectId.trim(),
					name: "New Group", // Should come from options
					isReviewer: false, // Should come from options
					isAdmin: false, // Should come from options
				};

				// Call controller
				const result = await usergroupsController.create(args);
				console.log(result.content);
			} catch (error) {
				handleCliError(error);
			}
		});

	// Update Usergroups Command
	program
		.command("update-usergroups")
		.description("Updates an existing usergroups")
		.argument("<projectId>", "Project ID containing the usergroups")
		.argument("<usergroupsId>", "Usergroups ID to update")
		// Add domain-specific options here
		.action(async (projectId, usergroupsId, options) => {
			const actionLogger = logger.forMethod("action:update-usergroups");
			try {
				actionLogger.debug("CLI update-usergroups called", {
					projectId,
					usergroupsId,
					options,
				});

				// Build arguments
				const args = {
					teamId: projectId.trim(),
					groupId: usergroupsId.trim(),
					name: "Updated Name", // Should come from options
					isReviewer: false, // Should come from options
					isAdmin: false, // Should come from options
				};

				// Call controller
				const result = await usergroupsController.update(args);
				console.log(result.content);
			} catch (error) {
				handleCliError(error);
			}
		});

	// Remove Usergroups Command
	program
		.command("remove-usergroups")
		.description("Removes a usergroups from a project")
		.argument("<projectId>", "Project ID containing the usergroups")
		.argument("<usergroupsId>", "Usergroups ID to remove")
		.action(async (projectId, usergroupsId) => {
			const actionLogger = logger.forMethod("action:remove-usergroups");
			try {
				actionLogger.debug("CLI remove-usergroups called", {
					projectId,
					usergroupsId,
				});

				// Build arguments
				const args = {
					teamId: projectId.trim(),
					groupId: usergroupsId.trim(),
				};

				// Call controller
				const result = await usergroupsController.delete(args);
				console.log(result.content);
			} catch (error) {
				handleCliError(error);
			}
		});

	methodLogger.debug("Usergroups CLI commands registered successfully");
}

// Export the domain CLI implementation
const usergroupsCli: DomainCli = {
	register,
	getMeta(): DomainMeta {
		return {
			name: "usergroups",
			description: "Usergroups CLI commands",
			version: "1.0.0",
			cliCommandsCount: 3,
		};
	},
};

export default usergroupsCli;
