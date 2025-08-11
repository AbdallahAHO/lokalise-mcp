/**
 * Teamusers Formatter
 *
 * Handles formatting of Team Users API responses into human-readable Markdown.
 */

import type {
	PaginatedResult,
	TeamUser,
	TeamUserDeleted,
} from "@lokalise/node-api";

/**
 * Format a list of team users into Markdown
 */
export function formatTeamusersList(
	result: PaginatedResult<TeamUser>,
	teamId: string,
): string {
	let content = `# Team Users (Team: ${teamId})\n\n`;
	content += `**Total Users**: ${result.totalResults}\n`;
	content += `**Page**: ${result.currentPage} of ${result.totalPages}\n\n`;

	if (result.items.length === 0) {
		content += "*No users found in this team.*\n";
		return content;
	}

	// User list
	for (const user of result.items) {
		content += `## ${user.fullname} (ID: ${user.user_id})\n\n`;
		content += `- **Email**: ${user.email}\n`;
		content += `- **Role**: ${user.role}\n`;

		if (user.uuid) {
			content += `- **UUID**: ${user.uuid}\n`;
		}

		content += `- **Created**: ${new Date(user.created_at).toLocaleString()}\n`;
		content += `- **Created Timestamp**: ${user.created_at_timestamp}\n`;

		content += "\n---\n\n";
	}

	// Pagination info
	if (result.hasNextPage()) {
		content += `\n*More users available. Use page ${result.nextPage()} to see more.*\n`;
	}

	return content;
}

/**
 * Format team user details into Markdown
 */
export function formatTeamusersDetails(user: TeamUser): string {
	let content = `# Team User: ${user.fullname}\n\n`;
	content += `**User ID**: ${user.user_id}\n`;
	content += `**Email**: ${user.email}\n`;
	content += `**Role**: ${user.role}\n\n`;

	if (user.uuid) {
		content += `**UUID**: ${user.uuid}\n`;
	}

	content += "## Metadata\n";
	content += `- **Created**: ${new Date(user.created_at).toLocaleString()}\n`;
	content += `- **Created Timestamp**: ${user.created_at_timestamp}\n`;

	// Role explanation
	content += "\n## Role Permissions\n";
	switch (user.role) {
		case "owner":
			content += "- Full access to all team resources\n";
			content += "- Can manage billing and subscriptions\n";
			content += "- Can delete the team\n";
			break;
		case "admin":
			content += "- Can manage projects and team members\n";
			content += "- Can create and delete projects\n";
			content += "- Cannot manage billing\n";
			break;
		case "member":
			content += "- Can access assigned projects\n";
			content += "- Limited administrative permissions\n";
			break;
		case "biller":
			content += "- Can manage billing and subscriptions\n";
			content += "- Limited access to projects\n";
			break;
	}

	return content;
}

/**
 * Format update team user result into Markdown
 */
export function formatUpdateTeamusersResult(user: TeamUser): string {
	let content = "# Team User Updated Successfully\n\n";
	content += `**Name**: ${user.fullname}\n`;
	content += `**User ID**: ${user.user_id}\n`;
	content += `**Email**: ${user.email}\n`;
	content += `**New Role**: ${user.role}\n\n`;

	content += "✅ Team user role updated successfully\n";

	return content;
}

/**
 * Format delete team user result into Markdown
 */
export function formatDeleteTeamusersResult(result: TeamUserDeleted): string {
	let content = "# Team User Deleted Successfully\n\n";
	content += `**Team ID**: ${result.team_id}\n`;
	content += `**Status**: ${result.team_user_deleted ? "✅ Deleted" : "❌ Failed"}\n`;

	return content;
}
