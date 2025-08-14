import type {
	BulkResult,
	CursorPaginatedResult,
	Key,
	KeyDeleted,
	KeysBulkDeleted,
} from "@lokalise/node-api";
import {
	formatBulletList,
	formatEmptyState,
	formatErrorList,
	formatFooter,
	formatHeading,
	formatPaginationInfo,
	formatPercentage,
	formatSafeArray,
	formatTable,
	formatTruncated,
} from "../../shared/utils/formatter.util.js";

// Helper to consistently render key_name (object per platform) as a single display string
function displayKeyName(keyName: unknown): string {
	if (keyName == null) return "Unnamed";
	if (typeof keyName === "string") return keyName;
	if (typeof keyName === "object") {
		const names = keyName as Record<string, string>;
		return names.web || names.ios || names.android || names.other || "Unnamed";
	}
	return String(keyName);
}

/**
 * @namespace KeysFormatter
 * @description Utility functions for formatting Lokalise Keys API responses into readable formats.
 *              Provides consistent Markdown formatting for various key operations.
 */

/**
 * @function formatKeysList
 * @description Formats a list of keys into a comprehensive, LLM-friendly Markdown report
 * @memberof KeysFormatter
 * @param {any} response - The raw response from the Lokalise Keys API list operation
 * @param {string} projectId - The project ID for context
 * @returns {string} Formatted Markdown string containing the keys list
 */
export function formatKeysList(
	response: CursorPaginatedResult<Key>,
	projectId: string,
): string {
	const keys = response.items || [];
	const hasNextCursor = response.hasNextCursor();

	if (keys.length === 0) {
		const suggestions = [
			"The project is newly created",
			"All keys have been deleted",
			"Filter criteria excluded all keys",
			"You may not have permission to view keys",
		];
		return [
			formatHeading("Translation Keys Analysis", 1),
			"",
			formatHeading(`Project: ${projectId}`, 2),
			"",
			formatEmptyState("keys", "this project", suggestions),
			formatFooter("Analysis completed"),
		].join("\n");
	}

	const lines: string[] = [];
	lines.push(formatHeading("Translation Keys Analysis", 1));
	lines.push("");
	lines.push(formatHeading(`Project: ${projectId}`, 2));
	lines.push("");

	// Helper function to get primary key name (uses shared display helper)
	const getPrimaryKeyName = (keyName: unknown): string =>
		displayKeyName(keyName);

	// Calculate comprehensive statistics
	const stats = {
		totalKeys: keys.length,
		platformCounts: {
			ios: keys.filter((k) => k.platforms?.includes("ios")).length,
			android: keys.filter((k) => k.platforms?.includes("android")).length,
			web: keys.filter((k) => k.platforms?.includes("web")).length,
			other: keys.filter((k) => k.platforms?.includes("other")).length,
		},
		statusCounts: {
			hidden: keys.filter((k) => k.is_hidden).length,
			archived: keys.filter((k) => k.is_archived).length,
			plural: keys.filter((k) => k.is_plural).length,
			withDescription: keys.filter(
				(k) => k.description && k.description.trim() !== "",
			).length,
			withTags: keys.filter((k) => k.tags && k.tags.length > 0).length,
			withComments: keys.filter((k) => k.comments && k.comments.length > 0)
				.length,
			withScreenshots: keys.filter(
				(k) => k.screenshots && k.screenshots.length > 0,
			).length,
		},
		translationCounts: {
			total: keys.reduce((sum, k) => sum + (k.translations?.length || 0), 0),
			withTranslations: keys.filter(
				(k) => k.translations && k.translations.length > 0,
			).length,
		},
	};

	// Executive summary
	lines.push(formatHeading("Executive Summary", 2));
	lines.push("");
	lines.push(`**${stats.totalKeys} translation keys** found in this project.`);
	lines.push("");

	// Key Distribution
	lines.push(formatHeading("Key Distribution", 3));
	lines.push("");
	for (const [platform, count] of Object.entries(stats.platformCounts)) {
		const percentage = formatPercentage(count, stats.totalKeys);
		lines.push(
			`- **${platform.toUpperCase()} Platform:** ${count} keys (${percentage})`,
		);
	}
	lines.push("");

	// Content Quality Indicators
	lines.push(formatHeading("Content Quality Indicators", 3));
	lines.push("");
	const qualityStats = [
		{
			label: "Keys with Descriptions",
			value: stats.statusCounts.withDescription,
		},
		{ label: "Keys with Tags", value: stats.statusCounts.withTags },
		{ label: "Keys with Comments", value: stats.statusCounts.withComments },
		{
			label: "Keys with Screenshots",
			value: stats.statusCounts.withScreenshots,
		},
	];

	for (const stat of qualityStats) {
		const percentage = formatPercentage(stat.value, stats.totalKeys);
		lines.push(
			`- **${stat.label}:** ${stat.value}/${stats.totalKeys} (${percentage})`,
		);
	}
	lines.push("");

	// Status Overview
	lines.push(formatHeading("Status Overview", 3));
	lines.push("");
	const statusStats = [
		{ label: "Hidden Keys", value: stats.statusCounts.hidden },
		{ label: "Archived Keys", value: stats.statusCounts.archived },
		{ label: "Plural Keys", value: stats.statusCounts.plural },
	];

	for (const stat of statusStats) {
		const percentage = formatPercentage(stat.value, stats.totalKeys);
		lines.push(`- **${stat.label}:** ${stat.value} (${percentage})`);
	}
	lines.push("");

	if (stats.translationCounts.withTranslations > 0) {
		// Translation insights
		lines.push(formatHeading("Translation Status", 3));
		lines.push("");
		lines.push(
			`- **Keys with Translation Data:** ${stats.translationCounts.withTranslations}/${stats.totalKeys}`,
		);
		lines.push(`- **Total Translations:** ${stats.translationCounts.total}`);
		const avgTranslations =
			Math.round(
				(stats.translationCounts.total /
					stats.translationCounts.withTranslations) *
					100,
			) / 100;
		lines.push(`- **Average Translations per Key:** ${avgTranslations}`);
		lines.push("");
	}

	// Pagination information
	lines.push(
		formatPaginationInfo(hasNextCursor, response.nextCursor, keys.length),
	);

	// Detailed keys table with enhanced information
	lines.push(formatHeading("Detailed Keys Inventory", 2));
	lines.push("");

	const tableData = keys.map((key) => ({
		id: key.key_id || "N/A",
		keyName: getPrimaryKeyName(key.key_name),
		description: key.description || "*No description*",
		platforms: formatSafeArray(key.platforms),
		tags:
			key.tags && key.tags.length > 0
				? key.tags.length > 2
					? `${key.tags.slice(0, 2).join(", ")}+${key.tags.length - 2}`
					: key.tags.join(", ")
				: "None",
		status: getKeyStatus(key),
		context: key.context || "None",
	}));

	const table = formatTable(tableData, [
		{ key: "id", header: "ID" },
		{ key: "keyName", header: "Key Name", formatter: (v) => `\`${v}\`` },
		{ key: "description", header: "Description", maxWidth: 40 },
		{ key: "platforms", header: "Platforms" },
		{ key: "tags", header: "Tags" },
		{ key: "status", header: "Status" },
		{ key: "context", header: "Context", maxWidth: 30 },
	]);

	lines.push(table);
	lines.push("");

	// Advanced insights section
	lines.push(formatHeading("Advanced Insights", 2));
	lines.push("");

	// Find keys that might need attention
	const recommendations: string[] = [];
	const missingDescription = keys.filter(
		(k) => !k.description || k.description.trim() === "",
	);
	const noTags = keys.filter((k) => !k.tags || k.tags.length === 0);
	const noPlatforms = keys.filter(
		(k) => !k.platforms || k.platforms.length === 0,
	);
	const hiddenKeys = keys.filter((k) => k.is_hidden);
	const archivedKeys = keys.filter((k) => k.is_archived);

	if (missingDescription.length > 0) {
		recommendations.push(
			`**${missingDescription.length} keys without descriptions** - consider adding descriptions for better translator context`,
		);
	}
	if (noTags.length > 0) {
		recommendations.push(
			`**${noTags.length} keys without tags** - tags help with organization and filtering`,
		);
	}
	if (noPlatforms.length > 0) {
		recommendations.push(
			`**${noPlatforms.length} keys without platform assignments** - may indicate configuration issues`,
		);
	}
	if (hiddenKeys.length > 0) {
		recommendations.push(
			`**${hiddenKeys.length} hidden keys** - verify these should remain hidden from translators`,
		);
	}
	if (archivedKeys.length > 0) {
		recommendations.push(
			`**${archivedKeys.length} archived keys** - these are inactive and may need cleanup`,
		);
	}

	if (recommendations.length > 0) {
		lines.push(formatHeading("Recommendations for Improvement", 3));
		lines.push("");
		for (const recommendation of recommendations) {
			lines.push(`- ${recommendation}`);
		}
		lines.push("");
	}

	// Platform-specific insights
	lines.push(formatHeading("Platform-Specific Analysis", 3));
	lines.push("");
	const platformData = [
		{ name: "iOS", count: stats.platformCounts.ios },
		{ name: "Android", count: stats.platformCounts.android },
		{ name: "Web", count: stats.platformCounts.web },
		{ name: "Other", count: stats.platformCounts.other },
	];

	for (const platform of platformData) {
		const percentage = Math.round((platform.count / stats.totalKeys) * 100);
		let coverage: string;
		if (percentage === 100) {
			coverage = "- Universal coverage ✅";
		} else if (percentage > 75) {
			coverage = "- High coverage";
		} else if (percentage > 50) {
			coverage = "- Moderate coverage";
		} else if (percentage > 0) {
			coverage = "- Limited coverage ⚠️";
		} else {
			coverage = "- No keys assigned ❌";
		}
		lines.push(
			`- **${platform.name}:** ${platform.count} keys (${percentage}%) ${coverage}`,
		);
	}
	lines.push("");

	// Summary section for LLM reasoning
	lines.push(formatHeading("Summary for Analysis", 2));
	lines.push("");
	lines.push(
		`**Project ${projectId} contains ${stats.totalKeys} translation keys** with the following characteristics:`,
	);
	lines.push("");

	const mostUsedPlatform = Object.entries(stats.platformCounts).reduce(
		(a, b) => (a[1] > b[1] ? a : b),
	)[0];
	const summaryStats = [
		`Most used platform: ${mostUsedPlatform}`,
		`Content maturity: ${formatPercentage(stats.statusCounts.withDescription, stats.totalKeys)} of keys have descriptions`,
		`Organization level: ${formatPercentage(stats.statusCounts.withTags, stats.totalKeys)} of keys are tagged`,
		`Collaboration activity: ${stats.statusCounts.withComments} keys have comments`,
		`Visual context: ${stats.statusCounts.withScreenshots} keys have screenshots`,
	];

	for (const stat of summaryStats) {
		lines.push(`- **${stat}**`);
	}

	if (stats.statusCounts.archived > 0 || stats.statusCounts.hidden > 0) {
		lines.push(
			`- **Maintenance needed:** ${stats.statusCounts.archived + stats.statusCounts.hidden} keys are archived or hidden`,
		);
	}
	lines.push("");

	// Final metadata
	const contextMessage = hasNextCursor
		? "Additional keys available - use cursor pagination to fetch more"
		: `Showing ${keys.length} keys from project \`${projectId}\``;
	lines.push(formatFooter("Analysis completed", contextMessage));

	return lines.join("\n");
}

/**
 * @function formatKeyDetails
 * @description Formats detailed information about a single key with comprehensive LLM-friendly output
 * @memberof KeysFormatter
 * @param {Key} key - The key object from Lokalise API
 * @param {string} projectId - The project ID for context
 * @returns {string} Formatted Markdown string containing the key details
 */
export function formatKeyDetails(key: Key, projectId: string): string {
	const lines: string[] = [];
	lines.push(formatHeading("Translation Key Details", 1));
	lines.push("");

	// Helper function to safely format objects
	const safeStringify = (obj: unknown): string => {
		if (obj === null || obj === undefined) return "Not set";
		if (typeof obj === "string") return obj;
		if (typeof obj === "number" || typeof obj === "boolean") return String(obj);
		try {
			return JSON.stringify(obj, null, 2);
		} catch {
			return String(obj);
		}
	};

	// Helper function to format platform-specific names/filenames
	const formatPlatformObject = (obj: unknown): string => {
		if (!obj || typeof obj !== "object") return "Not configured";

		const platforms = ["ios", "android", "web", "other"] as const;
		const items: string[] = [];

		for (const platform of platforms) {
			const value = (obj as Record<string, string>)[platform];
			if (value) {
				items.push(`- **${platform.toUpperCase()}:** \`${value}\``);
			}
		}

		return items.length > 0
			? items.join("\n")
			: "No platform-specific values set";
	};

	// Core identification
	const coreInfo = {
		"Key ID": key.key_id,
		"Project ID": `\`${projectId}\``,
		Description: key.description || "*No description provided*",
		Context: key.context || "*No context specified*",
	};
	lines.push(formatHeading("Core Identification", 2));
	lines.push(formatBulletList(coreInfo));
	lines.push("");

	// Platform-specific key names
	lines.push(formatHeading("Platform-Specific Key Names", 2));
	lines.push("");
	lines.push(formatPlatformObject(key.key_name));
	lines.push("");

	// Platform-specific filenames
	lines.push(formatHeading("Platform-Specific Filenames", 2));
	lines.push("");
	lines.push(formatPlatformObject(key.filenames));
	lines.push("");

	// Platform assignments
	lines.push(formatHeading("Platform Assignments", 2));
	lines.push("");
	if (key.platforms && key.platforms.length > 0) {
		lines.push(`**Assigned Platforms:** ${key.platforms.length}`);
		lines.push("");
		for (const platform of key.platforms) {
			lines.push(`- **${platform.toUpperCase()}** - Active on this platform`);
		}
	} else {
		lines.push(
			"*No platforms assigned - this key is not targeted to any specific platform*",
		);
	}
	lines.push("");

	// Tags and organization
	lines.push(formatHeading("Tags and Organization", 2));
	lines.push("");
	if (key.tags && key.tags.length > 0) {
		lines.push(`**Total Tags:** ${key.tags.length}`);
		lines.push("");
		for (const tag of key.tags) {
			lines.push(`- \`${tag}\``);
		}
	} else {
		lines.push(
			"*No tags assigned - consider adding tags for better organization*",
		);
	}
	lines.push("");

	// Content specifications
	const contentInfo = {
		"Character Limit":
			key.char_limit > 0 ? `${key.char_limit} characters` : "No limit set",
		"Base Word Count":
			key.base_words > 0 ? `${key.base_words} words` : "Not calculated",
		"Supports Pluralization": key.is_plural ? "Yes" : "No",
		"Plural Form Name": key.is_plural ? `\`${key.plural_name}\`` : "Not set",
	};

	lines.push(formatHeading("Content Specifications", 2));
	lines.push(formatBulletList(contentInfo));
	lines.push("");

	// Status and visibility
	const statusInfo = {
		Visibility: key.is_hidden
			? "🔒 Hidden from translators"
			: "👁️ Visible to translators",
		"Archive Status": key.is_archived ? "📦 Archived (inactive)" : "✅ Active",
	};
	lines.push(formatHeading("Status and Visibility", 2));
	lines.push(formatBulletList(statusInfo));
	lines.push("");

	// Timeline information
	const timelineInfo = {
		Created: `${key.created_at} (${new Date(key.created_at).toLocaleDateString()})`,
		"Last Modified": `${key.modified_at} (${new Date(key.modified_at).toLocaleDateString()})`,
		"Translations Last Modified": `${key.translations_modified_at} (${new Date(key.translations_modified_at).toLocaleDateString()})`,
	};
	lines.push(formatHeading("Timeline Information", 2));
	lines.push(formatBulletList(timelineInfo));
	lines.push("");

	if (key.custom_attributes) {
		// Custom attributes
		lines.push(formatHeading("Custom Attributes", 2));
		lines.push("");
		try {
			const parsed = JSON.parse(key.custom_attributes);
			if (Object.keys(parsed).length > 0) {
				for (const [attrKey, attrValue] of Object.entries(parsed)) {
					lines.push(`- **${attrKey}:** ${safeStringify(attrValue)}`);
				}
			} else {
				lines.push("*No custom attributes defined*");
			}
		} catch {
			lines.push(`Raw value: \`${key.custom_attributes}\``);
		}
		lines.push("");
	}

	if (key.translations && key.translations.length > 0) {
		// Translation data (if included)
		lines.push(formatHeading("Translation Status", 2));
		lines.push("");
		lines.push(`**Total Languages:** ${key.translations.length}`);
		lines.push("");

		// Translation statistics
		const reviewedCount = key.translations.filter((t) => t.is_reviewed).length;
		const unverifiedCount = key.translations.filter(
			(t) => t.is_unverified,
		).length;
		const emptyCount = key.translations.filter(
			(t) => !t.translation || t.translation.trim() === "",
		).length;

		const translationStats = {
			Reviewed: `${reviewedCount}/${key.translations.length} (${formatPercentage(reviewedCount, key.translations.length)})`,
			Unverified: `${unverifiedCount}/${key.translations.length} (${formatPercentage(unverifiedCount, key.translations.length)})`,
			"Empty/Missing": `${emptyCount}/${key.translations.length} (${formatPercentage(emptyCount, key.translations.length)})`,
		};
		lines.push(formatHeading("Translation Statistics", 3));
		lines.push(formatBulletList(translationStats));
		lines.push("");

		// Translation details table
		lines.push(formatHeading("Translation Details", 3));
		lines.push("");

		const translationData = key.translations.map((translation) => ({
			language: translation.language_iso || "Unknown",
			translation: translation.translation || "*Empty*",
			status: getTranslationStatus(translation),
			wordCount: translation.words || 0,
			lastModified: translation.modified_at
				? new Date(translation.modified_at).toLocaleDateString()
				: "Not set",
		}));

		const translationTable = formatTable(translationData, [
			{ key: "language", header: "Language" },
			{ key: "translation", header: "Translation", maxWidth: 60 },
			{ key: "status", header: "Status" },
			{ key: "wordCount", header: "Word Count" },
			{ key: "lastModified", header: "Last Modified" },
		]);

		lines.push(translationTable);
		lines.push("");
	} else {
		lines.push(formatHeading("Translation Status", 2));
		lines.push(
			"*No translation data included in this response. Use includeTranslations parameter to fetch translation details.*",
		);
		lines.push("");
	}

	// Comments summary
	lines.push(formatHeading("Comments and Collaboration", 2));
	lines.push("");
	if (key.comments && key.comments.length > 0) {
		lines.push(`**Total Comments:** ${key.comments.length}`);
		lines.push("");
		for (let i = 0; i < Math.min(key.comments.length, 5); i++) {
			const comment = key.comments[i];
			const commentDate = comment.added_at
				? new Date(comment.added_at).toLocaleDateString()
				: "Unknown date";
			const commentText = comment.comment
				? formatTruncated(comment.comment, 100)
				: "*Empty comment*";
			lines.push(`**Comment ${i + 1}** (${commentDate}): ${commentText}`);
			lines.push("");
		}
		if (key.comments.length > 5) {
			lines.push(`*... and ${key.comments.length - 5} more comments*`);
			lines.push("");
		}
	} else {
		lines.push("*No comments on this key yet*");
		lines.push("");
	}

	// Screenshots summary
	lines.push(formatHeading("Visual Context", 2));
	lines.push("");
	if (key.screenshots && key.screenshots.length > 0) {
		lines.push(`**Total Screenshots:** ${key.screenshots.length}`);
		lines.push("");
		for (let i = 0; i < Math.min(key.screenshots.length, 3); i++) {
			const screenshot = key.screenshots[i];
			const title = screenshot.title || `Screenshot ${i + 1}`;
			const description = screenshot.description || "No description";
			lines.push(`**${title}:** ${description}`);
			lines.push("");
		}
		if (key.screenshots.length > 3) {
			lines.push(`*... and ${key.screenshots.length - 3} more screenshots*`);
			lines.push("");
		}
	} else {
		lines.push(
			"*No screenshots attached - consider adding visual context for better translations*",
		);
		lines.push("");
	}

	// Summary for LLM reasoning
	lines.push(formatHeading("Summary for Analysis", 2));
	lines.push("**Key Characteristics:**");
	const summaryStats = [
		`${key.platforms?.length || 0} platform(s) targeted`,
		`${key.translations?.length || 0} language(s) configured`,
		`${key.tags?.length || 0} organizational tag(s)`,
		`${key.comments?.length || 0} collaboration comment(s)`,
		`${key.screenshots?.length || 0} visual context item(s)`,
		`Content status: ${key.is_archived ? "Archived" : "Active"} ${key.is_hidden ? "(Hidden)" : "(Visible)"}`,
	];

	for (const stat of summaryStats) {
		lines.push(`- ${stat}`);
	}

	if (key.translations && key.translations.length > 0) {
		const completionRate = Math.round(
			(key.translations.filter(
				(t) => t.translation && t.translation.trim() !== "",
			).length /
				key.translations.length) *
				100,
		);
		lines.push(`- Translation completion: ${completionRate}%`);
	}
	lines.push("");

	lines.push(formatFooter("Key details retrieved"));

	return lines.join("\n");
}

/**
 * @function formatCreateKeysResult
 * @description Formats the result of a bulk key creation operation
 * @memberof KeysFormatter
 * @param {any} response - The raw response from the Lokalise Keys API create operation
 * @param {string} projectId - The project ID for context
 * @returns {string} Formatted Markdown string containing the creation results
 */
export function formatCreateKeysResult(
	response: BulkResult<Key>,
	projectId: string,
): string {
	const createdKeys = response.items || [];
	const errors = response.errors || [];

	const lines: string[] = [];
	lines.push(formatHeading("Keys Creation Results", 1));
	lines.push("");
	lines.push(`**Project ID:** \`${projectId}\``);
	lines.push("");

	// Summary
	const summaryInfo = {
		"Successfully Created": `${createdKeys.length} keys`,
		Errors: errors.length,
		"Total Requested": createdKeys.length + errors.length,
	};
	lines.push(formatHeading("Summary", 2));
	lines.push(formatBulletList(summaryInfo));
	lines.push("");

	// Successfully created keys
	if (createdKeys.length > 0) {
		lines.push(formatHeading("✅ Successfully Created Keys", 2));
		lines.push("");

		const tableData = createdKeys.map((key) => ({
			keyId: key.key_id || "N/A",
			keyName: displayKeyName(key.key_name),
			platforms: formatSafeArray(key.platforms),
		}));

		const table = formatTable(tableData, [
			{ key: "keyId", header: "Key ID" },
			{ key: "keyName", header: "Key Name", formatter: (v) => `\`${v}\`` },
			{ key: "platforms", header: "Platforms" },
		]);

		lines.push(table);
		lines.push("");
	}

	// Errors
	lines.push(
		formatErrorList(
			errors.map((e) => ({
				...e,
				code: e.code !== undefined ? String(e.code) : undefined,
			})),
		),
	);

	lines.push(formatFooter("Keys creation completed"));

	return lines.join("\n");
}

/**
 * @function formatUpdateKeyResult
 * @description Formats the result of a key update operation
 * @memberof KeysFormatter
 * @param {Key} key - The updated key object from Lokalise API
 * @param {string} projectId - The project ID for context
 * @returns {string} Formatted Markdown string containing the update results
 */
export function formatUpdateKeyResult(key: Key, projectId: string): string {
	const lines: string[] = [];
	lines.push(formatHeading("Key Update Successful", 1));
	lines.push("");

	lines.push(
		`**Key \`${key.key_name}\` (ID: ${key.key_id}) has been updated successfully.**`,
	);
	lines.push("");

	// Updated details
	const keyInfo = {
		"Key ID": key.key_id,
		"Key Name": `\`${key.key_name}\``,
		"Project ID": `\`${projectId}\``,
		Description: key.description || "No description",
		"Last Modified": key.modified_at,
	};
	lines.push(formatHeading("Updated Key Details", 2));
	lines.push(formatBulletList(keyInfo));
	lines.push("");

	// Platforms
	lines.push(formatHeading("Platforms", 3));
	if (key.platforms && key.platforms.length > 0) {
		for (const platform of key.platforms) {
			lines.push(`- ${platform}`);
		}
	} else {
		lines.push("*No platforms specified*");
	}
	lines.push("");

	// Tags
	lines.push(formatHeading("Tags", 3));
	if (key.tags && key.tags.length > 0) {
		for (const tag of key.tags) {
			lines.push(`- \`${tag}\``);
		}
	} else {
		lines.push("*No tags assigned*");
	}
	lines.push("");

	lines.push(formatFooter("Key updated"));

	return lines.join("\n");
}

/**
 * @function formatDeleteKeyResult
 * @description Formats the result of a key deletion operation
 * @memberof KeysFormatter
 * @param {any} response - The raw response from the Lokalise Keys API delete operation
 * @param {string} projectId - The project ID for context
 * @param {number} keyId - The deleted key ID
 * @returns {string} Formatted Markdown string containing the deletion confirmation
 */
export function formatDeleteKeyResult(
	response: KeyDeleted,
	projectId: string,
	keyId: number,
): string {
	const lines: string[] = [];
	lines.push(formatHeading("Key Deletion Successful", 1));
	lines.push("");

	lines.push(
		`**Key with ID ${keyId} has been successfully deleted from project \`${projectId}\`.**`,
	);
	lines.push("");

	const deletionInfo = {
		"Deleted Key ID": keyId,
		"Project ID": `\`${projectId}\``,
		"Deletion Time": new Date().toISOString(),
		Status: response.key_removed ? "✅ Confirmed removed" : "Processing",
	};
	lines.push(formatHeading("Details", 2));
	lines.push(formatBulletList(deletionInfo));
	lines.push("");

	lines.push(
		"> **Note:** This action cannot be undone. All translations associated with this key have also been deleted.",
	);
	lines.push("");

	lines.push(formatFooter("Key deleted"));

	return lines.join("\n");
}

/**
 * @function formatBulkUpdateKeysResult
 * @description Formats the result of a bulk key update operation
 * @memberof KeysFormatter
 * @param {any} response - The raw response from the Lokalise Keys API bulk update operation
 * @param {string} projectId - The project ID for context
 * @returns {string} Formatted Markdown string containing the bulk update results
 */
export function formatBulkUpdateKeysResult(
	response: BulkResult<Key>,
	projectId: string,
): string {
	const updatedKeys = response.items || [];
	const errors = response.errors || [];

	const lines: string[] = [];
	lines.push(formatHeading("Bulk Keys Update Results", 1));
	lines.push("");
	lines.push(`**Project ID:** \`${projectId}\``);
	lines.push("");

	// Summary
	const summaryInfo = {
		"Successfully Updated": `${updatedKeys.length} keys`,
		Errors: errors.length,
		"Total Requested": updatedKeys.length + errors.length,
	};
	lines.push(formatHeading("Summary", 2));
	lines.push(formatBulletList(summaryInfo));
	lines.push("");

	// Successfully updated keys
	if (updatedKeys.length > 0) {
		lines.push(formatHeading("✅ Successfully Updated Keys", 2));
		lines.push("");

		const tableData = updatedKeys.map((key) => ({
			keyId: key.key_id || "N/A",
			keyName: displayKeyName(key.key_name),
			lastModified: key.modified_at || "Unknown",
		}));

		const table = formatTable(tableData, [
			{ key: "keyId", header: "Key ID" },
			{ key: "keyName", header: "Key Name", formatter: (v) => `\`${v}\`` },
			{ key: "lastModified", header: "Last Modified" },
		]);

		lines.push(table);
		lines.push("");
	}

	// Errors
	lines.push(
		formatErrorList(
			errors.map((e) => ({
				...e,
				code: e.code !== undefined ? String(e.code) : undefined,
			})),
		),
	);

	lines.push(formatFooter("Bulk update completed"));

	return lines.join("\n");
}

/**
 * @function formatBulkDeleteKeysResult
 * @description Formats the result of a bulk key deletion operation
 * @memberof KeysFormatter
 * @param {any} response - The raw response from the Lokalise Keys API bulk delete operation
 * @param {string} projectId - The project ID for context
 * @param {number} requestedCount - The number of keys requested to be deleted
 * @returns {string} Formatted Markdown string containing the bulk deletion results
 */
export function formatBulkDeleteKeysResult(
	response: KeysBulkDeleted,
	projectId: string,
	requestedCount: number,
): string {
	const lines: string[] = [];
	lines.push(formatHeading("Bulk Keys Deletion Successful", 1));
	lines.push("");

	lines.push(
		`**${requestedCount} keys have been successfully deleted from project \`${projectId}\`.**`,
	);
	lines.push("");

	const deletionInfo = {
		"Deleted Keys Count": requestedCount,
		"Project ID": `\`${projectId}\``,
		"Deletion Time": new Date().toISOString(),
		Status: response.keys_removed
			? "✅ All keys confirmed removed"
			: "Processing",
	};
	lines.push(formatHeading("Details", 2));
	lines.push(formatBulletList(deletionInfo));
	lines.push("");

	lines.push(
		"> **Note:** This action cannot be undone. All translations associated with these keys have also been deleted.",
	);
	lines.push("");

	lines.push(formatFooter("Bulk deletion completed"));

	return lines.join("\n");
}

// Helper functions

function getKeyStatus(key: Key): string {
	const statusParts: string[] = [];
	if (key.is_hidden) statusParts.push("🔒Hidden");
	if (key.is_archived) statusParts.push("📦Archived");
	if (key.is_plural) statusParts.push("🔢Plural");
	if (key.comments && key.comments.length > 0)
		statusParts.push(`💬${key.comments.length}`);
	if (key.screenshots && key.screenshots.length > 0)
		statusParts.push(`📷${key.screenshots.length}`);
	return statusParts.length > 0 ? statusParts.join(" ") : "✅Standard";
}

function getTranslationStatus(translation: unknown): string {
	if (!translation || typeof translation !== "object") {
		return "❌ Missing";
	}

	if (
		"translation" in translation &&
		typeof translation.translation === "string" &&
		translation.translation.trim() !== ""
	) {
		return "✅ Reviewed";
	}

	if ("is_reviewed" in translation && translation.is_reviewed) {
		return "✅ Reviewed";
	}

	if ("translation" in translation && translation.translation === "") {
		return "❌ Empty";
	}

	if ("is_unverified" in translation && translation.is_unverified) {
		return "⚠️ Unverified";
	}

	return "⏳ Pending Review";
}
