import type { Project as LokaliseProject } from "@lokalise/node-api";
import { config } from "../../shared/index.js";
import {
	formatBulletList,
	formatDate,
	formatHeading,
	formatSeparator,
	formatUrl,
} from "../../shared/utils/formatter.util.js";

/**
 * Format a list of Lokalise projects into Markdown.
 * @param projects - Array of Lokalise project data.
 * @param includeStats - Whether to include detailed statistics.
 * @param metadata - Optional metadata about the result set.
 * @returns Formatted Markdown string.
 */
export function formatProjectsList(
	projects: LokaliseProject[],
	includeStats = false,
	metadata?: { page?: number; limit?: number; total?: number },
): string {
	const lines: string[] = [];

	// Add a main heading with optional pagination info
	const headingParts = [`Lokalise Projects (${projects.length})`];
	if (metadata?.page) {
		headingParts.push(`- Page ${metadata.page}`);
	}
	lines.push(formatHeading(headingParts.join(" "), 1));
	lines.push("");

	if (projects.length === 0) {
		lines.push(
			"No projects found. Create your first project in the Lokalise dashboard.",
		);
		lines.push("");
		lines.push(formatSeparator());
		lines.push(`*List retrieved at ${formatDate(new Date())}*`);
		return lines.join("\n");
	}

	// Add projects list
	for (const project of projects) {
		lines.push(formatHeading(project.name, 2));
		lines.push("");

		// Add basic project information section
		lines.push(formatHeading("Project Information", 3));

		const projectInfo: Record<string, unknown> = {
			"Project ID": project.project_id,
			"Base Language": project.base_language_iso,
			Created: formatDate(project.created_at),
			"Created By": project.created_by_email,
		};

		// Add description if available
		if (project.description) {
			projectInfo.Description = project.description;
		}

		// Add basic stats inline if not detailed
		if (project.statistics) {
			projectInfo.Progress = `${project.statistics.progress_total}%`;
			projectInfo["Total Keys"] = project.statistics.keys_total;
			projectInfo.Languages = project.statistics.languages?.length;
		} else {
			projectInfo.Progress = "N/A";
			projectInfo["Total Keys"] = "N/A";
			projectInfo.Languages = "N/A";
		}

		lines.push(formatBulletList(projectInfo));
		lines.push("");

		if (project.statistics && includeStats) {
			// Add statistics section if available and requested
			lines.push(formatHeading("Project Statistics", 3));

			const statsInfo: Record<string, unknown> = {
				Progress: `${project.statistics.progress_total}%`,
				"Total Keys": project.statistics.keys_total,
				Languages: project.statistics.languages?.length,
				"Team Members": project.statistics.team,
				"Base Words": project.statistics.base_words,
			};

			if (project.statistics.qa_issues_total > 0) {
				statsInfo["QA Issues"] = project.statistics.qa_issues_total;
			}

			lines.push(formatBulletList(statsInfo));
			lines.push("");
		}

		// Add project URL section
		lines.push(formatHeading("Dashboard", 3));
		const baseUrl = config.getLokaliseHostname("lokalise.com");
		const projectUrl = `https://app.${baseUrl}/project/${project.project_id}/?view=multi`;
		lines.push(`${formatUrl(projectUrl, "View in Lokalise Dashboard")}`);
		lines.push("");
	}

	// Add a separator
	lines.push(formatSeparator());

	// Add a timestamp footer
	lines.push(`*List retrieved at ${formatDate(new Date())}*`);

	return lines.join("\n");
}

/**
 * Format detailed project information into a comprehensive Markdown report.
 * This provides all available project data without recommendations or suggestions.
 * @param project - Lokalise project data.
 * @param _includeLanguages - Whether to include language information (kept for backward compatibility).
 * @param _includeKeysSummary - Whether to include keys summary (kept for backward compatibility).
 * @returns Comprehensive formatted Markdown string with all project data.
 */
export function formatProjectDetails(
	project: LokaliseProject,
	_includeLanguages = false,
	_includeKeysSummary = false,
): string {
	const lines: string[] = [];

	// Main heading with progress indicator
	const progressIndicator = project.statistics?.progress_total
		? project.statistics.progress_total >= 95
			? "🟢"
			: project.statistics.progress_total >= 70
				? "🟡"
				: "🔴"
		: "⚪";

	lines.push(formatHeading(`${progressIndicator} Project: ${project.name}`, 1));
	lines.push("");

	// Project overview
	lines.push(formatHeading("📋 Project Overview", 2));

	const projectInfo: Record<string, unknown> = {
		"Project ID": `\`${project.project_id}\``,
		"Project Type": project.project_type || "localization_files",
		"Base Language": `${project.base_language_iso} (ID: ${project.base_language_id})`,
		"Team ID": project.team_id,
		Created: formatDate(project.created_at),
		"Created By": project.created_by_email,
	};

	if (project.uuid) {
		projectInfo["Project UUID"] = project.uuid;
	}

	if (project.team_uuid) {
		projectInfo["Team UUID"] = project.team_uuid;
	}

	if (project.description?.trim()) {
		projectInfo.Description = project.description;
	} else {
		projectInfo.Description = "*No description provided*";
	}

	lines.push(formatBulletList(projectInfo));
	lines.push("");

	// Comprehensive statistics
	lines.push(formatHeading("📊 Project Statistics", 2));

	if (project.statistics) {
		// Overall metrics
		lines.push(formatHeading("Overall Progress", 3));
		const overallStats: Record<string, unknown> = {
			Completion: `${project.statistics.progress_total}%`,
			"Total Keys": project.statistics.keys_total.toLocaleString(),
			"Base Words": project.statistics.base_words.toLocaleString(),
			"Team Members": project.statistics.team,
			"Active Languages": project.statistics.languages?.length || 0,
			"QA Issues": project.statistics.qa_issues_total,
		};
		lines.push(formatBulletList(overallStats));
		lines.push("");
	} else {
		lines.push("*No statistics available for this project*");
		lines.push("");
	}

	if (
		project.statistics?.languages &&
		project.statistics.languages.length > 0
	) {
		// Language-specific progress
		lines.push(formatHeading("🌐 Language Progress", 3));

		// Sort by progress to show completion status clearly
		const sortedLanguages = [...project.statistics.languages].sort(
			(a, b) => b.progress - a.progress,
		);

		for (const lang of sortedLanguages) {
			const progressIcon =
				lang.progress >= 100 ? "✅" : lang.progress >= 95 ? "🔄" : "⚠️";
			const remainingWords =
				lang.words_to_do > 0
					? ` (${lang.words_to_do.toLocaleString()} words remaining)`
					: "";
			lines.push(
				`${progressIcon} **${lang.language_iso.toUpperCase()}** (ID: ${lang.language_id}): ${lang.progress}%${remainingWords}`,
			);
		}
		lines.push("");
	}

	if (project.statistics && project.statistics.qa_issues_total > 0) {
		// Detailed QA Analysis
		lines.push(formatHeading("🔍 Quality Assurance Issues", 3));
		lines.push(`**Total Issues: ${project.statistics.qa_issues_total}**`);
		lines.push("");

		const qaIssues = project.statistics.qa_issues;
		const allIssueTypes = [
			{
				name: "Not Reviewed",
				count: qaIssues.not_reviewed,
				description: "Translations pending review",
			},
			{
				name: "Unverified",
				count: qaIssues.unverified,
				description: "Translations not yet verified",
			},
			{
				name: "Spelling/Grammar",
				count: qaIssues.spelling_grammar,
				description: "Potential language quality issues",
			},
			{
				name: "Inconsistent Placeholders",
				count: qaIssues.inconsistent_placeholders,
				description: "Placeholder format mismatches",
			},
			{
				name: "Inconsistent HTML",
				count: qaIssues.inconsistent_html,
				description: "HTML tag discrepancies",
			},
			{
				name: "Different Number of URLs",
				count: qaIssues.different_number_of_urls,
				description: "URL count variations",
			},
			{
				name: "Different URLs",
				count: qaIssues.different_urls,
				description: "URL content differences",
			},
			{
				name: "Leading Whitespace",
				count: qaIssues.leading_whitespace,
				description: "Extra spaces at start",
			},
			{
				name: "Trailing Whitespace",
				count: qaIssues.trailing_whitespace,
				description: "Extra spaces at end",
			},
			{
				name: "Different Number of Email Addresses",
				count: qaIssues.different_number_of_email_address,
				description: "Email count variations",
			},
			{
				name: "Different Email Addresses",
				count: qaIssues.different_email_address,
				description: "Email content differences",
			},
			{
				name: "Different Brackets",
				count: qaIssues.different_brackets,
				description: "Bracket usage inconsistencies",
			},
			{
				name: "Different Numbers",
				count: qaIssues.different_numbers,
				description: "Numeric value differences",
			},
			{
				name: "Double Space",
				count: qaIssues.double_space,
				description: "Multiple consecutive spaces",
			},
			{
				name: "Special Placeholder Issues",
				count: qaIssues.special_placeholder,
				description: "Special format placeholder problems",
			},
			{
				name: "Unbalanced Brackets",
				count: qaIssues.unbalanced_brackets,
				description: "Mismatched brackets/parentheses",
			},
		];

		// Display all issues with counts > 0
		const activeIssues = allIssueTypes.filter((issue) => issue.count > 0);
		if (activeIssues.length > 0) {
			for (const issue of activeIssues) {
				lines.push(
					`• **${issue.name}**: ${issue.count} ${issue.count === 1 ? "issue" : "issues"} - *${issue.description}*`,
				);
			}
			lines.push("");
		}

		// QA health metric
		const qaHealthScore = Math.max(
			0,
			100 -
				(project.statistics.qa_issues_total / project.statistics.keys_total) *
					100,
		);
		const healthIcon =
			qaHealthScore >= 95 ? "🟢" : qaHealthScore >= 80 ? "🟡" : "🔴";
		lines.push(
			`${healthIcon} **QA Health Score**: ${qaHealthScore.toFixed(1)}%`,
		);
		lines.push("");
	} else {
		lines.push(formatHeading("✅ Quality Assurance", 3));
		lines.push("No QA issues detected.");
		lines.push("");
	}

	// Complete project settings
	lines.push(formatHeading("⚙️ Project Configuration", 2));

	if (project.settings) {
		const allSettings: Record<string, unknown> = {
			"Review Workflow": project.settings.reviewing
				? "✅ Enabled"
				: "❌ Disabled",
			"Auto-toggle Unverified": project.settings.auto_toggle_unverified
				? "✅ Enabled"
				: "❌ Disabled",
			"Offline Translation": project.settings.offline_translation
				? "✅ Enabled"
				: "❌ Disabled",
			"Per-platform Key Names": project.settings.per_platform_key_names
				? "✅ Enabled"
				: "❌ Disabled",
			"Key Editing": project.settings.key_editing
				? "✅ Enabled"
				: "❌ Disabled",
			"Inline Machine Translations": project.settings
				.inline_machine_translations
				? "✅ Enabled"
				: "❌ Disabled",
			Branching: project.settings.branching ? "✅ Enabled" : "❌ Disabled",
			Segmentation: project.settings.segmentation
				? "✅ Enabled"
				: "❌ Disabled",
			"Custom Translation Statuses": project.settings
				.custom_translation_statuses
				? "✅ Enabled"
				: "❌ Disabled",
			"Multiple Custom Statuses": project.settings
				.custom_translation_statuses_allow_multiple
				? "✅ Enabled"
				: "❌ Disabled",
		};

		lines.push(formatBulletList(allSettings));
		lines.push("");
	} else {
		lines.push("*No configuration settings available*");
		lines.push("");
	}

	// Project context data
	lines.push(formatHeading("📋 Project Context", 2));
	const contextInfo: string[] = [];

	if (project.statistics) {
		// Basic project metrics
		contextInfo.push(
			`📊 **Progress**: ${project.statistics.progress_total}% complete`,
		);
		contextInfo.push(
			`🔑 **Scale**: ${project.statistics.keys_total.toLocaleString()} keys, ${project.statistics.base_words.toLocaleString()} words`,
		);
		contextInfo.push(`👥 **Team**: ${project.statistics.team} members`);
		contextInfo.push(
			`🌐 **Languages**: ${project.statistics.languages?.length || 0} active`,
		);

		// Workload summary
		const totalRemainingWords = project.statistics.languages.reduce(
			(
				sum: number,
				l: {
					language_id: number;
					language_iso: string;
					progress: number;
					words_to_do: number;
				},
			) => sum + l.words_to_do,
			0,
		);
		if (totalRemainingWords > 0) {
			contextInfo.push(
				`📝 **Remaining Work**: ${totalRemainingWords.toLocaleString()} words`,
			);
		}
	}

	for (const context of contextInfo) {
		lines.push(`• ${context}`);
	}
	lines.push("");

	// Quick actions
	lines.push(formatHeading("🔗 Quick Actions", 2));
	const baseUrl = config.getLokaliseHostname("lokalise.com");
	const projectUrl = `https://app.${baseUrl}/project/${project.project_id}/?view=multi`;

	lines.push(`• ${formatUrl(projectUrl, "📊 View Dashboard")}`);
	lines.push(`• ${formatUrl(`${projectUrl}/settings`, "⚙️ Project Settings")}`);
	lines.push(`• ${formatUrl(`${projectUrl}/statistics`, "📈 Statistics")}`);
	lines.push(`• ${formatUrl(`${projectUrl}/keys`, "🔑 Keys")}`);
	lines.push(`• ${formatUrl(`${projectUrl}/languages`, "🌐 Languages")}`);

	if (
		project.statistics?.qa_issues_total &&
		project.statistics.qa_issues_total > 0
	) {
		lines.push(`• ${formatUrl(`${projectUrl}/qa`, "🔍 QA Issues")}`);
	}
	lines.push("");

	// Footer
	lines.push(formatSeparator());
	lines.push(`*Complete project data exported at ${formatDate(new Date())}*`);
	lines.push(`*Project ID: \`${project.project_id}\`*`);

	return lines.join("\n");
}

/**
 * Format project creation result into Markdown.
 * @param project - The created Lokalise project data.
 * @returns Formatted Markdown string.
 */
export function formatCreateProjectResult(project: LokaliseProject): string {
	const lines: string[] = [];

	// Add main heading
	lines.push(formatHeading("Project Created Successfully", 1));
	lines.push("");

	// Add project information section
	lines.push(formatHeading("Project Information", 2));

	const projectInfo: Record<string, unknown> = {
		"Project Name": project.name,
		"Project ID": project.project_id,
		"Base Language": project.base_language_iso,
		Created: formatDate(project.created_at),
		"Created By": project.created_by_email,
	};

	// Add description if available
	if (project.description) {
		projectInfo.Description = project.description;
	}

	lines.push(formatBulletList(projectInfo));
	lines.push("");

	// Add next steps section
	lines.push(formatHeading("Next Steps", 2));
	const nextSteps = [
		"Add target languages to your project",
		"Upload or create translation keys",
		"Invite team members as translators",
		"Set up integrations with your development workflow",
	];

	for (const step of nextSteps) {
		lines.push(`- ${step}`);
	}
	lines.push("");

	// Add dashboard link
	lines.push(formatHeading("Dashboard", 2));
	const baseUrl = config.getLokaliseHostname("lokalise.com");
	const projectUrl = `https://app.${baseUrl}/project/${project.project_id}/?view=multi`;
	lines.push(`${formatUrl(projectUrl, "Open Project in Lokalise Dashboard")}`);
	lines.push("");

	// Add separator and timestamp
	lines.push(formatSeparator());
	lines.push(`*Project created at ${formatDate(new Date())}*`);

	return lines.join("\n");
}

/**
 * Format project update result into Markdown.
 * @param project - The updated Lokalise project data.
 * @returns Formatted Markdown string.
 */
export function formatUpdateProjectResult(project: LokaliseProject): string {
	const lines: string[] = [];

	// Add main heading
	lines.push(formatHeading("Project Updated Successfully", 1));
	lines.push("");

	// Add project information section
	lines.push(formatHeading("Updated Project Information", 2));

	const projectInfo: Record<string, unknown> = {
		"Project Name": project.name,
		"Project ID": project.project_id,
		"Base Language": project.base_language_iso,
		"Last Modified": formatDate(new Date()),
	};

	// Add description if available
	if (project.description) {
		projectInfo.Description = project.description;
	}

	lines.push(formatBulletList(projectInfo));
	lines.push("");

	// Add dashboard link
	lines.push(formatHeading("Dashboard", 2));
	const baseUrl = config.getLokaliseHostname("lokalise.com");
	const projectUrl = `https://app.${baseUrl}/project/${project.project_id}/?view=multi`;
	lines.push(`${formatUrl(projectUrl, "View Project in Lokalise Dashboard")}`);
	lines.push("");

	// Add separator and timestamp
	lines.push(formatSeparator());
	lines.push(`*Project updated at ${formatDate(new Date())}*`);

	return lines.join("\n");
}

/**
 * Format project deletion result into Markdown.
 * @param projectId - The ID of the deleted project.
 * @returns Formatted Markdown string.
 */
export function formatDeleteProjectResult(projectId: string): string {
	const lines: string[] = [];

	// Add main heading
	lines.push(formatHeading("Project Deleted Successfully", 1));
	lines.push("");

	// Add deletion information
	lines.push(formatHeading("Deletion Details", 2));

	const deletionInfo: Record<string, unknown> = {
		"Deleted Project ID": projectId,
		"Deletion Time": formatDate(new Date()),
		Status: "Permanently deleted",
	};

	lines.push(formatBulletList(deletionInfo));
	lines.push("");

	// Add warning
	lines.push(formatHeading("⚠️ Important", 2));
	lines.push("- This action cannot be undone");
	lines.push("- All translation keys and data have been permanently removed");
	lines.push("- Team members will lose access to this project");
	lines.push(
		"- Consider creating a backup before deleting projects in the future",
	);
	lines.push("");

	// Add separator and timestamp
	lines.push(formatSeparator());
	lines.push(`*Project deleted at ${formatDate(new Date())}*`);

	return lines.join("\n");
}

/**
 * Format project empty result into Markdown.
 * @param projectId - The ID of the emptied project.
 * @returns Formatted Markdown string.
 */
export function formatEmptyProjectResult(projectId: string): string {
	const lines: string[] = [];

	// Add main heading
	lines.push(formatHeading("Project Emptied Successfully", 1));
	lines.push("");

	// Add empty information
	lines.push(formatHeading("Operation Details", 2));

	const emptyInfo: Record<string, unknown> = {
		"Project ID": projectId,
		"Operation Time": formatDate(new Date()),
		"Keys Deleted": "All translation keys removed",
		"Project Status": "Empty project retained",
	};

	lines.push(formatBulletList(emptyInfo));
	lines.push("");

	// Add next steps
	lines.push(formatHeading("Next Steps", 2));
	const nextSteps = [
		"Upload new translation files or create new keys",
		"Set up your project structure again",
		"Import content from backup if needed",
		"Configure project settings as required",
	];

	for (const step of nextSteps) {
		lines.push(`- ${step}`);
	}
	lines.push("");

	// Add dashboard link
	lines.push(formatHeading("Dashboard", 2));
	const baseUrl = config.getLokaliseHostname("lokalise.com");
	const projectUrl = `https://app.${baseUrl}/project/${projectId}/?view=multi`;
	lines.push(`${formatUrl(projectUrl, "View Project in Lokalise Dashboard")}`);
	lines.push("");

	// Add separator and timestamp
	lines.push(formatSeparator());
	lines.push(`*Project emptied at ${formatDate(new Date())}*`);

	return lines.join("\n");
}
