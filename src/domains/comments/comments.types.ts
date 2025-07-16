import type {
	Comment,
	CommentData,
	CommentDeleted,
	KeyProjectPagination,
	PaginatedResult,
	ProjectAndKey,
	ProjectWithPagination,
} from "@lokalise/node-api";
import { z } from "zod";

/**
 * Comments domain type definitions and Zod schemas.
 * Comments are attached to translation keys and allow team collaboration.
 */

/**
 * Zod schema for listing comments on a specific key.
 * Requires both project ID and key ID.
 */
export const ListKeyCommentsToolArgs = z
	.object({
		projectId: z.string().describe("Project ID containing the key"),
		keyId: z.number().describe("Key ID to list comments for"),
		limit: z
			.number()
			.int()
			.min(1)
			.max(5000)
			.optional()
			.describe("Number of comments to return (1-5000, default: 100)"),
		page: z
			.number()
			.int()
			.positive()
			.optional()
			.describe("Page number for pagination (default: 1)"),
	})
	.strict();

export type ListKeyCommentsToolArgsType = z.infer<
	typeof ListKeyCommentsToolArgs
>;

/**
 * Zod schema for listing all comments across a project.
 * Requires only project ID.
 */
export const ListProjectCommentsToolArgs = z
	.object({
		projectId: z.string().describe("Project ID to list all comments for"),
		limit: z
			.number()
			.int()
			.min(1)
			.max(5000)
			.optional()
			.describe("Number of comments to return (1-5000, default: 100)"),
		page: z
			.number()
			.int()
			.positive()
			.optional()
			.describe("Page number for pagination (default: 1)"),
	})
	.strict();

export type ListProjectCommentsToolArgsType = z.infer<
	typeof ListProjectCommentsToolArgs
>;

/**
 * Zod schema for getting a single comment.
 * Requires project ID, key ID, and comment ID.
 */
export const GetCommentToolArgs = z
	.object({
		projectId: z.string().describe("Project ID containing the comment"),
		keyId: z.number().describe("Key ID containing the comment"),
		commentId: z.number().describe("Comment ID to get details for"),
	})
	.strict();

export type GetCommentToolArgsType = z.infer<typeof GetCommentToolArgs>;

/**
 * Zod schema for a single comment creation.
 */
export const CommentDataSchema = z
	.object({
		comment: z.string().describe("The comment text"),
	})
	.strict();

/**
 * Zod schema for creating comments.
 * Supports bulk creation by accepting an array of comments.
 * Requires project ID and key ID.
 */
export const CreateCommentsToolArgs = z
	.object({
		projectId: z.string().describe("Project ID to create comments in"),
		keyId: z.number().describe("Key ID to attach comments to"),
		comments: z
			.array(CommentDataSchema)
			.min(1)
			.describe("Array of comments to create"),
	})
	.strict();

export type CreateCommentsToolArgsType = z.infer<typeof CreateCommentsToolArgs>;

/**
 * Zod schema for deleting a comment.
 * Requires project ID, key ID, and comment ID.
 */
export const DeleteCommentToolArgs = z
	.object({
		projectId: z.string().describe("Project ID containing the comment"),
		keyId: z.number().describe("Key ID containing the comment"),
		commentId: z.number().describe("Comment ID to delete"),
	})
	.strict();

export type DeleteCommentToolArgsType = z.infer<typeof DeleteCommentToolArgs>;

/**
 * Re-export SDK types for use in service layer
 */
export type {
	Comment,
	CommentData,
	CommentDeleted,
	ProjectAndKey,
	KeyProjectPagination,
	ProjectWithPagination,
	PaginatedResult,
};

/**
 * Comment entity structure returned by the API
 */
export interface CommentEntity extends Comment {
	comment_id: number;
	key_id: number;
	comment: string;
	added_by: number;
	added_by_email: string;
	added_at: string;
	added_at_timestamp: number;
}

/**
 * Response type for listing comments
 */
export type ListCommentsResponse = PaginatedResult<Comment>;

/**
 * Response type for creating comments (returns array)
 */
export type CreateCommentsResponse = Comment[];

/**
 * Response type for getting a single comment
 */
export type GetCommentResponse = Comment;

/**
 * Response type for deleting a comment
 */
export type DeleteCommentResponse = CommentDeleted;
