import type { ControllerResponse } from "../../shared/types/common.types.js";
import { ErrorType, McpError } from "../../shared/utils/error.util.js";
import { handleControllerError } from "../../shared/utils/error-handler.util.js";
import { Logger } from "../../shared/utils/logger.util.js";
import {
	formatCommentDetails,
	formatCreateCommentsResult,
	formatDeleteCommentResult,
	formatKeyCommentsList,
	formatProjectCommentsList,
} from "./comments.formatter.js";
import { commentsService } from "./comments.service.js";
import type {
	CreateCommentsToolArgsType,
	DeleteCommentToolArgsType,
	GetCommentToolArgsType,
	ListKeyCommentsToolArgsType,
	ListProjectCommentsToolArgsType,
} from "./comments.types.js";

/**
 * @namespace CommentsController
 * @description Controller responsible for handling Lokalise Comments API operations.
 *              Comments are attached to translation keys and allow team collaboration.
 */

/**
 * @function listKeyComments
 * @description Fetches a list of comments for a specific key.
 * @memberof CommentsController
 * @param {ListKeyCommentsToolArgsType} args - Arguments containing project ID, key ID, and pagination options
 * @returns {Promise<ControllerResponse>} A promise that resolves to the standard controller response containing the formatted comments list in Markdown.
 * @throws {McpError} Throws an McpError if the service call fails.
 */
async function listKeyComments(
	args: ListKeyCommentsToolArgsType,
): Promise<ControllerResponse> {
	const methodLogger = Logger.forContext(
		"comments.controller.ts",
		"listKeyComments",
	);
	methodLogger.debug("Getting comments for key...", args);

	try {
		// Validate project ID
		if (!args.projectId || typeof args.projectId !== "string") {
			throw new McpError(
				"Project ID is required and must be a string.",
				ErrorType.API_ERROR,
			);
		}

		// Validate key ID
		if (!args.keyId || typeof args.keyId !== "number") {
			throw new McpError(
				"Key ID is required and must be a number.",
				ErrorType.API_ERROR,
			);
		}

		// Validate pagination parameters
		if (args.limit !== undefined && (args.limit < 1 || args.limit > 5000)) {
			throw new McpError(
				"Invalid limit parameter. Must be between 1 and 5000.",
				ErrorType.API_ERROR,
			);
		}

		if (args.page !== undefined && args.page < 1) {
			throw new McpError(
				"Invalid page parameter. Must be 1 or greater.",
				ErrorType.API_ERROR,
			);
		}

		// Call service layer
		const result = await commentsService.listKeyComments(args);

		// Format response using the formatter
		const formattedContent = formatKeyCommentsList(result, args.keyId);

		methodLogger.debug("Key comments list fetched successfully", {
			projectId: args.projectId,
			keyId: args.keyId,
			commentsCount: result.items?.length || 0,
		});

		return {
			content: formattedContent,
		};
	} catch (error: unknown) {
		throw handleControllerError(error, {
			source: "CommentsController.listKeyComments",
			entityType: "Comments",
			entityId: { project: args.projectId, key: String(args.keyId) },
			operation: "listing",
		});
	}
}

/**
 * @function listProjectComments
 * @description Fetches all comments across a project.
 * @memberof CommentsController
 * @param {ListProjectCommentsToolArgsType} args - Arguments containing project ID and pagination options
 * @returns {Promise<ControllerResponse>} A promise that resolves to the standard controller response containing the formatted comments list in Markdown.
 * @throws {McpError} Throws an McpError if the service call fails.
 */
async function listProjectComments(
	args: ListProjectCommentsToolArgsType,
): Promise<ControllerResponse> {
	const methodLogger = Logger.forContext(
		"comments.controller.ts",
		"listProjectComments",
	);
	methodLogger.debug("Getting all project comments...", args);

	try {
		// Validate project ID
		if (!args.projectId || typeof args.projectId !== "string") {
			throw new McpError(
				"Project ID is required and must be a string.",
				ErrorType.API_ERROR,
			);
		}

		// Validate pagination parameters
		if (args.limit !== undefined && (args.limit < 1 || args.limit > 5000)) {
			throw new McpError(
				"Invalid limit parameter. Must be between 1 and 5000.",
				ErrorType.API_ERROR,
			);
		}

		if (args.page !== undefined && args.page < 1) {
			throw new McpError(
				"Invalid page parameter. Must be 1 or greater.",
				ErrorType.API_ERROR,
			);
		}

		// Call service layer
		const result = await commentsService.listProjectComments(args);

		// Format response using the formatter
		const formattedContent = formatProjectCommentsList(result);

		methodLogger.debug("Project comments list fetched successfully", {
			projectId: args.projectId,
			commentsCount: result.items?.length || 0,
		});

		return {
			content: formattedContent,
		};
	} catch (error: unknown) {
		throw handleControllerError(error, {
			source: "CommentsController.listProjectComments",
			entityType: "Comments",
			entityId: args.projectId,
			operation: "listing",
		});
	}
}

/**
 * @function getComment
 * @description Fetches details of a specific comment.
 * @memberof CommentsController
 * @param {GetCommentToolArgsType} args - Arguments containing project ID, key ID, and comment ID
 * @returns {Promise<ControllerResponse>} A promise that resolves to the formatted comment details.
 * @throws {McpError} Throws an McpError if the service call fails.
 */
async function getComment(
	args: GetCommentToolArgsType,
): Promise<ControllerResponse> {
	const methodLogger = Logger.forContext(
		"comments.controller.ts",
		"getComment",
	);
	methodLogger.debug("Getting comment details...", args);

	try {
		// Validate inputs
		if (!args.projectId || typeof args.projectId !== "string") {
			throw new McpError(
				"Project ID is required and must be a string.",
				ErrorType.API_ERROR,
			);
		}

		if (!args.keyId || typeof args.keyId !== "number") {
			throw new McpError(
				"Key ID is required and must be a number.",
				ErrorType.API_ERROR,
			);
		}

		if (!args.commentId || typeof args.commentId !== "number") {
			throw new McpError(
				"Comment ID is required and must be a number.",
				ErrorType.API_ERROR,
			);
		}

		// Call service layer
		const result = await commentsService.getComment(args);

		// Format response
		const formattedContent = formatCommentDetails(result);

		methodLogger.debug("Comment details fetched successfully", {
			projectId: args.projectId,
			keyId: args.keyId,
			commentId: args.commentId,
		});

		return {
			content: formattedContent,
		};
	} catch (error: unknown) {
		throw handleControllerError(error, {
			source: "CommentsController.getComment",
			entityType: "Comment",
			entityId: {
				project: args.projectId,
				key: String(args.keyId),
				comment: String(args.commentId),
			},
			operation: "retrieving",
		});
	}
}

/**
 * @function createComments
 * @description Creates one or more comments on a key.
 * @memberof CommentsController
 * @param {CreateCommentsToolArgsType} args - Arguments containing project ID, key ID, and comment data
 * @returns {Promise<ControllerResponse>} A promise that resolves to the formatted result.
 * @throws {McpError} Throws an McpError if the service call fails.
 */
async function createComments(
	args: CreateCommentsToolArgsType,
): Promise<ControllerResponse> {
	const methodLogger = Logger.forContext(
		"comments.controller.ts",
		"createComments",
	);
	methodLogger.debug("Creating comments...", args);

	try {
		// Validate inputs
		if (!args.projectId || typeof args.projectId !== "string") {
			throw new McpError(
				"Project ID is required and must be a string.",
				ErrorType.API_ERROR,
			);
		}

		if (!args.keyId || typeof args.keyId !== "number") {
			throw new McpError(
				"Key ID is required and must be a number.",
				ErrorType.API_ERROR,
			);
		}

		if (!args.comments || args.comments.length === 0) {
			throw new McpError(
				"At least one comment is required.",
				ErrorType.API_ERROR,
			);
		}

		// Validate comment content
		for (const comment of args.comments) {
			if (!comment.comment || comment.comment.trim() === "") {
				throw new McpError(
					"Comment text cannot be empty.",
					ErrorType.API_ERROR,
				);
			}
		}

		// Call service layer
		const result = await commentsService.createComments(args);

		// Format response
		const formattedContent = formatCreateCommentsResult(result, args.keyId);

		methodLogger.debug("Comments created successfully", {
			projectId: args.projectId,
			keyId: args.keyId,
			createdCount: result.length,
		});

		return {
			content: formattedContent,
		};
	} catch (error: unknown) {
		throw handleControllerError(error, {
			source: "CommentsController.createComments",
			entityType: "Comments",
			entityId: { project: args.projectId, key: String(args.keyId) },
			operation: "creating",
		});
	}
}

/**
 * @function deleteComment
 * @description Deletes a comment from a key.
 * @memberof CommentsController
 * @param {DeleteCommentToolArgsType} args - Arguments containing project ID, key ID, and comment ID
 * @returns {Promise<ControllerResponse>} A promise that resolves to the formatted deletion result.
 * @throws {McpError} Throws an McpError if the service call fails.
 */
async function deleteComment(
	args: DeleteCommentToolArgsType,
): Promise<ControllerResponse> {
	const methodLogger = Logger.forContext(
		"comments.controller.ts",
		"deleteComment",
	);
	methodLogger.debug("Deleting comment...", args);

	try {
		// Validate inputs
		if (!args.projectId || typeof args.projectId !== "string") {
			throw new McpError(
				"Project ID is required and must be a string.",
				ErrorType.API_ERROR,
			);
		}

		if (!args.keyId || typeof args.keyId !== "number") {
			throw new McpError(
				"Key ID is required and must be a number.",
				ErrorType.API_ERROR,
			);
		}

		if (!args.commentId || typeof args.commentId !== "number") {
			throw new McpError(
				"Comment ID is required and must be a number.",
				ErrorType.API_ERROR,
			);
		}

		// Call service layer
		const result = await commentsService.deleteComment(args);

		// Format response
		const formattedContent = formatDeleteCommentResult(result);

		methodLogger.debug("Comment deleted successfully", {
			projectId: args.projectId,
			keyId: args.keyId,
			commentId: args.commentId,
		});

		return {
			content: formattedContent,
		};
	} catch (error: unknown) {
		throw handleControllerError(error, {
			source: "CommentsController.deleteComment",
			entityType: "Comment",
			entityId: {
				project: args.projectId,
				key: String(args.keyId),
				comment: String(args.commentId),
			},
			operation: "deleting",
		});
	}
}

/**
 * Export the controller functions
 */
const commentsController = {
	listKeyComments,
	listProjectComments,
	getComment,
	createComments,
	deleteComment,
};

export default commentsController;
