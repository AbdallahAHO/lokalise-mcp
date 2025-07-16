import type { Language } from "@lokalise/node-api";
import {
	formatBulletList,
	formatDate,
	formatEmptyState,
	formatFooter,
	formatHeading,
	formatProjectContext,
	formatSafeArray,
	formatTable,
} from "../../shared/utils/formatter.util.js";

/**
 * Format a list of system languages into Markdown.
 * @param languages - Array of system language data.
 * @returns Formatted Markdown string.
 */
export function formatSystemLanguagesList(languages: Language[]): string {
	const lines: string[] = [];

	// Add main heading
	lines.push(
		formatHeading(`Lokalise System Languages (${languages.length})`, 1),
	);
	lines.push("");

	if (languages.length === 0) {
		lines.push(formatEmptyState("system languages"));
		lines.push(formatFooter("List retrieved"));
		return lines.join("\n");
	}

	// Sort languages by name
	const sortedLanguages = languages.sort((a, b) => {
		return a.lang_name.localeCompare(b.lang_name);
	});

	// Group languages by first letter for better organization
	const languageGroups = new Map<string, Language[]>();
	for (const language of sortedLanguages) {
		const firstLetter = language.lang_name.charAt(0).toUpperCase();
		if (!languageGroups.has(firstLetter)) {
			languageGroups.set(firstLetter, []);
		}
		languageGroups.get(firstLetter)?.push(language);
	}

	// Display languages by groups
	for (const [letter, groupLanguages] of languageGroups) {
		lines.push(formatHeading(`${letter}`, 2));
		lines.push("");

		for (const language of groupLanguages) {
			const languageInfo: Record<string, unknown> = {
				Name: language.lang_name,
				"ISO Code": language.lang_iso,
				"Language ID": language.lang_id,
				"Right-to-Left": language.is_rtl ? "Yes" : "No",
			};

			if (language.plural_forms && language.plural_forms.length > 0) {
				languageInfo["Plural Forms"] = formatSafeArray(language.plural_forms);
			}

			lines.push(`**${language.lang_name}** (${language.lang_iso})`);
			lines.push("");
			lines.push(formatBulletList(languageInfo));
			lines.push("");
		}
	}

	// Add footer
	lines.push(formatFooter("List retrieved"));

	return lines.join("\n");
}

/**
 * Format project languages into Markdown.
 * @param languages - Array of Lokalise language data.
 * @param projectId - The project ID for context.
 * @param includeProgress - Whether to include translation progress.
 * @returns Formatted Markdown string.
 */
export function formatProjectLanguages(
	languages: Language[],
	projectId: string,
	includeProgress = false,
): string {
	const lines: string[] = [];

	// Add main heading
	lines.push(formatHeading(`Project Languages (${languages.length})`, 1));
	lines.push("");

	if (languages.length === 0) {
		const suggestions = [
			"Add languages to start translating your content",
			"Set up target languages for your translations",
		];
		lines.push(formatEmptyState("languages", "this project", suggestions));
		lines.push(formatProjectContext(projectId));
		lines.push(formatFooter("List retrieved"));
		return lines.join("\n");
	}

	// Sort languages by name
	const sortedLanguages = languages.sort((a, b) => {
		return a.lang_name.localeCompare(b.lang_name);
	});

	// Add languages list
	for (const language of sortedLanguages) {
		lines.push(formatHeading(language.lang_name, 2));
		lines.push("");

		// Add basic language information
		const languageInfo: Record<string, unknown> = {
			"Language ID": language.lang_id,
			"ISO Code": language.lang_iso,
			"Right-to-Left": language.is_rtl ? "Yes" : "No",
		};

		// Add plural forms if available
		if (language.plural_forms && language.plural_forms.length > 0) {
			languageInfo["Plural Forms"] = formatSafeArray(language.plural_forms);
		}

		// Note: Progress information is not available directly on Language objects from the SDK
		// To get progress data, project statistics would need to be fetched separately
		if (includeProgress) {
			languageInfo.Note =
				"Progress data requires separate project statistics call";
		}

		lines.push(formatBulletList(languageInfo));
		lines.push("");
	}

	// Add project context
	lines.push(formatProjectContext(projectId));

	// Add footer
	lines.push(formatFooter("List retrieved"));

	return lines.join("\n");
}

/**
 * Format language details into Markdown.
 * @param language - Lokalise language data.
 * @param projectId - The project ID for context.
 * @returns Formatted Markdown string.
 */
export function formatLanguageDetails(
	language: Language,
	projectId: string,
): string {
	const lines: string[] = [];

	// Add main heading
	lines.push(formatHeading(`Language: ${language.lang_name}`, 1));
	lines.push("");

	// Add language information section
	lines.push(formatHeading("Language Information", 2));

	const languageInfo: Record<string, unknown> = {
		"Language ID": language.lang_id,
		"Language Name": language.lang_name,
		"ISO Code": language.lang_iso,
		"Right-to-Left": language.is_rtl ? "Yes" : "No",
	};

	// Add plural forms if available
	if (language.plural_forms && language.plural_forms.length > 0) {
		languageInfo["Plural Forms"] = formatSafeArray(language.plural_forms);
	}

	lines.push(formatBulletList(languageInfo));
	lines.push("");

	// Add project context
	const sections = [
		{
			path: `/language/${language.lang_id}`,
			label: "View Language in Lokalise Dashboard",
		},
	];
	lines.push(formatProjectContext(projectId, sections));

	// Add footer
	lines.push(formatFooter("Details retrieved"));

	return lines.join("\n");
}

/**
 * Format language addition result into Markdown.
 * @param languages - Array of added language data.
 * @param projectId - The project ID for context.
 * @returns Formatted Markdown string.
 */
export function formatAddLanguagesResult(
	languages: Language[],
	projectId: string,
): string {
	const lines: string[] = [];

	// Add main heading
	lines.push(formatHeading("Languages Added Successfully", 1));
	lines.push("");

	// Add summary
	lines.push(formatHeading("Operation Summary", 2));
	const summary: Record<string, unknown> = {
		"Languages Added": languages.length,
		"Project ID": projectId,
		"Operation Time": formatDate(new Date()),
	};
	lines.push(formatBulletList(summary));
	lines.push("");

	// Add added languages details
	if (languages.length > 0) {
		lines.push(formatHeading("Added Languages", 2));

		// Use table format for better readability
		const tableData = languages.map((lang) => ({
			name: lang.lang_name,
			iso: lang.lang_iso,
			id: lang.lang_id,
		}));

		const table = formatTable(tableData, [
			{ key: "name", header: "Language Name" },
			{ key: "iso", header: "ISO Code" },
			{ key: "id", header: "Language ID" },
		]);

		lines.push(table);
		lines.push("");
	}

	// Add next steps
	const nextSteps = [
		"Start translating existing keys into the new languages",
		"Assign translators to work on specific languages",
		"Set up translation workflows for each language",
		"Review language-specific settings and plural forms",
	];
	lines.push(formatHeading("Next Steps", 2));
	for (const step of nextSteps) {
		lines.push(`- ${step}`);
	}
	lines.push("");

	// Add project context
	lines.push(formatProjectContext(projectId));

	// Add footer
	lines.push(formatFooter("Languages added"));

	return lines.join("\n");
}

/**
 * Format language update result into Markdown.
 * @param language - The updated language data.
 * @param projectId - The project ID for context.
 * @returns Formatted Markdown string.
 */
export function formatUpdateLanguageResult(
	language: Language,
	projectId: string,
): string {
	const lines: string[] = [];

	// Add main heading
	lines.push(formatHeading("Language Updated Successfully", 1));
	lines.push("");

	// Add updated language information
	lines.push(formatHeading("Updated Language Information", 2));

	const languageInfo: Record<string, unknown> = {
		"Language Name": language.lang_name,
		"Language ID": language.lang_id,
		"ISO Code": language.lang_iso,
		"Last Modified": formatDate(new Date()),
	};

	// Add plural forms if available
	if (language.plural_forms && language.plural_forms.length > 0) {
		languageInfo["Plural Forms"] = formatSafeArray(language.plural_forms);
	}

	lines.push(formatBulletList(languageInfo));
	lines.push("");

	// Add project context
	const sections = [
		{
			path: `/language/${language.lang_id}`,
			label: "View Language in Lokalise Dashboard",
		},
	];
	lines.push(formatProjectContext(projectId, sections));

	// Add footer
	lines.push(formatFooter("Language updated"));

	return lines.join("\n");
}

/**
 * Format language removal result into Markdown.
 * @param languageId - The ID of the removed language.
 * @param projectId - The project ID for context.
 * @returns Formatted Markdown string.
 */
export function formatRemoveLanguageResult(
	languageId: number,
	projectId: string,
): string {
	const lines: string[] = [];

	// Add main heading
	lines.push(formatHeading("Language Removed Successfully", 1));
	lines.push("");

	// Add removal information
	lines.push(formatHeading("Removal Details", 2));

	const removalInfo: Record<string, unknown> = {
		"Removed Language ID": languageId,
		"Project ID": projectId,
		"Removal Time": formatDate(new Date()),
		Status: "Successfully removed",
	};

	lines.push(formatBulletList(removalInfo));
	lines.push("");

	// Add warning
	lines.push(formatHeading("⚠️ Important", 2));
	lines.push(
		"- All translations for this language have been permanently removed",
	);
	lines.push("- This action cannot be undone");
	lines.push("- Team members assigned to this language will lose access");
	lines.push(
		"- Consider creating a backup before removing languages in the future",
	);
	lines.push("");

	// Add project context
	lines.push(formatProjectContext(projectId));

	// Add footer
	lines.push(formatFooter("Language removed"));

	return lines.join("\n");
}
