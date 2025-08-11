import type { Command } from "commander";
import type { DomainCli, DomainMeta } from "../../shared/types/domain.types.js";
import { handleCliError } from "../../shared/utils/error.util.js";
import { Logger } from "../../shared/utils/logger.util.js";
import queuedprocessesController from "./queuedprocesses.controller.js";

/**
 * Queuedprocesses CLI commands implementation.
 * Generated on 2025-08-11 for Monitor async operations in Lokalise.
 */

const logger = Logger.forContext("queuedprocesses.cli.ts");

/**
 * Register Queuedprocesses CLI commands
 * @param program The Commander program instance
 */
function register(program: Command) {
	const methodLogger = logger.forMethod("register");
	methodLogger.debug("Registering Queuedprocesses CLI commands...");

	// List Queuedprocessess Command
	program
		.command("list-queuedprocessess")
		.description("Lists all queuedprocesses in a Lokalise project")
		.argument("<projectId>", "Project ID to list queuedprocesses for")
		.option(
			"-l, --limit <number>",
			"Number of queuedprocesses to return (1-100, default: 100)",
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
			const actionLogger = logger.forMethod("action:list-queuedprocessess");
			try {
				actionLogger.debug("CLI list-queuedprocessess called", {
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
				const result =
					await queuedprocessesController.listQueuedprocesses(args);
				console.log(result.content);
			} catch (error) {
				handleCliError(error);
			}
		});

	// Get Queuedprocesses Command
	program
		.command("get-queuedprocesses")
		.description("Gets details of a specific queuedprocesses")
		.argument("<projectId>", "Project ID containing the queuedprocesses")
		.argument("<queuedprocessesId>", "Queuedprocesses ID to get details for")
		.action(async (projectId, queuedprocessesId) => {
			const actionLogger = logger.forMethod("action:get-queuedprocesses");
			try {
				actionLogger.debug("CLI get-queuedprocesses called", {
					projectId,
					queuedprocessesId,
				});

				// Build arguments
				const args = {
					projectId: projectId.trim(),
					processId: queuedprocessesId.trim(),
				};

				// Call controller
				const result = await queuedprocessesController.getQueuedprocesses(args);
				console.log(result.content);
			} catch (error) {
				handleCliError(error);
			}
		});

	methodLogger.debug("Queuedprocesses CLI commands registered successfully");
}

// Export the domain CLI implementation
const queuedprocessesCli: DomainCli = {
	register,
	getMeta(): DomainMeta {
		return {
			name: "queuedprocesses",
			description: "Queuedprocesses CLI commands",
			version: "1.0.0",
			cliCommandsCount: 2,
		};
	},
};

export default queuedprocessesCli;
