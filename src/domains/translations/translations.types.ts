import type {
	CursorPaginatedResult,
	Translation,
	TranslationStatus,
} from "@lokalise/node-api";
import { z } from "zod";

/**
 * Translations domain type definitions and Zod schemas.
 * Generated on 2025-07-08 for Translation content management.
 */

/**
 * Zod schema for the list translations tool arguments.
 * Translations use cursor pagination, not standard pagination.
 */
export const ListTranslationsToolArgs = z
	.object({
		projectId: z.string().describe("Project ID to list translations for"),
		limit: z
			.number()
			.int()
			.min(1)
			.max(5000)
			.optional()
			.describe("Number of translations to return (1-5000, default: 100)"),
		cursor: z
			.string()
			.optional()
			.describe("Cursor for pagination (from previous response)"),
		filterLangId: z
			.number()
			.optional()
			.describe("Filter by language ID (numeric, not ISO code)"),
		filterIsReviewed: z
			.enum(["0", "1"])
			.optional()
			.describe("Filter by review status (0=not reviewed, 1=reviewed)"),
		filterUnverified: z
			.enum(["0", "1"])
			.optional()
			.describe("Filter by verification status (0=verified, 1=unverified)"),
		filterUntranslated: z
			.enum(["0", "1"])
			.optional()
			.describe("Filter by translation status (1=show only untranslated)"),
		filterQaIssues: z
			.string()
			.optional()
			.describe(
				"Filter by QA issues (comma-separated: spelling_and_grammar,inconsistent_placeholders,etc.)",
			),
		filterActiveTaskId: z
			.number()
			.optional()
			.describe("Filter by active task ID"),
		disableReferences: z
			.enum(["0", "1"])
			.optional()
			.describe("Disable reference information in response"),
	})
	.strict();

export type ListTranslationsToolArgsType = z.infer<
	typeof ListTranslationsToolArgs
>;

/**
 * Zod schema for the get translation details tool arguments.
 */
export const GetTranslationToolArgs = z
	.object({
		projectId: z.string().describe("Project ID containing the translation"),
		translationId: z.number().describe("Translation ID to get details for"),
		disableReferences: z
			.enum(["0", "1"])
			.optional()
			.describe("Disable reference information in response"),
	})
	.strict();

export type GetTranslationToolArgsType = z.infer<typeof GetTranslationToolArgs>;

/**
 * Zod schema for the update translation tool arguments.
 */
export const UpdateTranslationToolArgs = z
	.object({
		projectId: z.string().describe("Project ID containing the translation"),
		translationId: z.number().describe("Translation ID to update"),
		translationData: z
			.object({
				translation: z.string().describe("The updated translation text"),
				isReviewed: z
					.boolean()
					.optional()
					.describe("Mark translation as reviewed"),
				isUnverified: z
					.boolean()
					.optional()
					.describe("Mark translation as unverified (fuzzy)"),
				customTranslationStatusIds: z
					.array(z.number())
					.optional()
					.describe("Array of custom translation status IDs (numeric)"),
			})
			.describe("Translation data to update"),
	})
	.strict();

export type UpdateTranslationToolArgsType = z.infer<
	typeof UpdateTranslationToolArgs
>;

/**
 * Custom status for translations to display in formatter
 */
export interface TranslationCustomStatus {
	id: number;
	title: string;
	color: string;
}

/**
 * Export SDK types for use in other files
 */
export type { Translation, TranslationStatus, CursorPaginatedResult };

/**
 * Helper schema for validating QA issue types
 */
export const QaIssueTypes = z.enum([
	"spelling_and_grammar",
	"inconsistent_placeholders",
	"inconsistent_html",
	"whitespace_issues",
	"missing_translation",
	"unreliable_translation",
	"unbalanced_brackets",
	"double_space",
	"special_character",
	"unverified",
	"glossary_term_violation",
]);

export type QaIssueType = z.infer<typeof QaIssueTypes>;

/**
 * Zod schema for bulk update translations tool arguments.
 * Allows updating multiple translations in a single operation.
 */
export const BulkUpdateTranslationsToolArgs = z
	.object({
		projectId: z.string().describe("Project ID containing the translations"),
		updates: z
			.array(
				z.object({
					translationId: z.number().describe("Translation ID to update"),
					translationData: z
						.object({
							translation: z.string().describe("The updated translation text"),
							isReviewed: z
								.boolean()
								.optional()
								.describe("Mark translation as reviewed"),
							isUnverified: z
								.boolean()
								.optional()
								.describe("Mark translation as unverified (fuzzy)"),
							customTranslationStatusIds: z
								.array(z.number())
								.optional()
								.describe("Array of custom translation status IDs (numeric)"),
						})
						.describe("Translation data to update"),
				}),
			)
			.min(1)
			.max(100)
			.describe(
				"Array of translation updates (min 1, max 100). Each update includes translationId and translationData",
			),
	})
	.strict();

export type BulkUpdateTranslationsToolArgsType = z.infer<
	typeof BulkUpdateTranslationsToolArgs
>;

/**
 * Result for a single translation update in bulk operation
 */
export interface BulkUpdateTranslationResult {
	translationId: number;
	success: boolean;
	translation?: Translation;
	error?: string;
	attempts: number;
}

/**
 * Summary result for bulk update operation
 */
export interface BulkUpdateTranslationsSummary {
	totalRequested: number;
	successCount: number;
	failureCount: number;
	results: BulkUpdateTranslationResult[];
	duration: number;
}
