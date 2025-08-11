/**
 * Usergroups Formatter
 *
 * Handles formatting of User Groups API responses into human-readable Markdown.
 */

import type {
	PaginatedResult,
	UserGroup,
	UserGroupDeleted,
} from "@lokalise/node-api";

/**
 * Format a list of user groups into Markdown
 */
export function formatUsergroupsList(
	result: PaginatedResult<UserGroup>,
	teamId: string,
): string {
	let content = `# User Groups (Team: ${teamId})\n\n`;
	content += `**Total Groups**: ${result.totalResults}\n`;
	content += `**Page**: ${result.currentPage} of ${result.totalPages}\n\n`;

	if (result.items.length === 0) {
		content += "*No user groups found for this team.*\n";
		return content;
	}

	// Group list
	for (const group of result.items) {
		content += `## ${group.name} (ID: ${group.group_id})\n\n`;

		// Permissions
		content += "### Permissions\n";
		content += `- **Admin**: ${group.permissions.is_admin ? "Yes" : "No"}\n`;
		content += `- **Reviewer**: ${group.permissions.is_reviewer ? "Yes" : "No"}\n`;

		if (
			group.permissions.is_admin &&
			group.permissions.admin_rights?.length > 0
		) {
			content += `- **Admin Rights**: ${group.permissions.admin_rights.join(", ")}\n`;
		}

		// Languages
		if (group.permissions.languages && group.permissions.languages.length > 0) {
			content += "\n### Language Permissions\n";
			for (const lang of group.permissions.languages) {
				content += `- **${lang.lang_name}** (${lang.lang_iso}): ${lang.is_writable ? "Read/Write" : "Read Only"}\n`;
			}
		}

		// Members and Projects
		if (group.members && group.members.length > 0) {
			content += `\n**Members**: ${group.members.length} user(s)\n`;
		}

		if (group.projects && group.projects.length > 0) {
			content += `**Projects**: ${group.projects.length} project(s)\n`;
		}

		// Metadata
		content += `\n**Created**: ${new Date(group.created_at).toLocaleString()}\n`;

		if (group.role_id) {
			content += `**Role ID**: ${group.role_id}\n`;
		}

		content += "\n---\n\n";
	}

	// Pagination info
	if (result.hasNextPage()) {
		content += `\n*More groups available. Use page ${result.nextPage()} to see more.*\n`;
	}

	return content;
}

/**
 * Format user group details into Markdown
 */
export function formatUsergroupsDetails(group: UserGroup): string {
	let content = `# User Group: ${group.name}\n\n`;
	content += `**Group ID**: ${group.group_id}\n`;
	content += `**Team ID**: ${group.team_id}\n\n`;

	// Permissions
	content += "## Permissions\n";
	content += `- **Admin**: ${group.permissions.is_admin ? "Yes" : "No"}\n`;
	content += `- **Reviewer**: ${group.permissions.is_reviewer ? "Yes" : "No"}\n`;

	if (
		group.permissions.is_admin &&
		group.permissions.admin_rights?.length > 0
	) {
		content += "\n### Admin Rights\n";
		for (const right of group.permissions.admin_rights) {
			content += `- ${right}\n`;
		}
	}

	// Language Permissions
	if (group.permissions.languages && group.permissions.languages.length > 0) {
		content += "\n## Language Permissions\n";
		content += "| Language | ISO | Access |\n";
		content += "|----------|-----|--------|\n";
		for (const lang of group.permissions.languages) {
			content += `| ${lang.lang_name} | ${lang.lang_iso} | ${lang.is_writable ? "Read/Write" : "Read Only"} |\n`;
		}
	}

	// Members
	if (group.members && group.members.length > 0) {
		content += `\n## Members (${group.members.length})\n`;
		for (const memberId of group.members) {
			content += `- User ID: ${memberId}\n`;
		}
	}

	// Projects
	if (group.projects && group.projects.length > 0) {
		content += `\n## Projects (${group.projects.length})\n`;
		for (const projectId of group.projects) {
			content += `- Project ID: ${projectId}\n`;
		}
	}

	// Metadata
	content += "\n## Metadata\n";
	content += `- **Created**: ${new Date(group.created_at).toLocaleString()}\n`;
	content += `- **Created Timestamp**: ${group.created_at_timestamp}\n`;

	if (group.role_id) {
		content += `- **Role ID**: ${group.role_id}\n`;
	}

	return content;
}

/**
 * Format create user group result into Markdown
 */
export function formatCreateUsergroupsResult(group: UserGroup): string {
	let content = "# User Group Created Successfully\n\n";
	content += `**Name**: ${group.name}\n`;
	content += `**Group ID**: ${group.group_id}\n`;
	content += `**Team ID**: ${group.team_id}\n\n`;

	// Permissions summary
	content += "## Permissions Set\n";
	content += `- **Admin**: ${group.permissions.is_admin ? "Yes" : "No"}\n`;
	content += `- **Reviewer**: ${group.permissions.is_reviewer ? "Yes" : "No"}\n`;

	if (
		group.permissions.is_admin &&
		group.permissions.admin_rights?.length > 0
	) {
		content += `- **Admin Rights**: ${group.permissions.admin_rights.join(", ")}\n`;
	}

	if (group.permissions.languages && group.permissions.languages.length > 0) {
		content += `- **Languages Configured**: ${group.permissions.languages.length}\n`;
	}

	content += `\n✅ User group created successfully at ${new Date(group.created_at).toLocaleString()}\n`;

	return content;
}

/**
 * Format update user group result into Markdown
 */
export function formatUpdateUsergroupsResult(group: UserGroup): string {
	let content = "# User Group Updated Successfully\n\n";
	content += `**Name**: ${group.name}\n`;
	content += `**Group ID**: ${group.group_id}\n`;
	content += `**Team ID**: ${group.team_id}\n\n`;

	// Updated permissions
	content += "## Updated Permissions\n";
	content += `- **Admin**: ${group.permissions.is_admin ? "Yes" : "No"}\n`;
	content += `- **Reviewer**: ${group.permissions.is_reviewer ? "Yes" : "No"}\n`;

	if (
		group.permissions.is_admin &&
		group.permissions.admin_rights?.length > 0
	) {
		content += `- **Admin Rights**: ${group.permissions.admin_rights.join(", ")}\n`;
	}

	if (group.permissions.languages && group.permissions.languages.length > 0) {
		content += `- **Languages**: ${group.permissions.languages.length} language(s) configured\n`;
	}

	content += "\n✅ User group updated successfully\n";

	return content;
}

/**
 * Format delete user group result into Markdown
 */
export function formatDeleteUsergroupsResult(result: UserGroupDeleted): string {
	let content = "# User Group Deleted Successfully\n\n";
	content += `**Team ID**: ${result.team_id}\n`;
	content += `**Status**: ${result.group_deleted ? "✅ Deleted" : "❌ Failed"}\n`;

	return content;
}

/**
 * Format add members result into Markdown
 */
export function formatAddMembersResult(
	group: UserGroup,
	addedCount: number,
): string {
	let content = "# Members Added Successfully\n\n";
	content += `**Group**: ${group.name} (ID: ${group.group_id})\n`;
	content += `**Members Added**: ${addedCount}\n`;
	content += `**Total Members**: ${group.members?.length || 0}\n\n`;

	content += `✅ Successfully added ${addedCount} member(s) to the user group\n`;

	return content;
}

/**
 * Format remove members result into Markdown
 */
export function formatRemoveMembersResult(
	group: UserGroup,
	removedCount: number,
): string {
	let content = "# Members Removed Successfully\n\n";
	content += `**Group**: ${group.name} (ID: ${group.group_id})\n`;
	content += `**Members Removed**: ${removedCount}\n`;
	content += `**Remaining Members**: ${group.members?.length || 0}\n\n`;

	content += `✅ Successfully removed ${removedCount} member(s) from the user group\n`;

	return content;
}

/**
 * Format add projects result into Markdown
 */
export function formatAddProjectsResult(
	group: UserGroup,
	addedCount: number,
): string {
	let content = "# Projects Added Successfully\n\n";
	content += `**Group**: ${group.name} (ID: ${group.group_id})\n`;
	content += `**Projects Added**: ${addedCount}\n`;
	content += `**Total Projects**: ${group.projects?.length || 0}\n\n`;

	content += `✅ Successfully added ${addedCount} project(s) to the user group\n`;

	return content;
}

/**
 * Format remove projects result into Markdown
 */
export function formatRemoveProjectsResult(
	group: UserGroup,
	removedCount: number,
): string {
	let content = "# Projects Removed Successfully\n\n";
	content += `**Group**: ${group.name} (ID: ${group.group_id})\n`;
	content += `**Projects Removed**: ${removedCount}\n`;
	content += `**Remaining Projects**: ${group.projects?.length || 0}\n\n`;

	content += `✅ Successfully removed ${removedCount} project(s) from the user group\n`;

	return content;
}
