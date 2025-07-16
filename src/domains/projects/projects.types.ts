import { z } from "zod";

/**
 * Zod schema for the list projects tool arguments.
 */
export const ListProjectsToolArgs = z
	.object({
		limit: z
			.number()
			.optional()
			.describe("Number of projects to return (1-500, default: 100)"),
		page: z
			.number()
			.optional()
			.describe("Page number for pagination (default: 1)"),
		includeStats: z
			.boolean()
			.optional()
			.default(false)
			.describe("Include detailed project statistics"),
	})
	.strict();

/**
 * TypeScript type inferred from the ListProjectsToolArgs Zod schema.
 */
export type ListProjectsToolArgsType = z.infer<typeof ListProjectsToolArgs>;

/**
 * Zod schema for the get project details tool arguments.
 */
export const GetProjectDetailsToolArgs = z
	.object({
		projectId: z.string().describe("Project ID to get details for"),
		includeLanguages: z
			.boolean()
			.optional()
			.default(false)
			.describe("Include detailed language information and completion rates"),
		includeKeysSummary: z
			.boolean()
			.optional()
			.default(false)
			.describe("Include summary of keys (total, translated, missing)"),
	})
	.strict();

/**
 * TypeScript type inferred from the GetProjectDetailsToolArgs Zod schema.
 */
export type GetProjectDetailsToolArgsType = z.infer<
	typeof GetProjectDetailsToolArgs
>;

/**
 * Zod schema for the create project tool arguments.
 */
export const CreateProjectToolArgs = z
	.object({
		name: z.string().min(1).describe("Name of the project to create"),
		description: z
			.string()
			.optional()
			.describe("Optional description for the project"),
		base_lang_iso: z
			.string()
			.optional()
			.default("en")
			.describe("Base language ISO code (default: 'en')"),
	})
	.strict();

/**
 * TypeScript type inferred from the CreateProjectToolArgs Zod schema.
 */
export type CreateProjectToolArgsType = z.infer<typeof CreateProjectToolArgs>;

/**
 * Zod schema for the update project tool arguments.
 */
export const UpdateProjectToolArgs = z
	.object({
		projectId: z.string().describe("Project ID to update"),
		projectData: z
			.object({
				name: z.string().optional().describe("Updated project name"),
				description: z
					.string()
					.optional()
					.describe("Updated project description"),
			})
			.describe("Project data to update"),
	})
	.strict();

/**
 * TypeScript type inferred from the UpdateProjectToolArgs Zod schema.
 */
export type UpdateProjectToolArgsType = z.infer<typeof UpdateProjectToolArgs>;

/**
 * Zod schema for the delete project tool arguments.
 */
export const DeleteProjectToolArgs = z
	.object({
		projectId: z.string().describe("Project ID to delete"),
	})
	.strict();

/**
 * TypeScript type inferred from the DeleteProjectToolArgs Zod schema.
 */
export type DeleteProjectToolArgsType = z.infer<typeof DeleteProjectToolArgs>;

/**
 * Zod schema for the empty project tool arguments.
 */
export const EmptyProjectToolArgs = z
	.object({
		projectId: z.string().describe("Project ID to empty"),
	})
	.strict();

/**
 * TypeScript type inferred from the EmptyProjectToolArgs Zod schema.
 */
export type EmptyProjectToolArgsType = z.infer<typeof EmptyProjectToolArgs>;
