import type {
	PaginatedResult,
	UserGroup,
	UserGroupDeleted,
	UserGroupParams,
} from "@lokalise/node-api";
import { z } from "zod";

/**
 * Usergroups domain type definitions and Zod schemas.
 * Generated on 2025-08-11 for User groups management for team-based permissions.
 */

// Re-export SDK types for convenience
export type { UserGroup, UserGroupParams, UserGroupDeleted, PaginatedResult };

/**
 * Zod schema for contributor rights
 */
export const ContributorRightsSchema = z.enum([
	"upload",
	"activity",
	"download",
	"settings",
	"create_branches",
	"statistics",
	"keys",
	"screenshots",
	"glossary",
	"contributors",
	"languages",
	"tasks",
]);

/**
 * Zod schema for language permissions
 */
export const LanguagePermissionSchema = z.object({
	langId: z.number().describe("Language ID"),
	langIso: z.string().describe("Language ISO code"),
	langName: z.string().describe("Language name"),
	isWritable: z.boolean().describe("Whether the language is writable"),
});

/**
 * Zod schema for the list user groups tool arguments.
 */
export const ListUsergroupsToolArgs = z
	.object({
		teamId: z.string().describe("Team ID to list user groups for"),
		limit: z
			.number()
			.int()
			.min(1)
			.max(100)
			.optional()
			.describe("Number of user groups to return (1-100, default: 100)"),
		page: z
			.number()
			.int()
			.positive()
			.optional()
			.describe("Page number for pagination (default: 1)"),
	})
	.strict();

export type ListUsergroupsToolArgsType = z.infer<typeof ListUsergroupsToolArgs>;

/**
 * Zod schema for the get user group details tool arguments.
 */
export const GetUsergroupsToolArgs = z
	.object({
		teamId: z.string().describe("Team ID containing the user group"),
		groupId: z
			.union([z.string(), z.number()])
			.describe("User group ID to get details for"),
	})
	.strict();

export type GetUsergroupsToolArgsType = z.infer<typeof GetUsergroupsToolArgs>;

/**
 * Zod schema for the create user group tool arguments.
 */
export const CreateUsergroupsToolArgs = z
	.object({
		teamId: z.string().describe("Team ID to create user group in"),
		name: z.string().describe("Name of the user group"),
		isReviewer: z.boolean().describe("Whether group members are reviewers"),
		isAdmin: z.boolean().describe("Whether group members are admins"),
		adminRights: z
			.array(ContributorRightsSchema)
			.optional()
			.describe("Admin rights for the group if isAdmin is true"),
		languages: z
			.array(
				z.object({
					langId: z.number().describe("Language ID"),
					isWritable: z
						.boolean()
						.optional()
						.describe("Whether language is writable"),
				}),
			)
			.optional()
			.describe("Language permissions for the group"),
		projects: z
			.array(z.union([z.string(), z.number()]))
			.optional()
			.describe("Initial projects to assign to the group"),
		members: z
			.array(z.union([z.string(), z.number()]))
			.optional()
			.describe("Initial members to add to the group"),
	})
	.strict();

export type CreateUsergroupsToolArgsType = z.infer<
	typeof CreateUsergroupsToolArgs
>;

/**
 * Zod schema for the update user group tool arguments.
 */
export const UpdateUsergroupsToolArgs = z
	.object({
		teamId: z.string().describe("Team ID containing the user group"),
		groupId: z
			.union([z.string(), z.number()])
			.describe("User group ID to update"),
		name: z.string().describe("New name for the group"),
		isReviewer: z.boolean().describe("Whether group members are reviewers"),
		isAdmin: z.boolean().describe("Whether group members are admins"),
		adminRights: z
			.array(ContributorRightsSchema)
			.optional()
			.describe("Admin rights for the group if isAdmin is true"),
		languages: z
			.array(
				z.object({
					langId: z.number().describe("Language ID"),
					isWritable: z
						.boolean()
						.optional()
						.describe("Whether language is writable"),
				}),
			)
			.optional()
			.describe("Language permissions for the group"),
	})
	.strict();

export type UpdateUsergroupsToolArgsType = z.infer<
	typeof UpdateUsergroupsToolArgs
>;

/**
 * Zod schema for the delete user group tool arguments.
 */
export const DeleteUsergroupsToolArgs = z
	.object({
		teamId: z.string().describe("Team ID containing the user group"),
		groupId: z
			.union([z.string(), z.number()])
			.describe("User group ID to delete"),
	})
	.strict();

export type DeleteUsergroupsToolArgsType = z.infer<
	typeof DeleteUsergroupsToolArgs
>;

/**
 * Zod schema for add members to group tool arguments.
 */
export const AddMembersToolArgs = z
	.object({
		teamId: z.string().describe("Team ID containing the user group"),
		groupId: z.union([z.string(), z.number()]).describe("User group ID"),
		userIds: z
			.array(z.union([z.string(), z.number()]))
			.min(1)
			.describe("User IDs to add to the group"),
	})
	.strict();

export type AddMembersToolArgsType = z.infer<typeof AddMembersToolArgs>;

/**
 * Zod schema for remove members from group tool arguments.
 */
export const RemoveMembersToolArgs = z
	.object({
		teamId: z.string().describe("Team ID containing the user group"),
		groupId: z.union([z.string(), z.number()]).describe("User group ID"),
		userIds: z
			.array(z.union([z.string(), z.number()]))
			.min(1)
			.describe("User IDs to remove from the group"),
	})
	.strict();

export type RemoveMembersToolArgsType = z.infer<typeof RemoveMembersToolArgs>;

/**
 * Zod schema for add projects to group tool arguments.
 */
export const AddProjectsToolArgs = z
	.object({
		teamId: z.string().describe("Team ID containing the user group"),
		groupId: z.union([z.string(), z.number()]).describe("User group ID"),
		projectIds: z
			.array(z.union([z.string(), z.number()]))
			.min(1)
			.describe("Project IDs to add to the group"),
	})
	.strict();

export type AddProjectsToolArgsType = z.infer<typeof AddProjectsToolArgs>;

/**
 * Zod schema for remove projects from group tool arguments.
 */
export const RemoveProjectsToolArgs = z
	.object({
		teamId: z.string().describe("Team ID containing the user group"),
		groupId: z.union([z.string(), z.number()]).describe("User group ID"),
		projectIds: z
			.array(z.union([z.string(), z.number()]))
			.min(1)
			.describe("Project IDs to remove from the group"),
	})
	.strict();

export type RemoveProjectsToolArgsType = z.infer<typeof RemoveProjectsToolArgs>;
