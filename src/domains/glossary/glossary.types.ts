import type {
	BulkResult,
	CursorPaginatedResult,
	GlossaryTerm,
} from "@lokalise/node-api";
import { z } from "zod";

// Define local types since they're not exported from the SDK
export interface CreateTermsParams {
	terms: Array<{
		term: string;
		description: string;
		caseSensitive: boolean;
		translatable: boolean;
		forbidden: boolean;
		translations?: Array<{
			langId?: number;
			translation?: string;
			description?: string;
		}>;
		tags?: string[];
	}>;
}

export interface UpdateTermsParams {
	terms: Array<{
		id: number;
		term?: string;
		description?: string;
		caseSensitive?: boolean;
		translatable?: boolean;
		forbidden?: boolean;
		translations?: Array<{
			langId?: number;
			translation?: string;
			description?: string;
		}>;
		tags?: string[];
	}>;
}

export interface TermsDeleted {
	deleted: {
		count: number;
		ids: number[];
	};
	failed: Array<{
		count: number;
		ids: number[];
		message: string;
	}>;
}

/**
 * Glossary domain type definitions and Zod schemas.
 * Generated on 2025-07-10 for Glossary terms management for consistent translations.
 */

/**
 * Zod schema for glossary term translation.
 */
export const GlossaryTranslationSchema = z.object({
	langId: z.number().describe("Language ID for the translation (required)"),
	translation: z
		.string()
		.optional()
		.describe("The translated term in the specified language"),
	description: z
		.string()
		.optional()
		.describe("Description or context for the translation"),
});

/**
 * Zod schema for the list glossary terms tool arguments.
 */
export const ListGlossaryToolArgs = z
	.object({
		projectId: z.string().describe("Project ID to list glossary terms for"),
		limit: z
			.number()
			.int()
			.min(1)
			.max(5000)
			.optional()
			.describe("Number of glossary terms to return (1-5000, default: 100)"),
		cursor: z
			.string()
			.optional()
			.describe("Cursor for pagination. Use nextCursor from previous response"),
	})
	.strict();

export type ListGlossaryToolArgsType = z.infer<typeof ListGlossaryToolArgs>;

/**
 * Zod schema for the get glossary term details tool arguments.
 */
export const GetGlossaryToolArgs = z
	.object({
		projectId: z.string().describe("Project ID containing the glossary term"),
		termId: z.number().describe("Glossary term ID to get details for"),
	})
	.strict();

export type GetGlossaryToolArgsType = z.infer<typeof GetGlossaryToolArgs>;

/**
 * Zod schema for creating a single glossary term.
 */
export const CreateGlossaryTermSchema = z.object({
	term: z
		.string()
		.describe("The glossary term text (e.g., brand name, technical term)"),
	description: z.string().describe("Description or definition of the term"),
	caseSensitive: z
		.boolean()
		.describe("Whether term matching should be case-sensitive"),
	translatable: z
		.boolean()
		.describe("Whether the term can be translated or should remain unchanged"),
	forbidden: z
		.boolean()
		.describe(
			"Whether this term should be flagged as forbidden in translations",
		),
	translations: z
		.array(GlossaryTranslationSchema)
		.optional()
		.describe("Translations of the term in different languages"),
	tags: z
		.array(z.string())
		.optional()
		.describe(
			"Tags for categorizing the term (e.g., 'brand', 'technical', 'legal')",
		),
});

/**
 * Zod schema for the create glossary terms tool arguments.
 */
export const CreateGlossaryToolArgs = z
	.object({
		projectId: z.string().describe("Project ID to create glossary terms in"),
		terms: z
			.array(CreateGlossaryTermSchema)
			.min(1)
			.describe("Array of glossary terms to create (supports bulk creation)"),
	})
	.strict();

export type CreateGlossaryToolArgsType = z.infer<typeof CreateGlossaryToolArgs>;

/**
 * Zod schema for updating a glossary term.
 */
export const UpdateGlossaryTermSchema = z.object({
	id: z.number().describe("The ID of the glossary term to update"),
	term: z.string().optional().describe("Updated term text"),
	description: z.string().optional().describe("Updated description"),
	caseSensitive: z
		.boolean()
		.optional()
		.describe("Updated case sensitivity setting"),
	translatable: z.boolean().optional().describe("Updated translatable setting"),
	forbidden: z.boolean().optional().describe("Updated forbidden setting"),
	translations: z
		.array(GlossaryTranslationSchema)
		.optional()
		.describe("Updated translations"),
	tags: z.array(z.string()).optional().describe("Updated tags"),
});

/**
 * Zod schema for the update glossary terms tool arguments.
 */
export const UpdateGlossaryToolArgs = z
	.object({
		projectId: z.string().describe("Project ID containing the glossary terms"),
		terms: z
			.array(UpdateGlossaryTermSchema)
			.min(1)
			.describe("Array of glossary terms to update (supports bulk updates)"),
	})
	.strict();

export type UpdateGlossaryToolArgsType = z.infer<typeof UpdateGlossaryToolArgs>;

/**
 * Zod schema for the delete glossary terms tool arguments.
 */
export const DeleteGlossaryToolArgs = z
	.object({
		projectId: z.string().describe("Project ID containing the glossary terms"),
		termIds: z
			.array(z.number())
			.min(1)
			.describe(
				"Array of glossary term IDs to delete (supports bulk deletion)",
			),
	})
	.strict();

export type DeleteGlossaryToolArgsType = z.infer<typeof DeleteGlossaryToolArgs>;

// Re-export SDK types for convenience
export type { GlossaryTerm, BulkResult, CursorPaginatedResult };

/**
 * Type for glossary term with full details including translations.
 */
export interface GlossaryTermWithTranslations extends GlossaryTerm {
	translations: Array<{
		langId: number;
		langName: string;
		langIso: string;
		translation: string;
		description: string;
	}>;
}
