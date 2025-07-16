/**
 * Comments Service
 *
 * Service layer for interacting with Lokalise Comments API.
 * Handles all API communication and data transformation.
 */

import type {
	Comment,
	CommentData,
	CommentDeleted,
	PaginatedResult,
} from "@lokalise/node-api";
import { createUnexpectedError } from "../../shared/utils/error.util.js";
import { Logger } from "../../shared/utils/logger.util.js";
import { getLokaliseApi } from "../../shared/utils/lokalise-api.util.js";
import type {
	CreateCommentsToolArgsType,
	DeleteCommentToolArgsType,
	GetCommentToolArgsType,
	ListKeyCommentsToolArgsType,
	ListProjectCommentsToolArgsType,
} from "./comments.types.js";

const logger = Logger.forContext("comments.service.ts");

// ============================================================================
// Service Implementation
// ============================================================================

/**
 * Comments service for Lokalise API operations
 */
export const commentsService = {
	/**
	 * List comments for a specific key
	 */
	async listKeyComments(
		args: ListKeyCommentsToolArgsType,
	): Promise<PaginatedResult<Comment>> {
		const methodLogger = logger.forMethod("listKeyComments");
		methodLogger.info("Listing comments for key", {
			projectId: args.projectId,
			keyId: args.keyId,
			page: args.page,
			limit: args.limit,
		});

		try {
			const api = getLokaliseApi();
			const result = await api.comments().list({
				project_id: args.projectId,
				key_id: args.keyId,
				page: args.page,
				limit: args.limit,
			});

			methodLogger.info("Listed key comments successfully", {
				projectId: args.projectId,
				keyId: args.keyId,
				count: result.items.length,
				totalResults: result.totalResults,
			});

			return result;
		} catch (error) {
			methodLogger.error("Failed to list key comments", { error, args });
			throw createUnexpectedError(
				`Failed to list comments for key ${args.keyId} in project ${args.projectId}`,
				error,
			);
		}
	},

	/**
	 * List all comments across a project
	 */
	async listProjectComments(
		args: ListProjectCommentsToolArgsType,
	): Promise<PaginatedResult<Comment>> {
		const methodLogger = logger.forMethod("listProjectComments");
		methodLogger.info("Listing all project comments", {
			projectId: args.projectId,
			page: args.page,
			limit: args.limit,
		});

		try {
			const api = getLokaliseApi();
			const result = await api.comments().list_project_comments({
				project_id: args.projectId,
				page: args.page,
				limit: args.limit,
			});

			methodLogger.info("Listed project comments successfully", {
				projectId: args.projectId,
				count: result.items.length,
				totalResults: result.totalResults,
			});

			return result;
		} catch (error) {
			methodLogger.error("Failed to list project comments", { error, args });
			throw createUnexpectedError(
				`Failed to list comments for project ${args.projectId}`,
				error,
			);
		}
	},

	/**
	 * Get a specific comment
	 */
	async getComment(args: GetCommentToolArgsType): Promise<Comment> {
		const methodLogger = logger.forMethod("getComment");
		methodLogger.info("Getting comment", {
			projectId: args.projectId,
			keyId: args.keyId,
			commentId: args.commentId,
		});

		try {
			const api = getLokaliseApi();
			const result = await api.comments().get(args.commentId, {
				project_id: args.projectId,
				key_id: args.keyId,
			});

			methodLogger.info("Retrieved comment successfully", {
				projectId: args.projectId,
				keyId: args.keyId,
				commentId: args.commentId,
			});

			return result;
		} catch (error) {
			methodLogger.error("Failed to get comment", { error, args });
			throw createUnexpectedError(
				`Failed to get comment ${args.commentId} from key ${args.keyId} in project ${args.projectId}`,
				error,
			);
		}
	},

	/**
	 * Create comments on a key
	 */
	async createComments(args: CreateCommentsToolArgsType): Promise<Comment[]> {
		const methodLogger = logger.forMethod("createComments");
		methodLogger.info("Creating comments", {
			projectId: args.projectId,
			keyId: args.keyId,
			count: args.comments.length,
		});

		try {
			const api = getLokaliseApi();

			// Map our schema to SDK types
			const commentData: CommentData[] = args.comments.map((item) => ({
				comment: item.comment,
			}));

			const result = await api.comments().create(commentData, {
				project_id: args.projectId,
				key_id: args.keyId,
			});

			methodLogger.info("Created comments successfully", {
				projectId: args.projectId,
				keyId: args.keyId,
				created: result.length,
			});

			return result;
		} catch (error) {
			methodLogger.error("Failed to create comments", { error, args });
			throw createUnexpectedError(
				`Failed to create comments on key ${args.keyId} in project ${args.projectId}`,
				error,
			);
		}
	},

	/**
	 * Delete a comment from a key
	 */
	async deleteComment(
		args: DeleteCommentToolArgsType,
	): Promise<CommentDeleted> {
		const methodLogger = logger.forMethod("deleteComment");
		methodLogger.info("Deleting comment", {
			projectId: args.projectId,
			keyId: args.keyId,
			commentId: args.commentId,
		});

		try {
			const api = getLokaliseApi();
			const result = await api.comments().delete(args.commentId, {
				project_id: args.projectId,
				key_id: args.keyId,
			});

			methodLogger.info("Deleted comment successfully", {
				projectId: args.projectId,
				keyId: args.keyId,
				commentId: args.commentId,
			});

			return result;
		} catch (error) {
			methodLogger.error("Failed to delete comment", { error, args });
			throw createUnexpectedError(
				`Failed to delete comment ${args.commentId} from key ${args.keyId} in project ${args.projectId}`,
				error,
			);
		}
	},
};
