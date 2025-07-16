import {
	formatBulletList,
	formatDate,
	formatEmptyState,
	formatFooter,
	formatHeading,
	formatTable,
} from "../../shared/utils/formatter.util.js";
import type {
	BulkUpdateTranslationsSummary,
	CursorPaginatedResult,
	Translation,
} from "./translations.types.js";

/**
 * Translations formatter functions for converting API responses to user-friendly Markdown.
 * Generated on 2025-07-08 for Translation content management.
 */

/**
 * Format a list of translations into Markdown.
 * @param translationsData - API response containing translations list with cursor pagination
 * @returns Formatted Markdown string
 */
export function formatTranslationsList(
	translationsData: CursorPaginatedResult<Translation>,
): string {
	const lines: string[] = [];

	// Add main heading
	const totalCount = translationsData.items?.length || 0;
	lines.push(formatHeading(`Translations List (${totalCount} items)`, 1));
	lines.push("");

	if (!translationsData.items || translationsData.items.length === 0) {
		const suggestions = [
			"Check if the project has any keys with translations",
			"Verify your filter parameters (language, review status, etc.)",
			"Ensure you have permission to view translations",
		];
		lines.push(formatEmptyState("translations", "this query", suggestions));
		lines.push(formatFooter("List retrieved"));
		return lines.join("\n");
	}

	// Add translations table
	lines.push(formatHeading("Translations", 2));

	const tableData = translationsData.items.map((item) => ({
		id: item.translation_id.toString(),
		keyId: item.key_id.toString(),
		language: item.language_iso,
		translation:
			item.translation.length > 50
				? `${item.translation.substring(0, 50)}...`
				: item.translation,
		reviewed: item.is_reviewed ? "✓" : "✗",
		unverified: item.is_unverified ? "⚠️" : "✓",
		words: item.words?.toString() || "0",
		modified: item.modified_at ? formatDate(new Date(item.modified_at)) : "-",
	}));

	const table = formatTable(tableData, [
		{ key: "id", header: "Translation ID" },
		{ key: "keyId", header: "Key ID" },
		{ key: "language", header: "Language" },
		{ key: "translation", header: "Translation" },
		{ key: "reviewed", header: "Reviewed" },
		{ key: "unverified", header: "Verified" },
		{ key: "words", header: "Words" },
		{ key: "modified", header: "Modified" },
	]);

	lines.push(table);
	lines.push("");

	// Add cursor pagination info
	if (translationsData.hasNextCursor()) {
		lines.push(formatHeading("Pagination", 2));
		lines.push(
			"- **More results available**: Use the cursor to fetch the next page",
		);
		lines.push(`- **Next cursor**: \`${translationsData.nextCursor}\``);
		lines.push("");
	}

	// Add summary statistics
	lines.push(formatHeading("Summary", 2));
	const reviewedCount = translationsData.items.filter(
		(t) => t.is_reviewed,
	).length;
	const unverifiedCount = translationsData.items.filter(
		(t) => t.is_unverified,
	).length;
	const summary: Record<string, unknown> = {
		"Total shown": totalCount,
		Reviewed: `${reviewedCount} (${Math.round((reviewedCount / totalCount) * 100)}%)`,
		Unverified: `${unverifiedCount} (${Math.round((unverifiedCount / totalCount) * 100)}%)`,
		"Has more results": translationsData.hasNextCursor() ? "Yes" : "No",
	};
	lines.push(formatBulletList(summary));
	lines.push("");

	// Add footer
	lines.push(formatFooter("Translations list retrieved"));

	return lines.join("\n");
}

/**
 * Format translation details into Markdown.
 * @param translation - Translation data from API
 * @returns Formatted Markdown string
 */
export function formatTranslationDetails(translation: Translation): string {
	const lines: string[] = [];

	// Add main heading
	lines.push(formatHeading(`Translation ID: ${translation.translation_id}`, 1));
	lines.push("");

	// Add basic information section
	lines.push(formatHeading("Basic Information", 2));

	const basicInfo: Record<string, unknown> = {
		"Translation ID": translation.translation_id,
		"Key ID": translation.key_id,
		Language: translation.language_iso,
		Modified: translation.modified_at
			? formatDate(new Date(translation.modified_at))
			: "Unknown",
		"Modified By": translation.modified_by_email || "Unknown user",
		"Word Count": translation.words || 0,
	};

	lines.push(formatBulletList(basicInfo));
	lines.push("");

	// Add translation content
	lines.push(formatHeading("Translation Content", 2));
	lines.push("```");
	lines.push(translation.translation);
	lines.push("```");
	lines.push("");

	// Add status information
	lines.push(formatHeading("Status", 2));
	const statusInfo: Record<string, unknown> = {
		Reviewed: translation.is_reviewed ? "✓ Yes" : "✗ No",
		Verified: !translation.is_unverified ? "✓ Yes" : "⚠️ Unverified",
		Fuzzy: translation.is_fuzzy ? "⚠️ Yes" : "✓ No",
	};

	if (translation.is_reviewed && translation.reviewed_by) {
		statusInfo["Reviewed By"] = `User #${translation.reviewed_by}`;
	}

	lines.push(formatBulletList(statusInfo));
	lines.push("");

	// Add custom translation statuses if any
	if (
		translation.custom_translation_statuses &&
		translation.custom_translation_statuses.length > 0
	) {
		lines.push(formatHeading("Custom Statuses", 2));
		const customStatuses = translation.custom_translation_statuses.map(
			(status) => `- **${status.title}** (${status.color})`,
		);
		lines.push(...customStatuses);
		lines.push("");
	}

	// Add task information if applicable
	if (translation.task_id) {
		lines.push(formatHeading("Task Information", 2));
		lines.push(
			formatBulletList({
				"Task ID": translation.task_id,
				"Segment Number": translation.segment_number || "N/A",
			}),
		);
		lines.push("");
	}

	// Add footer
	lines.push(formatFooter("Translation details retrieved"));

	return lines.join("\n");
}

/**
 * Format translation update result into Markdown.
 * @param translation - The updated translation data
 * @returns Formatted Markdown string
 */
export function formatUpdateTranslationResult(
	translation: Translation,
): string {
	const lines: string[] = [];

	// Add main heading
	lines.push(formatHeading("Translation Updated Successfully", 1));
	lines.push("");

	// Add update summary
	lines.push(formatHeading("Update Summary", 2));
	const summary: Record<string, unknown> = {
		"Translation ID": translation.translation_id,
		"Key ID": translation.key_id,
		Language: translation.language_iso,
		"Updated At": translation.modified_at
			? formatDate(new Date(translation.modified_at))
			: "Just now",
	};
	lines.push(formatBulletList(summary));
	lines.push("");

	// Add updated content preview
	lines.push(formatHeading("Updated Translation", 2));
	lines.push("```");
	const preview =
		translation.translation.length > 200
			? `${translation.translation.substring(0, 200)}...`
			: translation.translation;
	lines.push(preview);
	lines.push("```");
	lines.push("");

	// Add new status
	lines.push(formatHeading("Current Status", 2));
	const statusInfo: Record<string, unknown> = {
		Reviewed: translation.is_reviewed ? "✓ Yes" : "✗ No",
		Verified: !translation.is_unverified ? "✓ Yes" : "⚠️ Unverified",
		"Word Count": translation.words || 0,
	};

	lines.push(formatBulletList(statusInfo));
	lines.push("");

	// Add footer
	lines.push(formatFooter("Translation updated"));

	return lines.join("\n");
}

/**
 * Format QA issues list for display
 * @param qaIssues - Comma-separated QA issues string
 * @returns Formatted string of QA issues
 */
export function formatQaIssues(qaIssues: string): string {
	const issueMap: Record<string, string> = {
		spelling_and_grammar: "📝 Spelling & Grammar",
		inconsistent_placeholders: "🔤 Inconsistent Placeholders",
		inconsistent_html: "🏷️ Inconsistent HTML",
		whitespace_issues: "⚪ Whitespace Issues",
		missing_translation: "❌ Missing Translation",
		unreliable_translation: "⚠️ Unreliable Translation",
		unbalanced_brackets: "🔧 Unbalanced Brackets",
		double_space: "⏩ Double Space",
		special_character: "✨ Special Character",
		unverified: "❓ Unverified",
		glossary_term_violation: "📖 Glossary Term Violation",
	};

	const issues = qaIssues.split(",").map((issue) => issue.trim());
	return issues.map((issue) => issueMap[issue] || issue).join(", ");
}

/**
 * Format bulk update translations result into Markdown.
 * @param summary - The bulk update summary
 * @returns Formatted Markdown string
 */
export function formatBulkUpdateTranslationsResult(
	summary: BulkUpdateTranslationsSummary,
): string {
	const lines: string[] = [];

	// Add main heading
	lines.push(formatHeading("Bulk Translation Update Results", 1));
	lines.push("");

	// Add overall summary
	lines.push(formatHeading("Summary", 2));
	const overallSummary: Record<string, unknown> = {
		"Total Translations": summary.totalRequested,
		"Successful Updates": `${summary.successCount} (${Math.round((summary.successCount / summary.totalRequested) * 100)}%)`,
		"Failed Updates": `${summary.failureCount} (${Math.round((summary.failureCount / summary.totalRequested) * 100)}%)`,
		"Total Duration": `${(summary.duration / 1000).toFixed(2)} seconds`,
		"Average Time per Translation": `${(summary.duration / summary.totalRequested / 1000).toFixed(2)} seconds`,
	};
	lines.push(formatBulletList(overallSummary));
	lines.push("");

	// Add successful updates section if any
	if (summary.successCount > 0) {
		lines.push(formatHeading("✅ Successful Updates", 2));
		const successfulResults = summary.results.filter((r) => r.success);

		const successTable = successfulResults.slice(0, 10).map((result) => ({
			id: result.translationId.toString(),
			language: result.translation?.language_iso || "N/A",
			reviewed: result.translation?.is_reviewed ? "✓" : "✗",
			attempts: result.attempts.toString(),
		}));

		const table = formatTable(successTable, [
			{ key: "id", header: "Translation ID" },
			{ key: "language", header: "Language" },
			{ key: "reviewed", header: "Reviewed" },
			{ key: "attempts", header: "Attempts" },
		]);
		lines.push(table);

		if (successfulResults.length > 10) {
			lines.push(
				`*... and ${successfulResults.length - 10} more successful updates*`,
			);
		}
		lines.push("");
	}

	// Add failed updates section if any
	if (summary.failureCount > 0) {
		lines.push(formatHeading("❌ Failed Updates", 2));
		const failedResults = summary.results.filter((r) => !r.success);

		const failureTable = failedResults.map((result) => ({
			id: result.translationId.toString(),
			error: result.error || "Unknown error",
			attempts: result.attempts.toString(),
		}));

		const table = formatTable(failureTable, [
			{ key: "id", header: "Translation ID" },
			{
				key: "error",
				header: "Error",
				formatter: (v) => {
					const error = String(v);
					return error.length > 50 ? `${error.substring(0, 50)}...` : error;
				},
			},
			{ key: "attempts", header: "Attempts" },
		]);
		lines.push(table);
		lines.push("");
	}

	// Add performance notes
	if (summary.totalRequested > 20) {
		lines.push(formatHeading("Performance Notes", 2));
		const performanceNotes = {
			"Rate Limiting": "~5 requests per second",
			"Retry Logic": "Up to 3 attempts per translation on failure",
			Recommendation: "Consider smaller batches for better performance",
		};
		lines.push(formatBulletList(performanceNotes));
		lines.push("");
	}

	// Add footer
	lines.push(formatFooter("Bulk update completed"));

	return lines.join("\n");
}
