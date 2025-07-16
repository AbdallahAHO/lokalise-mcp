import type {
	Contributor,
	ContributorDeleted,
	PaginatedResult,
} from "@lokalise/node-api";
import {
	formatBulletList,
	formatDate,
	formatEmptyState,
	formatFooter,
	formatHeading,
	formatTable,
} from "../../shared/utils/formatter.util.js";

/**
 * Contributors formatter functions for converting API responses to user-friendly Markdown.
 * Generated on 2025-07-08 for Team member and contributor management.
 */

/**
 * Format a list of contributors into Markdown.
 * @param contributorsData - API response containing contributors list
 * @returns Formatted Markdown string
 */
export function formatContributorsList(
	contributorsData: PaginatedResult<Contributor>,
): string {
	const lines: string[] = [];

	// Add main heading
	const totalCount =
		contributorsData.totalResults || contributorsData.items?.length || 0;
	lines.push(formatHeading(`Contributors List (${totalCount})`, 1));
	lines.push("");

	if (!contributorsData.items || contributorsData.items.length === 0) {
		const suggestions = [
			"Add team members to collaborate on translations",
			"Check if you have the correct project ID",
			"Verify your admin permissions for this project",
		];
		lines.push(formatEmptyState("contributors", "this project", suggestions));
		lines.push(formatFooter("List retrieved"));
		return lines.join("\n");
	}

	// Add summary section
	lines.push(formatHeading("Summary", 2));
	const summary: Record<string, unknown> = {
		"Total Contributors": totalCount,
		"Current Page": contributorsData.currentPage || 1,
		"Total Pages": contributorsData.totalPages || 1,
		"Results Per Page":
			contributorsData.resultsPerPage || contributorsData.items.length,
	};
	lines.push(formatBulletList(summary));
	lines.push("");

	// Add contributors table
	lines.push(formatHeading("Contributors", 2));

	const tableData = contributorsData.items.map((contributor: Contributor) => ({
		id: contributor.user_id,
		email: contributor.email,
		name: contributor.fullname || "-",
		role: formatRole(contributor),
		languages: formatLanguageAccess(contributor.languages),
		joined: contributor.created_at
			? formatDate(new Date(contributor.created_at))
			: "-",
	}));

	const table = formatTable(tableData, [
		{ key: "id", header: "User ID" },
		{ key: "email", header: "Email" },
		{ key: "name", header: "Full Name" },
		{ key: "role", header: "Role" },
		{ key: "languages", header: "Languages" },
		{ key: "joined", header: "Joined" },
	]);

	lines.push(table);
	lines.push("");

	// Add pagination info if applicable
	if (contributorsData.totalPages > 1) {
		lines.push(formatHeading("Pagination", 2));
		lines.push(
			`Page ${contributorsData.currentPage} of ${contributorsData.totalPages}`,
		);
		if (contributorsData.hasNextPage()) {
			lines.push(`- Next page: ${contributorsData.nextPage()}`);
		}
		if (contributorsData.hasPrevPage()) {
			lines.push(`- Previous page: ${contributorsData.prevPage()}`);
		}
		lines.push("");
	}

	// Add footer
	lines.push(formatFooter("Contributors list retrieved"));

	return lines.join("\n");
}

/**
 * Format contributor details into Markdown.
 * @param contributor - Contributor object from API
 * @returns Formatted Markdown string
 */
export function formatContributorDetails(contributor: Contributor): string {
	const lines: string[] = [];

	// Add main heading
	lines.push(
		formatHeading(
			`Contributor: ${contributor.fullname || contributor.email}`,
			1,
		),
	);
	lines.push("");

	// Basic information
	lines.push(formatHeading("Basic Information", 2));
	const basicInfo: Record<string, unknown> = {
		"User ID": contributor.user_id,
		Email: contributor.email,
		"Full Name": contributor.fullname || "Not set",
		UUID: contributor.uuid || "Not available",
		"Role ID": contributor.role_id || "Not set",
		Joined: contributor.created_at
			? formatDate(new Date(contributor.created_at))
			: "Unknown",
	};
	lines.push(formatBulletList(basicInfo));
	lines.push("");

	// Permissions
	lines.push(formatHeading("Permissions", 2));
	const permissions: Record<string, unknown> = {
		"Is Admin": contributor.is_admin ? "Yes (deprecated)" : "No",
		"Is Reviewer": contributor.is_reviewer ? "Yes (deprecated)" : "No",
		"Admin Rights":
			contributor.admin_rights?.length > 0
				? contributor.admin_rights.join(", ")
				: "None",
	};
	lines.push(formatBulletList(permissions));
	lines.push("");

	// Language access
	lines.push(formatHeading("Language Access", 2));
	if (contributor.languages && contributor.languages.length > 0) {
		const langTable = contributor.languages.map((lang) => ({
			id: lang.lang_id,
			iso: lang.lang_iso,
			name: lang.lang_name,
			access: lang.is_writable ? "Read/Write" : "Read-only",
		}));

		const table = formatTable(langTable, [
			{ key: "id", header: "ID" },
			{ key: "iso", header: "ISO Code" },
			{ key: "name", header: "Language" },
			{ key: "access", header: "Access" },
		]);
		lines.push(table);
	} else {
		lines.push("No language access configured");
	}
	lines.push("");

	// Add footer
	lines.push(formatFooter("Contributor details retrieved"));

	return lines.join("\n");
}

/**
 * Format add contributors result into Markdown.
 * @param contributors - Array of added contributors
 * @returns Formatted Markdown string
 */
export function formatAddContributorsResult(
	contributors: Contributor[],
): string {
	const lines: string[] = [];

	// Add main heading
	lines.push(formatHeading(`Contributors Added (${contributors.length})`, 1));
	lines.push("");

	// List added contributors
	lines.push(formatHeading("Added Contributors", 2));

	const tableData = contributors.map((contributor: Contributor) => ({
		id: contributor.user_id,
		email: contributor.email,
		name: contributor.fullname || "-",
		role: formatRole(contributor),
		languages: contributor.languages?.length || 0,
	}));

	const table = formatTable(tableData, [
		{ key: "id", header: "User ID" },
		{ key: "email", header: "Email" },
		{ key: "name", header: "Full Name" },
		{ key: "role", header: "Role" },
		{ key: "languages", header: "Languages" },
	]);

	lines.push(table);
	lines.push("");

	// Add footer
	lines.push(
		formatFooter(`${contributors.length} contributor(s) added successfully`),
	);

	return lines.join("\n");
}

/**
 * Format update contributor result into Markdown.
 * @param contributor - Updated contributor object
 * @returns Formatted Markdown string
 */
export function formatUpdateContributorResult(
	contributor: Contributor,
): string {
	const lines: string[] = [];

	// Add main heading
	lines.push(formatHeading("Contributor Updated", 1));
	lines.push("");

	// Show updated details
	lines.push(formatHeading("Updated Details", 2));
	const details: Record<string, unknown> = {
		"User ID": contributor.user_id,
		Email: contributor.email,
		"Full Name": contributor.fullname || "Not set",
		"Admin Rights":
			contributor.admin_rights?.length > 0
				? contributor.admin_rights.join(", ")
				: "None",
		Languages: contributor.languages?.length || 0,
	};
	lines.push(formatBulletList(details));
	lines.push("");

	// Add footer
	lines.push(formatFooter("Contributor updated successfully"));

	return lines.join("\n");
}

/**
 * Format remove contributor result into Markdown.
 * @param result - Deletion result from API
 * @returns Formatted Markdown string
 */
export function formatRemoveContributorResult(
	result: ContributorDeleted,
): string {
	const lines: string[] = [];

	// Add main heading
	lines.push(formatHeading("Contributor Removed", 1));
	lines.push("");

	// Confirmation details
	lines.push(formatHeading("Removal Confirmation", 2));
	const details: Record<string, unknown> = {
		"Project ID": result.project_id,
		Removed: result.contributor_deleted ? "Yes" : "No",
		Branch: result.branch || "Main",
	};
	lines.push(formatBulletList(details));
	lines.push("");

	// Add footer
	lines.push(formatFooter("Contributor removed successfully"));

	return lines.join("\n");
}

// Helper functions

/**
 * Format contributor role information
 */
function formatRole(contributor: Contributor): string {
	if (contributor.is_admin) return "Admin (deprecated)";
	if (contributor.is_reviewer) return "Reviewer (deprecated)";
	if (contributor.admin_rights && contributor.admin_rights.length > 0) {
		return `Custom (${contributor.admin_rights.length} rights)`;
	}
	return "Member";
}

/**
 * Format language access summary
 */
function formatLanguageAccess(
	languages:
		| Array<{
				lang_id: number;
				lang_iso: string;
				lang_name: string;
				is_writable: boolean;
		  }>
		| undefined,
): string {
	if (!languages || languages.length === 0) return "None";

	const writable = languages.filter((l) => l.is_writable).length;
	const readonly = languages.length - writable;

	if (writable === languages.length)
		return `${languages.length} (all writable)`;
	if (readonly === languages.length)
		return `${languages.length} (all read-only)`;
	return `${languages.length} (${writable} writable, ${readonly} read-only)`;
}
