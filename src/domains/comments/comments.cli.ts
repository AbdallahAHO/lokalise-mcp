import type { Command } from "commander";
import type { DomainCli, DomainMeta } from "../../shared/types/domain.types.js";
import { handleCliError } from "../../shared/utils/error.util.js";
import { Logger } from "../../shared/utils/logger.util.js";
import commentsController from "./comments.controller.js";

/**
 * Comments CLI commands implementation.
 * Comments are attached to translation keys and allow team collaboration.
 */

const logger = Logger.forContext("comments.cli.ts");

/**
 * Register Comments CLI commands
 * @param program The Commander program instance
 */
function register(program: Command) {
	const methodLogger = logger.forMethod("register");
	methodLogger.debug("Registering Comments CLI commands...");

	// List Key Comments Command
	program
		.command("list-key-comments")
		.description("Lists all comments for a specific translation key")
		.argument("<projectId>", "Project ID containing the key")
		.argument("<keyId>", "Key ID to list comments for")
		.option(
			"-l, --limit <number>",
			"Number of comments to return (1-5000, default: 100)",
			(value) => {
				const parsed = Number.parseInt(value, 10);
				if (Number.isNaN(parsed) || parsed < 1 || parsed > 5000) {
					throw new Error("Limit must be a number between 1 and 5000");
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
		.action(async (projectId, keyId, options) => {
			const actionLogger = logger.forMethod("action:list-key-comments");
			try {
				actionLogger.debug("CLI list-key-comments called", {
					projectId,
					keyId,
					limit: options.limit,
					page: options.page,
				});

				// Build arguments
				const args = {
					projectId: projectId.trim(),
					keyId: Number.parseInt(keyId, 10),
					limit: options.limit,
					page: options.page,
				};

				// Call controller
				const result = await commentsController.listKeyComments(args);
				console.log(result.content);
			} catch (error) {
				handleCliError(error);
			}
		});

	// List Project Comments Command
	program
		.command("list-project-comments")
		.description("Lists all comments across the entire project")
		.argument("<projectId>", "Project ID to list all comments for")
		.option(
			"-l, --limit <number>",
			"Number of comments to return (1-5000, default: 100)",
			(value) => {
				const parsed = Number.parseInt(value, 10);
				if (Number.isNaN(parsed) || parsed < 1 || parsed > 5000) {
					throw new Error("Limit must be a number between 1 and 5000");
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
			const actionLogger = logger.forMethod("action:list-project-comments");
			try {
				actionLogger.debug("CLI list-project-comments called", {
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
				const result = await commentsController.listProjectComments(args);
				console.log(result.content);
			} catch (error) {
				handleCliError(error);
			}
		});

	// Get Comment Command
	program
		.command("get-comment")
		.description("Gets details of a specific comment")
		.argument("<projectId>", "Project ID containing the comment")
		.argument("<keyId>", "Key ID containing the comment")
		.argument("<commentId>", "Comment ID to get details for")
		.action(async (projectId, keyId, commentId) => {
			const actionLogger = logger.forMethod("action:get-comment");
			try {
				actionLogger.debug("CLI get-comment called", {
					projectId,
					keyId,
					commentId,
				});

				// Build arguments
				const args = {
					projectId: projectId.trim(),
					keyId: Number.parseInt(keyId, 10),
					commentId: Number.parseInt(commentId, 10),
				};

				// Call controller
				const result = await commentsController.getComment(args);
				console.log(result.content);
			} catch (error) {
				handleCliError(error);
			}
		});

	// Create Comments Command
	program
		.command("create-comments")
		.description("Creates one or more comments on a translation key")
		.argument("<projectId>", "Project ID")
		.argument("<keyId>", "Key ID to attach comments to")
		.argument(
			"<comment>",
			"Comment text (for multiple comments, separate with ||)",
		)
		.action(async (projectId, keyId, comment) => {
			const actionLogger = logger.forMethod("action:create-comments");
			try {
				actionLogger.debug("CLI create-comments called", {
					projectId,
					keyId,
					comment,
				});

				// Split multiple comments by ||
				const commentTexts = comment
					.split("||")
					.map((c: string) => c.trim())
					.filter((c: string) => c);

				// Build arguments
				const args = {
					projectId: projectId.trim(),
					keyId: Number.parseInt(keyId, 10),
					comments: commentTexts.map((text: string) => ({ comment: text })),
				};

				// Call controller
				const result = await commentsController.createComments(args);
				console.log(result.content);
			} catch (error) {
				handleCliError(error);
			}
		});

	// Delete Comment Command
	program
		.command("delete-comment")
		.description("Deletes a specific comment from a key")
		.argument("<projectId>", "Project ID containing the comment")
		.argument("<keyId>", "Key ID containing the comment")
		.argument("<commentId>", "Comment ID to delete")
		.action(async (projectId, keyId, commentId) => {
			const actionLogger = logger.forMethod("action:delete-comment");
			try {
				actionLogger.debug("CLI delete-comment called", {
					projectId,
					keyId,
					commentId,
				});

				// Build arguments
				const args = {
					projectId: projectId.trim(),
					keyId: Number.parseInt(keyId, 10),
					commentId: Number.parseInt(commentId, 10),
				};

				// Call controller
				const result = await commentsController.deleteComment(args);
				console.log(result.content);
			} catch (error) {
				handleCliError(error);
			}
		});

	methodLogger.debug("Comments CLI commands registered successfully");
}

// Export the domain CLI implementation
const commentsCli: DomainCli = {
	register,
	getMeta(): DomainMeta {
		return {
			name: "comments",
			description: "Comments CLI commands",
			version: "1.0.0",
			cliCommandsCount: 5,
		};
	},
};

export default commentsCli;
