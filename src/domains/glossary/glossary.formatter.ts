import type {
	BulkResult,
	CursorPaginatedResult,
	GlossaryTerm,
	TermsDeleted,
} from "@lokalise/node-api";
import {
	formatBulletList,
	formatDate,
	formatEmptyState,
	formatFooter,
	formatHeading,
	formatProjectContext,
	formatTable,
} from "../../shared/utils/formatter.util.js";

/**
 * Glossary formatter functions for converting API responses to user-friendly Markdown.
 * Provides formatting for glossary terms with translations, bulk operations, and cursor pagination.
 */

/**
 * Format a list of glossary terms into Markdown.
 * @param result - Cursor paginated result from API
 * @returns Formatted Markdown string
 */
export function formatGlossaryTermsList(
	result: CursorPaginatedResult<GlossaryTerm>,
): string {
	const lines: string[] = [];

	// Add main heading
	const totalCount = result.items?.length || 0;
	lines.push(formatHeading(`Glossary Terms (${totalCount} items)`, 1));
	lines.push("");

	if (!result.items || result.items.length === 0) {
		const suggestions = [
			"Create your first glossary term to maintain translation consistency",
			"Define brand names and technical terms that shouldn't be translated",
			"Add forbidden terms that should never appear in translations",
		];
		lines.push(formatEmptyState("glossary terms", "this project", suggestions));
		lines.push(formatFooter("List retrieved"));
		return lines.join("\n");
	}

	// Add glossary terms table
	const tableData = result.items.map((term) => ({
		id: term.id,
		term: term.term,
		description:
			term.description.length > 50
				? `${term.description.substring(0, 50)}...`
				: term.description,
		flags:
			[
				term.caseSensitive ? "Case-sensitive" : "",
				!term.translatable ? "Not translatable" : "",
				term.forbidden ? "⚠️ Forbidden" : "",
			]
				.filter(Boolean)
				.join(", ") || "Standard",
		translations: term.translations?.length || 0,
		tags: term.tags?.join(", ") || "-",
	}));

	const table = formatTable(tableData, [
		{ key: "id", header: "ID" },
		{ key: "term", header: "Term" },
		{ key: "description", header: "Description" },
		{ key: "flags", header: "Properties" },
		{ key: "translations", header: "Translations" },
		{ key: "tags", header: "Tags" },
	]);

	lines.push(table);
	lines.push("");

	// Add cursor pagination info
	if (result.hasNextCursor()) {
		lines.push(formatHeading("Pagination", 2));
		lines.push(`- **Next cursor**: \`${result.nextCursor}\``);
		lines.push("- Use the cursor to fetch the next page of results");
		lines.push("");
	}

	// Add footer
	lines.push(formatFooter("Glossary terms retrieved"));

	return lines.join("\n");
}

/**
 * Format glossary term details into Markdown.
 * @param term - Glossary term data from API
 * @returns Formatted Markdown string
 */
export function formatGlossaryTermDetails(term: GlossaryTerm): string {
	const lines: string[] = [];

	// Add main heading
	lines.push(formatHeading(`Glossary Term: ${term.term}`, 1));
	lines.push("");

	// Add basic information section
	lines.push(formatHeading("Basic Information", 2));
	const basicInfo: Record<string, unknown> = {
		"Term ID": term.id,
		Term: term.term,
		Description: term.description,
		"Project ID": term.projectId,
		Created: term.createdAt ? formatDate(new Date(term.createdAt)) : "Unknown",
		Updated: term.updatedAt ? formatDate(new Date(term.updatedAt)) : "Never",
	};
	lines.push(formatBulletList(basicInfo));
	lines.push("");

	// Add properties section
	lines.push(formatHeading("Properties", 2));
	const properties: Record<string, unknown> = {
		"Case Sensitive": term.caseSensitive ? "✅ Yes" : "❌ No",
		Translatable: term.translatable ? "✅ Yes" : "❌ No (keep as-is)",
		Forbidden: term.forbidden
			? "⚠️ Yes (should not be used)"
			: "✅ No (allowed)",
	};
	lines.push(formatBulletList(properties));
	lines.push("");

	// Add tags if present
	if (term.tags && term.tags.length > 0) {
		lines.push(formatHeading("Tags", 2));
		lines.push(term.tags.map((tag) => `\`${tag}\``).join(" "));
		lines.push("");
	}

	// Add translations section
	if (term.translations && term.translations.length > 0) {
		lines.push(formatHeading("Translations", 2));

		const translationTable = term.translations.map((trans) => ({
			language: `${trans.langName} (${trans.langIso})`,
			translation: trans.translation || "(not translated)",
			description: trans.description || "-",
		}));

		const table = formatTable(translationTable, [
			{ key: "language", header: "Language" },
			{ key: "translation", header: "Translation" },
			{ key: "description", header: "Description" },
		]);

		lines.push(table);
		lines.push("");
	} else {
		lines.push(formatHeading("Translations", 2));
		lines.push("No translations defined for this term.");
		lines.push("");
	}

	// Add project context
	const sections = [
		{
			path: `/glossary-terms/${term.id}`,
			label: "View Term in Lokalise Dashboard",
		},
	];
	lines.push(formatProjectContext(term.projectId, sections));

	// Add footer
	lines.push(formatFooter("Term details retrieved"));

	return lines.join("\n");
}

/**
 * Format glossary terms creation result into Markdown.
 * @param result - Bulk result containing created terms
 * @returns Formatted Markdown string
 */
export function formatCreateGlossaryTermsResult(
	result: BulkResult<GlossaryTerm>,
): string {
	const lines: string[] = [];

	// Add main heading
	const successCount = result.items?.length || 0;
	const errorCount = result.errors?.length || 0;
	const totalRequested = successCount + errorCount;

	lines.push(formatHeading("Glossary Terms Creation Result", 1));
	lines.push("");

	// Add summary
	lines.push(formatHeading("Summary", 2));
	const summary: Record<string, unknown> = {
		"Total Requested": totalRequested,
		"Successfully Created": `✅ ${successCount}`,
		Failed: errorCount > 0 ? `❌ ${errorCount}` : "✅ 0",
		"Success Rate":
			totalRequested > 0
				? `${Math.round((successCount / totalRequested) * 100)}%`
				: "N/A",
	};
	lines.push(formatBulletList(summary));
	lines.push("");

	// Show created terms
	if (result.items && result.items.length > 0) {
		lines.push(formatHeading("Created Terms", 2));

		const tableData = result.items.map((term) => ({
			id: term.id,
			term: term.term,
			properties:
				[
					term.caseSensitive ? "Case-sensitive" : "",
					!term.translatable ? "Not translatable" : "",
					term.forbidden ? "Forbidden" : "",
				]
					.filter(Boolean)
					.join(", ") || "Standard",
			tags: term.tags?.join(", ") || "-",
		}));

		const table = formatTable(tableData, [
			{ key: "id", header: "ID" },
			{ key: "term", header: "Term" },
			{ key: "properties", header: "Properties" },
			{ key: "tags", header: "Tags" },
		]);

		lines.push(table);
		lines.push("");
	}

	// Show errors if any
	if (result.errors && result.errors.length > 0) {
		lines.push(formatHeading("⚠️ Errors", 2));
		for (const error of result.errors) {
			lines.push(`- **Error**: ${error.message || "Unknown error"}`);
		}
		lines.push("");
	}

	// Add next steps
	lines.push(formatHeading("Next Steps", 2));
	const nextSteps = [
		"Add translations for the created terms in different languages",
		"Review and update term properties as needed",
		"Use these terms to maintain consistency across translations",
	];
	for (const step of nextSteps) {
		lines.push(`- ${step}`);
	}
	lines.push("");

	// Add footer
	lines.push(formatFooter("Terms creation completed"));

	return lines.join("\n");
}

/**
 * Format glossary terms update result into Markdown.
 * @param result - Bulk result containing updated terms
 * @returns Formatted Markdown string
 */
export function formatUpdateGlossaryTermsResult(
	result: BulkResult<GlossaryTerm>,
): string {
	const lines: string[] = [];

	// Add main heading
	const successCount = result.items?.length || 0;
	const errorCount = result.errors?.length || 0;
	const totalRequested = successCount + errorCount;

	lines.push(formatHeading("Glossary Terms Update Result", 1));
	lines.push("");

	// Add summary
	lines.push(formatHeading("Summary", 2));
	const summary: Record<string, unknown> = {
		"Total Requested": totalRequested,
		"Successfully Updated": `✅ ${successCount}`,
		Failed: errorCount > 0 ? `❌ ${errorCount}` : "✅ 0",
		"Success Rate":
			totalRequested > 0
				? `${Math.round((successCount / totalRequested) * 100)}%`
				: "N/A",
	};
	lines.push(formatBulletList(summary));
	lines.push("");

	// Show updated terms
	if (result.items && result.items.length > 0) {
		lines.push(formatHeading("Updated Terms", 2));

		const tableData = result.items.map((term) => ({
			id: term.id,
			term: term.term,
			updatedAt: term.updatedAt
				? formatDate(new Date(term.updatedAt))
				: "Just now",
		}));

		const table = formatTable(tableData, [
			{ key: "id", header: "ID" },
			{ key: "term", header: "Term" },
			{ key: "updatedAt", header: "Updated" },
		]);

		lines.push(table);
		lines.push("");
	}

	// Show errors if any
	if (result.errors && result.errors.length > 0) {
		lines.push(formatHeading("⚠️ Errors", 2));
		for (const error of result.errors) {
			lines.push(`- **Error**: ${error.message || "Unknown error"}`);
		}
		lines.push("");
	}

	// Add footer
	lines.push(formatFooter("Terms update completed"));

	return lines.join("\n");
}

/**
 * Format glossary terms deletion result into Markdown.
 * @param result - Deletion result with success and failure counts
 * @returns Formatted Markdown string
 */
export function formatDeleteGlossaryTermsResult(result: TermsDeleted): string {
	const lines: string[] = [];

	// Add main heading
	lines.push(formatHeading("Glossary Terms Deletion Result", 1));
	lines.push("");

	// Add summary
	lines.push(formatHeading("Summary", 2));
	const totalDeleted = result.deleted.count;
	const totalFailed = result.failed?.reduce((sum, f) => sum + f.count, 0) || 0;
	const totalRequested = totalDeleted + totalFailed;

	const summary: Record<string, unknown> = {
		"Total Requested": totalRequested,
		"Successfully Deleted": `✅ ${totalDeleted}`,
		Failed: totalFailed > 0 ? `❌ ${totalFailed}` : "✅ 0",
		"Success Rate":
			totalRequested > 0
				? `${Math.round((totalDeleted / totalRequested) * 100)}%`
				: "N/A",
	};
	lines.push(formatBulletList(summary));
	lines.push("");

	// Show deleted IDs
	if (result.deleted.ids && result.deleted.ids.length > 0) {
		lines.push(formatHeading("Deleted Term IDs", 2));
		lines.push(`\`${result.deleted.ids.join(", ")}\``);
		lines.push("");
	}

	// Show failures if any
	if (result.failed && result.failed.length > 0) {
		lines.push(formatHeading("⚠️ Failed Deletions", 2));
		for (const failure of result.failed) {
			lines.push(`- **IDs**: \`${failure.ids.join(", ")}\``);
			lines.push(`  **Reason**: ${failure.message}`);
		}
		lines.push("");
	}

	// Add warning
	lines.push(formatHeading("⚠️ Important", 2));
	lines.push("- Deleted terms cannot be recovered");
	lines.push("- All translations for these terms have been removed");
	lines.push("- Consider exporting your glossary regularly for backup");
	lines.push("");

	// Add footer
	lines.push(formatFooter("Terms deletion completed"));

	return lines.join("\n");
}

// Re-export formatter functions with proper names
export {
	formatGlossaryTermsList as formatGlossarysList,
	formatGlossaryTermDetails as formatGlossaryDetails,
	formatCreateGlossaryTermsResult as formatAddGlossarysResult,
	formatUpdateGlossaryTermsResult as formatUpdateGlossaryResult,
	formatDeleteGlossaryTermsResult as formatRemoveGlossaryResult,
};
