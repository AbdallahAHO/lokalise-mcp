import { z } from "zod";

/**
 * Zod schema for the list system languages tool arguments.
 */
export const ListSystemLanguagesToolArgs = z
	.object({
		limit: z
			.number()
			.optional()
			.describe("Number of languages to return (1-500, default: 100)"),
		page: z
			.number()
			.optional()
			.describe("Page number for pagination (default: 1)"),
	})
	.strict();

/**
 * TypeScript type inferred from the ListSystemLanguagesToolArgs Zod schema.
 */
export type ListSystemLanguagesToolArgsType = z.infer<
	typeof ListSystemLanguagesToolArgs
>;

/**
 * Zod schema for the list project languages tool arguments.
 */
export const ListProjectLanguagesToolArgs = z
	.object({
		projectId: z.string().describe("Project ID to list languages for"),
		includeProgress: z
			.boolean()
			.optional()
			.default(false)
			.describe("Include translation progress percentages for each language"),
	})
	.strict();

/**
 * TypeScript type inferred from the ListProjectLanguagesToolArgs Zod schema.
 */
export type ListProjectLanguagesToolArgsType = z.infer<
	typeof ListProjectLanguagesToolArgs
>;

/**
 * Zod schema for the create language data.
 */
export const CreateLanguageDataSchema = z
	.object({
		lang_iso: z.string().describe("Language ISO code (e.g., 'en', 'fr', 'de')"),
		custom_iso: z.string().optional().describe("Custom ISO code"),
		custom_name: z.string().optional().describe("Custom language name"),
		custom_plural_forms: z
			.array(z.string())
			.optional()
			.describe("Custom plural forms"),
	})
	.strict();

/**
 * Zod schema for the add project languages tool arguments.
 */
export const AddProjectLanguagesToolArgs = z
	.object({
		projectId: z.string().describe("Project ID to add languages to"),
		languages: z
			.array(CreateLanguageDataSchema)
			.min(1)
			.max(100)
			.describe("Array of language objects to add (1-100 languages)"),
	})
	.strict();

/**
 * TypeScript type inferred from the AddProjectLanguagesToolArgs Zod schema.
 */
export type AddProjectLanguagesToolArgsType = z.infer<
	typeof AddProjectLanguagesToolArgs
>;

/**
 * Zod schema for the get language tool arguments.
 */
export const GetLanguageToolArgs = z
	.object({
		projectId: z.string().describe("Project ID containing the language"),
		languageId: z.number().describe("Language ID to get details for"),
	})
	.strict();

/**
 * TypeScript type inferred from the GetLanguageToolArgs Zod schema.
 */
export type GetLanguageToolArgsType = z.infer<typeof GetLanguageToolArgs>;

/**
 * Zod schema for the update language tool arguments.
 */
export const UpdateLanguageToolArgs = z
	.object({
		projectId: z.string().describe("Project ID containing the language"),
		languageId: z.number().describe("Language ID to update"),
		languageData: z
			.object({
				lang_iso: z.string().optional().describe("Updated language ISO code"),
				lang_name: z.string().optional().describe("Updated language name"),
				plural_forms: z
					.array(z.string())
					.optional()
					.describe("Updated plural forms"),
			})
			.describe("Language data to update"),
	})
	.strict();

/**
 * TypeScript type inferred from the UpdateLanguageToolArgs Zod schema.
 */
export type UpdateLanguageToolArgsType = z.infer<typeof UpdateLanguageToolArgs>;

/**
 * Zod schema for the remove language tool arguments.
 */
export const RemoveLanguageToolArgs = z
	.object({
		projectId: z.string().describe("Project ID containing the language"),
		languageId: z.number().describe("Language ID to remove"),
	})
	.strict();

/**
 * TypeScript type inferred from the RemoveLanguageToolArgs Zod schema.
 */
export type RemoveLanguageToolArgsType = z.infer<typeof RemoveLanguageToolArgs>;
