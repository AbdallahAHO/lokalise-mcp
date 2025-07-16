/**
 * Standardized formatting utilities for consistent output across all CLI and Tool interfaces.
 * These functions should be used by all formatters to ensure consistent formatting.
 */

/**
 * Format a date in a standardized way: YYYY-MM-DD HH:MM:SS UTC
 * @param dateString - ISO date string or Date object
 * @returns Formatted date string
 */
export function formatDate(dateString?: string | Date): string {
	if (!dateString) {
		return "Not available";
	}

	try {
		const date =
			typeof dateString === "string" ? new Date(dateString) : dateString;

		// Format: YYYY-MM-DD HH:MM:SS UTC
		return date
			.toISOString()
			.replace("T", " ")
			.replace(/\.\d+Z$/, " UTC");
	} catch {
		return "Invalid date";
	}
}

/**
 * Format a URL as a markdown link
 * @param url - URL to format
 * @param title - Link title
 * @returns Formatted markdown link
 */
export function formatUrl(url?: string, title?: string): string {
	if (!url) {
		return "Not available";
	}

	const linkTitle = title || url;
	return `[${linkTitle}](${url})`;
}

/**
 * Format a heading with consistent style
 * @param text - Heading text
 * @param level - Heading level (1-6)
 * @returns Formatted heading
 */
export function formatHeading(text: string, level = 1): string {
	const validLevel = Math.min(Math.max(level, 1), 6);
	const prefix = "#".repeat(validLevel);
	return `${prefix} ${text}`;
}

/**
 * Format a list of key-value pairs as a bullet list
 * @param items - Object with key-value pairs
 * @param keyFormatter - Optional function to format keys
 * @returns Formatted bullet list
 */
export function formatBulletList(
	items: Record<string, unknown>,
	keyFormatter?: (key: string) => string,
): string {
	const lines: string[] = [];

	for (const [key, value] of Object.entries(items)) {
		if (value === undefined || value === null) {
			continue;
		}

		const formattedKey = keyFormatter ? keyFormatter(key) : key;
		const formattedValue = formatValue(value);
		lines.push(`- **${formattedKey}**: ${formattedValue}`);
	}

	return lines.join("\n");
}

/**
 * Format a value based on its type
 * @param value - Value to format
 * @returns Formatted value
 */
function formatValue(value: unknown): string {
	if (value === undefined || value === null) {
		return "Not available";
	}

	if (value instanceof Date) {
		return formatDate(value);
	}

	// Handle URL objects with url and title properties
	if (typeof value === "object" && value !== null && "url" in value) {
		const urlObj = value as { url: string; title?: string };
		if (typeof urlObj.url === "string") {
			return formatUrl(urlObj.url, urlObj.title);
		}
	}

	if (typeof value === "string") {
		// Check if it's a URL
		if (value.startsWith("http://") || value.startsWith("https://")) {
			return formatUrl(value);
		}

		// Check if it might be a date
		if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(value)) {
			return formatDate(value);
		}

		return value;
	}

	if (typeof value === "boolean") {
		return value ? "Yes" : "No";
	}

	return String(value);
}

/**
 * Format a separator line
 * @returns Separator line
 */
export function formatSeparator(): string {
	return "---";
}

// === NEW UTILITIES ===

/**
 * Format an array safely, handling null/undefined cases
 * @param arr - Array to format
 * @param emptyMessage - Message when array is empty
 * @param separator - Separator between items
 * @returns Formatted array string
 */
export function formatSafeArray(
	arr: string[] | undefined | null,
	emptyMessage = "None",
	separator = ", ",
): string {
	if (!arr || arr.length === 0) return emptyMessage;
	return arr.join(separator);
}

/**
 * Format platform-specific data object (common pattern across formatters)
 * @param obj - Platform object with ios, android, web, other properties
 * @param emptyMessage - Message when no platforms configured
 * @returns Formatted platform data
 */
export function formatPlatformData(
	obj: unknown,
	emptyMessage = "Not configured",
): string {
	if (!obj || typeof obj !== "object") return emptyMessage;

	const platforms = ["ios", "android", "web", "other"] as const;
	const items: string[] = [];

	for (const platform of platforms) {
		const value = (obj as Record<string, string>)[platform];
		if (value) {
			items.push(`- **${platform.toUpperCase()}:** \`${value}\``);
		}
	}

	return items.length > 0 ? items.join("\n") : emptyMessage;
}

/**
 * Format progress percentage with appropriate status icon
 * @param progress - Progress percentage (0-100)
 * @returns Formatted progress with icon
 */
export function formatProgress(progress: number): string {
	if (progress >= 100) return `✅ ${progress}%`;
	if (progress >= 95) return `🟡 ${progress}%`;
	if (progress >= 70) return `🔄 ${progress}%`;
	return `🔴 ${progress}%`;
}

/**
 * Get status icon based on progress or completion state
 * @param progress - Progress value (0-100)
 * @returns Status icon
 */
export function getStatusIcon(progress: number): string {
	if (progress >= 100) return "✅";
	if (progress >= 95) return "🟡";
	if (progress >= 70) return "🔄";
	return "🔴";
}

/**
 * Format a markdown table from array of objects
 * @param data - Array of data objects
 * @param columns - Column configuration
 * @returns Formatted markdown table
 */
export function formatTable<T extends Record<string, unknown>>(
	data: T[],
	columns: Array<{
		key: keyof T;
		header: string;
		formatter?: (value: unknown) => string;
		maxWidth?: number;
	}>,
): string {
	if (data.length === 0) return "";

	const lines: string[] = [];

	// Header row
	const headers = columns.map((col) => col.header);
	lines.push(`| ${headers.join(" | ")} |`);

	// Separator row
	const separators = columns.map(() => "---");
	lines.push(`|${separators.map((sep) => `${sep}`).join("|")}|`);

	// Data rows
	for (const item of data) {
		const cells = columns.map((col) => {
			const value = item[col.key];
			let formattedValue: string;

			// Apply custom formatter if provided
			if (col.formatter) {
				formattedValue = col.formatter(value);
			} else {
				formattedValue = formatValue(value);
			}

			// Truncate if maxWidth specified
			if (col.maxWidth && formattedValue.length > col.maxWidth) {
				formattedValue = `${formattedValue.substring(0, col.maxWidth - 3)}...`;
			}

			return formattedValue;
		});
		lines.push(`| ${cells.join(" | ")} |`);
	}

	return lines.join("\n");
}

/**
 * Format statistics summary section
 * @param stats - Statistics object
 * @param title - Section title
 * @returns Formatted statistics section
 */
export function formatStatistics(
	stats: Record<string, number | string>,
	title = "Statistics",
): string {
	const lines: string[] = [];
	lines.push(formatHeading(title, 3));
	lines.push("");
	lines.push(formatBulletList(stats));
	lines.push("");
	return lines.join("\n");
}

/**
 * Format empty state message with context
 * @param entityType - Type of entity (projects, keys, etc.)
 * @param context - Additional context (project name, etc.)
 * @param suggestions - Array of suggestions
 * @returns Formatted empty state
 */
export function formatEmptyState(
	entityType: string,
	context?: string,
	suggestions: string[] = [],
): string {
	const lines: string[] = [];

	const contextText = context ? ` in ${context}` : "";
	lines.push(`**No ${entityType} found${contextText}.**`);
	lines.push("");

	if (suggestions.length > 0) {
		lines.push("This could mean:");
		for (const suggestion of suggestions) {
			lines.push(`- ${suggestion}`);
		}
		lines.push("");
	}

	return lines.join("\n");
}

/**
 * Format pagination information
 * @param hasMore - Whether there are more pages
 * @param cursor - Current cursor/page info
 * @param currentCount - Number of items in current page
 * @returns Formatted pagination info
 */
export function formatPaginationInfo(
	hasMore: boolean,
	cursor?: string | number | null,
	currentCount?: number,
): string {
	if (!hasMore) return "";

	const lines: string[] = [];
	lines.push(formatHeading("Pagination Information", 2));
	lines.push("");

	const itemText = currentCount ? ` - showing ${currentCount} items` : "";
	lines.push(
		`⚠️ **This is a paginated result**${itemText} out of potentially more.`,
	);
	lines.push("");

	if (cursor !== undefined) {
		lines.push(`- **Next Cursor:** \`${cursor}\``);
	}
	lines.push("- **Has More Data:** Yes");
	lines.push(
		"- **Recommendation:** Use the cursor to fetch additional items for complete analysis",
	);
	lines.push("");

	return lines.join("\n");
}

/**
 * Format error list from bulk operations
 * @param errors - Array of error objects
 * @returns Formatted error section
 */
export function formatErrorList(
	errors: Array<{
		message?: string;
		code?: string;
		key?: string;
		key_id?: number;
	}>,
): string {
	if (errors.length === 0) return "";

	const lines: string[] = [];
	lines.push(formatHeading("❌ Errors", 2));
	lines.push("");

	for (let i = 0; i < errors.length; i++) {
		const error = errors[i];
		lines.push(formatHeading(`Error ${i + 1}`, 3));
		lines.push("");

		const errorInfo: Record<string, unknown> = {
			Message: error.message || "Unknown error",
		};

		if (error.code) errorInfo.Code = `\`${error.code}\``;
		if (error.key) errorInfo.Key = `\`${error.key}\``;
		if (error.key_id) errorInfo["Key ID"] = error.key_id;

		lines.push(formatBulletList(errorInfo));
		lines.push("");
	}

	return lines.join("\n");
}

/**
 * Format recommendations/next steps list
 * @param recommendations - Array of recommendation strings
 * @param title - Section title
 * @returns Formatted recommendations section
 */
export function formatRecommendations(
	recommendations: string[],
	title = "Next Steps",
): string {
	if (recommendations.length === 0) return "";

	const lines: string[] = [];
	lines.push(formatHeading(title, 2));
	lines.push("");

	for (const recommendation of recommendations) {
		lines.push(`- ${recommendation}`);
	}
	lines.push("");

	return lines.join("\n");
}

/**
 * Format footer timestamp
 * @param action - Action performed (retrieved, created, etc.)
 * @param context - Additional context
 * @returns Formatted footer
 */
export function formatFooter(action = "retrieved", context?: string): string {
	const lines: string[] = [];
	lines.push(formatSeparator());

	const contextText = context ? ` ${context}` : "";
	lines.push(
		`*${action.charAt(0).toUpperCase() + action.slice(1)} at ${formatDate(new Date())}*${contextText}`,
	);

	return lines.join("\n");
}

/**
 * Format project context section with dashboard links
 * @param projectId - Project ID
 * @param sections - Additional sections to include
 * @returns Formatted project context
 */
export function formatProjectContext(
	projectId: string,
	sections: Array<{ path?: string; label: string; icon?: string }> = [],
): string {
	const lines: string[] = [];
	lines.push(formatHeading("Project", 2));

	const baseUrl = `https://app.lokalise.com/project/${projectId}`;

	// Default dashboard link
	lines.push(`${formatUrl(baseUrl, "View Project in Lokalise Dashboard")}`);

	// Additional sections
	for (const section of sections) {
		const url = section.path ? `${baseUrl}${section.path}` : baseUrl;
		const icon = section.icon ? `${section.icon} ` : "";
		lines.push(`${formatUrl(url, `${icon}${section.label}`)}`);
	}

	lines.push("");
	return lines.join("\n");
}

/**
 * Format quick actions section
 * @param projectId - Project ID
 * @param actions - Quick action configurations
 * @returns Formatted quick actions
 */
export function formatQuickActions(
	projectId: string,
	actions: Array<{ path: string; label: string; icon?: string }> = [],
): string {
	if (actions.length === 0) return "";

	const lines: string[] = [];
	lines.push(formatHeading("🔗 Quick Actions", 2));

	const baseUrl = `https://app.lokalise.com/project/${projectId}/?view=multi`;

	for (const action of actions) {
		const url = `${baseUrl}${action.path}`;
		const icon = action.icon ? `${action.icon} ` : "";
		lines.push(`• ${formatUrl(url, `${icon}${action.label}`)}`);
	}

	lines.push("");
	return lines.join("\n");
}

/**
 * Calculate and format percentage with proper rounding
 * @param value - Current value
 * @param total - Total value
 * @returns Formatted percentage
 */
export function formatPercentage(value: number, total: number): string {
	if (total === 0) return "0%";
	return `${Math.round((value / total) * 100)}%`;
}

/**
 * Format a truncated text with ellipsis if needed
 * @param text - Text to truncate
 * @param maxLength - Maximum length before truncation
 * @returns Truncated text
 */
export function formatTruncated(text: string, maxLength: number): string {
	if (text.length <= maxLength) return text;
	return `${text.substring(0, maxLength - 3)}...`;
}
