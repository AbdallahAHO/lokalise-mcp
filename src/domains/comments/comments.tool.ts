import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type {
	DomainMeta,
	DomainTool,
} from "../../shared/types/domain.types.js";
import { formatErrorForMcpTool } from "../../shared/utils/error.util.js";
import { Logger } from "../../shared/utils/logger.util.js";
import commentsController from "./comments.controller.js";
import type {
	CreateCommentsToolArgsType,
	DeleteCommentToolArgsType,
	GetCommentToolArgsType,
	ListKeyCommentsToolArgsType,
	ListProjectCommentsToolArgsType,
} from "./comments.types.js";
import {
	CreateCommentsToolArgs,
	DeleteCommentToolArgs,
	GetCommentToolArgs,
	ListKeyCommentsToolArgs,
	ListProjectCommentsToolArgs,
} from "./comments.types.js";

/**
 * @function handleListKeyComments
 * @description MCP Tool handler to retrieve a list of comments for a specific key.
 *              Comments are attached to translation keys for team collaboration.
 *
 * @param {ListKeyCommentsToolArgsType} args - Arguments provided to the tool.
 * @returns {Promise<{ content: Array<{ type: 'text', text: string }> }>} Formatted response for the MCP.
 * @throws {McpError} Formatted error if the controller or service layer encounters an issue.
 */
async function handleListKeyComments(args: ListKeyCommentsToolArgsType) {
	const methodLogger = Logger.forContext(
		"comments.tool.ts",
		"handleListKeyComments",
	);
	methodLogger.debug(
		`Getting comments for key ${args.keyId} (limit: ${args.limit || "default"}, page: ${args.page || "1"})...`,
		args,
	);

	try {
		const result = await commentsController.listKeyComments(args);
		methodLogger.debug("Got the response from the controller", result);

		return {
			content: [
				{
					type: "text" as const,
					text: result.content,
				},
			],
		};
	} catch (error) {
		methodLogger.error("Tool failed", {
			error: (error as Error).message,
			args,
		});
		return formatErrorForMcpTool(error);
	}
}

/**
 * @function handleListProjectComments
 * @description MCP Tool handler to retrieve all comments across a project.
 *              This provides an overview of all discussions in the project.
 *
 * @param {ListProjectCommentsToolArgsType} args - Arguments provided to the tool.
 * @returns {Promise<{ content: Array<{ type: 'text', text: string }> }>} Formatted response for the MCP.
 * @throws {McpError} Formatted error if the controller or service layer encounters an issue.
 */
async function handleListProjectComments(
	args: ListProjectCommentsToolArgsType,
) {
	const methodLogger = Logger.forContext(
		"comments.tool.ts",
		"handleListProjectComments",
	);
	methodLogger.debug(
		`Getting all project comments (limit: ${args.limit || "default"}, page: ${args.page || "1"})...`,
		args,
	);

	try {
		const result = await commentsController.listProjectComments(args);
		methodLogger.debug("Got the response from the controller", result);

		return {
			content: [
				{
					type: "text" as const,
					text: result.content,
				},
			],
		};
	} catch (error) {
		methodLogger.error("Tool failed", {
			error: (error as Error).message,
			args,
		});
		return formatErrorForMcpTool(error);
	}
}

/**
 * @function handleGetComment
 * @description MCP Tool handler to retrieve details of a specific comment.
 *
 * @param {GetCommentToolArgsType} args - Arguments provided to the tool.
 * @returns {Promise<{ content: Array<{ type: 'text', text: string }> }>} Formatted response for the MCP.
 * @throws {McpError} Formatted error if the controller or service layer encounters an issue.
 */
async function handleGetComment(args: GetCommentToolArgsType) {
	const methodLogger = Logger.forContext(
		"comments.tool.ts",
		"handleGetComment",
	);
	methodLogger.debug("Getting comment details...", args);

	try {
		const result = await commentsController.getComment(args);
		methodLogger.debug("Got the response from the controller", result);

		return {
			content: [
				{
					type: "text" as const,
					text: result.content,
				},
			],
		};
	} catch (error) {
		methodLogger.error("Tool failed", {
			error: (error as Error).message,
			args,
		});
		return formatErrorForMcpTool(error);
	}
}

/**
 * @function handleCreateComments
 * @description MCP Tool handler to create new comments on a key.
 *              Supports bulk creation of multiple comments at once.
 *
 * @param {CreateCommentsToolArgsType} args - Arguments provided to the tool.
 * @returns {Promise<{ content: Array<{ type: 'text', text: string }> }>} Formatted response for the MCP.
 * @throws {McpError} Formatted error if the controller or service layer encounters an issue.
 */
async function handleCreateComments(args: CreateCommentsToolArgsType) {
	const methodLogger = Logger.forContext(
		"comments.tool.ts",
		"handleCreateComments",
	);
	methodLogger.debug(`Creating ${args.comments.length} comment(s)...`, args);

	try {
		const result = await commentsController.createComments(args);
		methodLogger.debug("Got the response from the controller", result);

		return {
			content: [
				{
					type: "text" as const,
					text: result.content,
				},
			],
		};
	} catch (error) {
		methodLogger.error("Tool failed", {
			error: (error as Error).message,
			args,
		});
		return formatErrorForMcpTool(error);
	}
}

/**
 * @function handleDeleteComment
 * @description MCP Tool handler to delete a comment from a key.
 *
 * @param {DeleteCommentToolArgsType} args - Arguments provided to the tool.
 * @returns {Promise<{ content: Array<{ type: 'text', text: string }> }>} Formatted response for the MCP.
 * @throws {McpError} Formatted error if the controller or service layer encounters an issue.
 */
async function handleDeleteComment(args: DeleteCommentToolArgsType) {
	const methodLogger = Logger.forContext(
		"comments.tool.ts",
		"handleDeleteComment",
	);
	methodLogger.debug("Deleting comment...", args);

	try {
		const result = await commentsController.deleteComment(args);
		methodLogger.debug("Got the response from the controller", result);

		return {
			content: [
				{
					type: "text" as const,
					text: result.content,
				},
			],
		};
	} catch (error) {
		methodLogger.error("Tool failed", {
			error: (error as Error).message,
			args,
		});
		return formatErrorForMcpTool(error);
	}
}

/**
 * @function registerTools
 * @description Registers all comments-related tools with the MCP server.
 *              This function binds the tool names to their handler functions and schemas.
 *
 * @param {McpServer} server - The MCP server instance where tools will be registered.
 */
function registerTools(server: McpServer) {
	const methodLogger = Logger.forContext("comments.tool.ts", "registerTools");
	methodLogger.info("Registering comments MCP tools");

	server.tool(
		"lokalise_list_key_comments",
		"Retrieves all comments for a specific translation key to understand discussion history and context. Required: projectId, keyId. Optional: limit (100), page. Use this to review translator questions, see implementation notes, or audit collaboration on a specific key. Returns: Paginated list of comments with author, timestamp, and content. Pairs with: lokalise_create_comments to continue discussions.",
		ListKeyCommentsToolArgs.shape,
		handleListKeyComments,
	);

	server.tool(
		"lokalise_list_project_comments",
		"Fetches all comments across an entire project for a comprehensive overview of team collaboration. Required: projectId. Optional: limit (100), page. Use this to identify keys with active discussions, audit communication patterns, or find unresolved questions. Returns: Comments grouped by key with context. Note: Can be data-intensive for large projects.",
		ListProjectCommentsToolArgs.shape,
		handleListProjectComments,
	);

	server.tool(
		"lokalise_get_comment",
		"Gets full details of a single comment including complete text and metadata. Required: projectId, keyId, commentId. Use when comment text was truncated in list view or to get exact timestamps. Returns: Complete comment data with author details and creation time. Pairs with: lokalise_delete_comment for comment management.",
		GetCommentToolArgs.shape,
		handleGetComment,
	);

	server.tool(
		"lokalise_create_comments",
		"Adds one or more comments to a translation key for team collaboration. Required: projectId, keyId, comments array with 'comment' text. Use to ask translators questions, provide context, leave implementation notes, or flag issues. Supports bulk creation for efficiency. Returns: Created comments with IDs. Note: Comments are visible to all project members.",
		CreateCommentsToolArgs.shape,
		handleCreateComments,
	);

	server.tool(
		"lokalise_delete_comment",
		"Permanently removes a specific comment from a translation key. Required: projectId, keyId, commentId. Use to clean up resolved discussions, remove outdated information, or delete accidental comments. Returns: Confirmation of deletion. Warning: This action cannot be undone. Consider archiving important discussions elsewhere first.",
		DeleteCommentToolArgs.shape,
		handleDeleteComment,
	);

	methodLogger.info("Comments MCP tools registered successfully");
}

// Export the domain tool implementation
const commentsTool: DomainTool = {
	registerTools,
	getMeta(): DomainMeta {
		return {
			name: "comments",
			description: "Comments on translation keys",
			version: "1.0.0",
			toolsCount: 5,
		};
	},
};

export default commentsTool;
