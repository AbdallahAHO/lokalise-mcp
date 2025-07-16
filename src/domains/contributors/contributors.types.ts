import { z } from "zod";

/**
 * Contributors domain type definitions and Zod schemas.
 * Generated on 2025-07-08 for Team member and contributor management.
 */

// ============================================================================
// Zod Schemas
// ============================================================================

/**
 * Contributor rights validation
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
 * Contributor language permissions
 */
export const ContributorLanguagesSchema = z.object({
	lang_iso: z
		.string()
		.min(2, "Language ISO code must be at least 2 characters"),
	is_writable: z.boolean().optional(),
});

/**
 * Zod schema for the list contributors tool arguments.
 */
export const ListContributorsToolArgs = z
	.object({
		projectId: z.string().describe("Project ID to list contributors for"),
		limit: z
			.number()
			.optional()
			.describe("Number of contributors to return (1-100, default: 100)"),
		page: z
			.number()
			.optional()
			.describe("Page number for pagination (default: 1)"),
	})
	.strict();

export type ListContributorsToolArgsType = z.infer<
	typeof ListContributorsToolArgs
>;

/**
 * Zod schema for the get contributor details tool arguments.
 */
export const GetContributorToolArgs = z
	.object({
		projectId: z.string().describe("Project ID containing the contributor"),
		contributorId: z
			.union([z.string(), z.number()])
			.describe("Contributor ID to get details for"),
	})
	.strict();

export type GetContributorToolArgsType = z.infer<typeof GetContributorToolArgs>;

/**
 * Zod schema for the add contributors tool arguments.
 */
export const AddContributorsToolArgs = z
	.object({
		projectId: z.string().describe("Project ID to add contributors to"),
		contributors: z
			.array(
				z.object({
					email: z.string().email("Valid email is required"),
					fullname: z.string().optional(),
					is_admin: z
						.boolean()
						.optional()
						.describe("Deprecated: Use admin_rights instead"),
					is_reviewer: z
						.boolean()
						.optional()
						.describe("Deprecated: Use admin_rights instead"),
					languages: z
						.array(ContributorLanguagesSchema)
						.min(1, "At least one language is required"),
					admin_rights: z.array(ContributorRightsSchema).optional(),
				}),
			)
			.min(1, "At least one contributor is required"),
	})
	.strict();

export type AddContributorsToolArgsType = z.infer<
	typeof AddContributorsToolArgs
>;

/**
 * Zod schema for the get current user contributor tool arguments.
 */
export const GetCurrentUserToolArgs = z
	.object({
		projectId: z
			.string()
			.describe("Project ID to get current user's contributor profile"),
	})
	.strict();

export type GetCurrentUserToolArgsType = z.infer<typeof GetCurrentUserToolArgs>;

/**
 * Zod schema for the update contributor tool arguments.
 */
export const UpdateContributorToolArgs = z
	.object({
		projectId: z.string().describe("Project ID containing the contributor"),
		contributorId: z
			.union([z.string(), z.number()])
			.describe("Contributor ID to update"),
		is_admin: z
			.boolean()
			.optional()
			.describe("Deprecated: Use admin_rights instead"),
		is_reviewer: z
			.boolean()
			.optional()
			.describe("Deprecated: Use admin_rights instead"),
		languages: z.array(ContributorLanguagesSchema).optional(),
		admin_rights: z.array(ContributorRightsSchema).optional(),
	})
	.strict();

export type UpdateContributorToolArgsType = z.infer<
	typeof UpdateContributorToolArgs
>;

/**
 * Zod schema for the remove contributor tool arguments.
 */
export const RemoveContributorToolArgs = z
	.object({
		projectId: z.string().describe("Project ID containing the contributor"),
		contributorId: z
			.union([z.string(), z.number()])
			.describe("Contributor ID to remove"),
	})
	.strict();

export type RemoveContributorToolArgsType = z.infer<
	typeof RemoveContributorToolArgs
>;

// ============================================================================
// Type Re-exports
// ============================================================================

// Re-export SDK types for convenience
export type {
	ContributorCreateData,
	ContributorDeleted,
	ContributorLanguages,
	ContributorRights,
	ContributorUpdateData,
} from "@lokalise/node-api";
