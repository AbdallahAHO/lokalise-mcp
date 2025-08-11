import type {
	PaginatedResult,
	TeamUser,
	TeamUserDeleted,
	TeamUserParams,
} from "@lokalise/node-api";
import { z } from "zod";

/**
 * Teamusers domain type definitions and Zod schemas.
 * Generated on 2025-08-11 for Team users management for Lokalise teams.
 */

// Re-export SDK types for convenience
export type { TeamUser, TeamUserDeleted, TeamUserParams, PaginatedResult };

/**
 * Zod schema for the list team users tool arguments.
 */
export const ListTeamusersToolArgs = z
	.object({
		teamId: z.string().describe("Team ID to list users for"),
		limit: z
			.number()
			.int()
			.min(1)
			.max(100)
			.optional()
			.describe("Number of users to return (1-100, default: 100)"),
		page: z
			.number()
			.int()
			.positive()
			.optional()
			.describe("Page number for pagination (default: 1)"),
	})
	.strict();

export type ListTeamusersToolArgsType = z.infer<typeof ListTeamusersToolArgs>;

/**
 * Zod schema for the get team user details tool arguments.
 */
export const GetTeamusersToolArgs = z
	.object({
		teamId: z.string().describe("Team ID containing the user"),
		userId: z
			.union([z.string(), z.number()])
			.describe("User ID to get details for"),
	})
	.strict();

export type GetTeamusersToolArgsType = z.infer<typeof GetTeamusersToolArgs>;

/**
 * Zod schema for the update team user tool arguments.
 */
export const UpdateTeamusersToolArgs = z
	.object({
		teamId: z.string().describe("Team ID containing the user"),
		userId: z.union([z.string(), z.number()]).describe("User ID to update"),
		role: z
			.enum(["owner", "admin", "member", "biller"])
			.describe("New role for the user"),
	})
	.strict();

export type UpdateTeamusersToolArgsType = z.infer<
	typeof UpdateTeamusersToolArgs
>;

/**
 * Zod schema for the delete team user tool arguments.
 */
export const DeleteTeamusersToolArgs = z
	.object({
		teamId: z.string().describe("Team ID containing the user"),
		userId: z.union([z.string(), z.number()]).describe("User ID to delete"),
	})
	.strict();

export type DeleteTeamusersToolArgsType = z.infer<
	typeof DeleteTeamusersToolArgs
>;
