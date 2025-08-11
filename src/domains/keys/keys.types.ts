import { z } from "zod";

/**
 * Zod schema for the list keys tool arguments.
 */
export const ListKeysToolArgs = z
	.object({
		projectId: z.string().describe("Project ID to list keys for"),
		limit: z
			.number()
			.optional()
			.describe("Number of keys to return (1-5000, default: 100)"),
		page: z
			.number()
			.optional()
			.describe("Page number for pagination (default: 1)"),
		includeTranslations: z
			.boolean()
			.optional()
			.default(false)
			.describe("Include translation data for each key"),
		filterKeys: z
			.array(z.string())
			.optional()
			.describe("Filter by specific key names"),
		filterPlatforms: z
			.array(z.enum(["ios", "android", "web", "other"]))
			.optional()
			.describe("Filter by platforms (ios, android, web, other)"),
		filterFilenames: z
			.array(z.string())
			.optional()
			.describe(
				"Filter by specific filenames (e.g., ['document.docx', 'strings.json'])",
			),
	})
	.strict();

export type ListKeysToolArgsType = z.infer<typeof ListKeysToolArgs>;

/**
 * Zod schema for the get key details tool arguments.
 */
export const GetKeyToolArgs = z
	.object({
		projectId: z.string().describe("Project ID containing the key"),
		keyId: z.number().describe("Key ID to get details for"),
	})
	.strict();

export type GetKeyToolArgsType = z.infer<typeof GetKeyToolArgs>;

/**
 * Zod schema for the create keys tool arguments.
 */
export const CreateKeysToolArgs = z
	.object({
		projectId: z.string().describe("Project ID to create keys in"),
		keys: z
			.array(
				z.object({
					key_name: z.string().describe("Name of the key"),
					description: z
						.string()
						.optional()
						.describe("Description of the translation key"),
					platforms: z
						.array(z.enum(["ios", "android", "web", "other"]))
						.min(1)
						.describe("Platforms this key belongs to (required)"),
					translations: z
						.array(
							z.object({
								language_iso: z.string().describe("Language ISO code"),
								translation: z.string().describe("Translation text"),
							}),
						)
						.optional()
						.describe("Initial translations for the key"),
					tags: z
						.array(z.string())
						.optional()
						.describe("Tags to organize the key"),
				}),
			)
			.min(1)
			.max(1000)
			.describe("Array of key objects to create (1-1000 keys)"),
	})
	.strict();

export type CreateKeysToolArgsType = z.infer<typeof CreateKeysToolArgs>;

/**
 * Zod schema for the update key tool arguments.
 */
export const UpdateKeyToolArgs = z
	.object({
		projectId: z.string().describe("Project ID containing the key"),
		keyId: z.number().describe("Key ID to update"),
		keyData: z
			.object({
				description: z.string().optional().describe("New description"),
				platforms: z
					.array(z.enum(["ios", "android", "web", "other"]))
					.optional()
					.describe("New platforms for the key"),
				tags: z.array(z.string()).optional().describe("New tags for the key"),
			})
			.describe("Key data to update"),
	})
	.strict();

export type UpdateKeyToolArgsType = z.infer<typeof UpdateKeyToolArgs>;

/**
 * Zod schema for the delete key tool arguments.
 */
export const DeleteKeyToolArgs = z
	.object({
		projectId: z.string().describe("Project ID containing the key"),
		keyId: z.number().describe("Key ID to delete"),
	})
	.strict();

export type DeleteKeyToolArgsType = z.infer<typeof DeleteKeyToolArgs>;

/**
 * Zod schema for the bulk update keys tool arguments.
 */
export const BulkUpdateKeysToolArgs = z
	.object({
		projectId: z.string().describe("Project ID containing the keys"),
		keys: z
			.array(
				z.object({
					keyId: z.number().describe("Key ID to update"),
					description: z.string().optional().describe("New description"),
					platforms: z
						.array(z.enum(["ios", "android", "web", "other"]))
						.optional()
						.describe("New platforms for the key"),
					tags: z.array(z.string()).optional().describe("New tags for the key"),
				}),
			)
			.min(1)
			.max(1000)
			.describe("Array of key updates (1-1000 keys)"),
	})
	.strict();

export type BulkUpdateKeysToolArgsType = z.infer<typeof BulkUpdateKeysToolArgs>;

/**
 * Zod schema for the bulk delete keys tool arguments.
 */
export const BulkDeleteKeysToolArgs = z
	.object({
		projectId: z.string().describe("Project ID containing the keys"),
		keyIds: z
			.array(z.number())
			.min(1)
			.max(1000)
			.describe("Array of key IDs to delete (1-1000 keys)"),
	})
	.strict();

export type BulkDeleteKeysToolArgsType = z.infer<typeof BulkDeleteKeysToolArgs>;
