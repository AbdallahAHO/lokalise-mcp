import type { PaginatedResult, Task, TaskDeleted } from "@lokalise/node-api";
import {
	formatBulletList,
	formatDate,
	formatEmptyState,
	formatFooter,
	formatHeading,
	formatPaginationInfo,
	formatTable,
} from "../../shared/utils/formatter.util.js";

/**
 * @namespace TasksFormatter
 * @description Utility functions for formatting Lokalise Tasks API responses into readable formats.
 *              Provides consistent Markdown formatting for various task operations.
 */

/**
 * @function formatTasksList
 * @description Formats a list of tasks into a comprehensive, LLM-friendly Markdown report
 * @memberof TasksFormatter
 * @param {PaginatedResult<Task>} response - The raw response from the Lokalise Tasks API list operation
 * @param {string} projectId - The project ID for context
 * @returns {string} Formatted Markdown string containing the tasks list
 */
export function formatTasksList(
	response: PaginatedResult<Task>,
	projectId: string,
): string {
	const tasks = response.items || [];
	const hasNextCursor = response.hasNextPage();

	const lines: string[] = [];
	lines.push(formatHeading("Tasks Analysis", 1));
	lines.push("");

	lines.push(formatHeading(`Project: ${projectId}`, 2));
	lines.push("");

	if (tasks.length === 0) {
		const suggestions = [
			"The project has no tasks created yet",
			"All tasks have been deleted",
			"Filter criteria excluded all tasks",
			"You may not have permission to view tasks",
		];
		lines.push(formatEmptyState("tasks", "this project", suggestions));
		lines.push(formatFooter("Analysis completed"));
		return lines.join("\n");
	}

	// Executive Summary
	lines.push(formatHeading("Executive Summary", 2));
	lines.push("");

	lines.push(`**${tasks.length} tasks** found in this project.`);
	lines.push("");

	// Pagination information
	lines.push(
		formatPaginationInfo(hasNextCursor, response.nextPage(), tasks.length),
	);

	// Tasks table
	lines.push(formatHeading("Task Inventory", 2));
	lines.push("");

	const tableData = tasks.map((task) => ({
		id: task.task_id || "N/A",
		title: task.title || "Untitled",
		status: task.status || "Unknown",
		type: task.task_type || "Unknown",
		sourceLanguage: task.source_language_iso || "Unknown",
		progress: typeof task.progress === "number" ? `${task.progress}%` : "N/A",
		keys: typeof task.keys_count === "number" ? task.keys_count : "N/A",
		words: typeof task.words_count === "number" ? task.words_count : "N/A",
		dueDate: formatDueDate(task.due_date),
		created: formatCreatedDate(task.created_at),
	}));

	const table = formatTable(tableData, [
		{ key: "id", header: "ID" },
		{ key: "title", header: "Title", maxWidth: 30 },
		{ key: "status", header: "Status" },
		{ key: "type", header: "Type" },
		{ key: "progress", header: "Progress" },
		{ key: "keys", header: "Keys" },
		{ key: "words", header: "Words" },
		{ key: "dueDate", header: "Due Date" },
		{ key: "created", header: "Created" },
	]);

	lines.push(table);
	lines.push("");

	// Detailed snapshots per task covering all fields
	lines.push(formatHeading("Detailed Task Snapshots", 2));
	lines.push("");
	for (const task of tasks) {
		lines.push(
			formatHeading(`Task #${task.task_id} – ${task.title || "Untitled"}`, 3),
		);
		lines.push(formatTaskSnapshot(task));
		lines.push("");
	}

	// Summary
	lines.push(formatHeading("Summary", 2));
	lines.push("");

	lines.push(
		`**Project ${projectId} has ${tasks.length} tasks** in this view.`,
	);
	lines.push("");

	// Footer
	lines.push(
		formatFooter(
			"Analysis completed",
			`Showing ${tasks.length} tasks from project \`${projectId}\``,
		),
	);
	if (hasNextCursor) {
		lines.push(
			"*Additional tasks available - use cursor pagination to fetch more*",
		);
	}

	return lines.join("\n");
}

/**
 * @function formatTaskDetails
 * @description Formats detailed information about a single task with comprehensive LLM-friendly output
 * @memberof TasksFormatter
 * @param {Task} task - The task object from Lokalise API
 * @param {string} projectId - The project ID for context
 * @returns {string} Formatted Markdown string containing the task details
 */
export function formatTaskDetails(task: Task, projectId: string): string {
	const lines: string[] = [];

	// Main heading
	lines.push(formatHeading("Task Details", 1));
	lines.push("");

	// Core identification
	lines.push(formatHeading("Core Information", 2));
	const coreInfo: Record<string, unknown> = {
		"Task ID": task.task_id,
		"Project ID": `\`${projectId}\``,
		Title: task.title || "*No title provided*",
		Description: task.description || "*No description provided*",
		Type: task.task_type || "Unknown",
		Status: task.status || "Unknown",
		"Can Be Parent": boolToYesNo(task.can_be_parent),
		"Parent Task ID": task.parent_task_id ?? "None",
		"Closing Tags": formatArray(task.closing_tags),
		"Lock Translations": boolToYesNo(task.do_lock_translations),
		"Custom Status IDs": formatArray(task.custom_translation_status_ids),
	};
	lines.push(formatBulletList(coreInfo));
	lines.push("");

	// Schedule information
	lines.push(formatHeading("Schedule Information", 2));
	const scheduleInfo = formatScheduleInfo(task);
	lines.push(scheduleInfo);

	if (task.created_at) {
		// Timeline information
		const timeline: Record<string, unknown> = {
			Created: formatCreatedDateWithTime(task.created_at),
		};
		lines.push(formatBulletList(timeline));
		lines.push("");
	}

	// Language assignments (detailed)
	lines.push(formatHeading("Language Assignments", 2));
	if (task.languages && task.languages.length > 0) {
		lines.push(`**Target Languages:** ${task.languages.length}`);
		lines.push("");
		for (const language of task.languages) {
			lines.push(formatLanguageDetails(language));
		}
	} else {
		lines.push("*No languages assigned to this task*");
		lines.push("");
	}

	// Task configuration & metrics
	lines.push(formatHeading("Configuration & Metrics", 2));
	const configInfo: Record<string, unknown> = {
		"Source Language": task.source_language_iso || "Not specified",
		"Auto-close Languages": boolToYesNo(task.auto_close_languages),
		"Auto-close Task": boolToYesNo(task.auto_close_task),
		"Auto-close Items": boolToYesNo(task.auto_close_items),
		"Total Keys": task.keys_count ?? 0,
		"Total Words": task.words_count ?? 0,
		"Overall Progress":
			typeof task.progress === "number" ? `${task.progress}%` : "N/A",
	};
	lines.push(formatBulletList(configInfo));
	lines.push("");

	// Audit & completion
	lines.push(formatHeading("Audit", 2));
	const auditInfo: Record<string, unknown> = {
		"Created By": task.created_by ?? "Unknown",
		"Created By Email": task.created_by_email ?? "Unknown",
		"Created At": task.created_at
			? formatCreatedDateWithTime(task.created_at)
			: "Unknown",
		"Created At (ts)": task.created_at_timestamp ?? "N/A",
		"Completed By": task.completed_by ?? "N/A",
		"Completed By Email": task.completed_by_email ?? "N/A",
		"Completed At": task.completed_at
			? formatCreatedDateWithTime(task.completed_at)
			: "N/A",
		"Completed At (ts)": task.completed_at_timestamp ?? "N/A",
	};
	lines.push(formatBulletList(auditInfo));
	lines.push("");

	// Summary for LLM reasoning
	lines.push(formatHeading("Task Summary", 2));
	lines.push("**Task Characteristics:**");
	lines.push(`- ${task.languages?.length || 0} language(s) targeted`);

	if (task.due_date) {
		try {
			const dueDate = new Date(task.due_date);
			const isOverdue = dueDate < new Date();
			lines.push(
				`- ${isOverdue ? "⚠️ OVERDUE" : "✅ On schedule"} deadline: ${dueDate.toLocaleDateString()}`,
			);
		} catch {
			lines.push("- ⚠️ Invalid due date format");
		}
	} else {
		lines.push("- ⚠️ No deadline set");
	}

	lines.push(`- Current status: ${task.status}`);
	lines.push(`- Task type: ${task.task_type || "Unknown"}`);
	lines.push("");

	// Footer
	lines.push(
		formatFooter(
			"Task details retrieved",
			`Task \`${task.task_id}\` from project \`${projectId}\``,
		),
	);

	return lines.join("\n");
}

/**
 * @function formatCreateTaskResult
 * @description Formats the result of creating a task
 * @memberof TasksFormatter
 * @param {Task} task - The created task object from Lokalise API
 * @param {string} projectId - The project ID for context
 * @returns {string} Formatted Markdown string containing the creation results
 */
export function formatCreateTaskResult(task: Task, projectId: string): string {
	const lines: string[] = [];

	// Main heading
	lines.push(formatHeading("Task Created Successfully", 1));
	lines.push("");

	// Created task information
	lines.push(formatHeading("Created Task Information", 2));
	const taskInfo: Record<string, unknown> = {
		"Task ID": task.task_id,
		Project: `\`${projectId}\``,
		Title: task.title,
		Type: task.task_type || "Unknown",
		Status: task.status,
	};

	if (task.created_at) {
		taskInfo.Created = formatCreatedDateWithTime(task.created_at);
	}

	if (task.due_date) {
		taskInfo["Due Date"] = formatDueDateWithTime(task.due_date);
	}

	lines.push(formatBulletList(taskInfo));
	lines.push("");

	// Language coverage
	if (task.languages && task.languages.length > 0) {
		lines.push(formatHeading("Language Coverage", 2));
		lines.push(`**${task.languages.length} language(s) configured:**`);
		lines.push("");
		for (const language of task.languages) {
			const userCount = language.users?.length || 0;
			const groupCount = language.groups?.length || 0;
			lines.push(
				`- **${language.language_iso.toUpperCase()}:** ${userCount} user(s), ${groupCount} group(s)`,
			);
		}
		lines.push("");
	}

	// Next steps
	const nextSteps = [
		"Notify assigned team members about the new task",
		"Review task details and assignments",
		"Monitor progress as work begins",
	];

	if (task.due_date) {
		try {
			const dueDate = new Date(task.due_date);
			const daysUntilDue = Math.ceil(
				(dueDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24),
			);
			if (daysUntilDue <= 7) {
				nextSteps.push(
					"⚠️ **Due date is approaching** - ensure team is aware of the deadline",
				);
			}
		} catch {
			// Ignore date parsing errors
		}
	} else {
		nextSteps.push("Consider setting a due date for better project management");
	}

	lines.push(formatHeading("Next Steps", 2));
	lines.push("✅ **Task created successfully**");
	lines.push("");
	lines.push("**Recommended actions:**");
	for (const step of nextSteps) {
		lines.push(`- ${step}`);
	}
	lines.push("");

	// Footer
	lines.push(formatFooter("Task created"));

	return lines.join("\n");
}

/**
 * @function formatUpdateTaskResult
 * @description Formats the result of updating a task
 * @memberof TasksFormatter
 * @param {Task} task - The updated task object from Lokalise API
 * @param {string} projectId - The project ID for context
 * @returns {string} Formatted Markdown string containing the update results
 */
export function formatUpdateTaskResult(task: Task, projectId: string): string {
	const lines: string[] = [];

	// Main heading
	lines.push(formatHeading("Task Updated Successfully", 1));
	lines.push("");

	// Updated task information
	lines.push(formatHeading("Updated Task Information", 2));
	const taskInfo: Record<string, unknown> = {
		"Task ID": task.task_id,
		Project: `\`${projectId}\``,
		Title: task.title,
		Status: task.status,
	};

	if (task.created_at) {
		taskInfo["Last Modified"] = formatCreatedDateWithTime(task.created_at);
	}

	if (task.due_date) {
		taskInfo["Due Date"] = formatDueDateDetailed(task.due_date);
	}

	lines.push(formatBulletList(taskInfo));
	lines.push("");

	if (task.languages && task.languages.length > 0) {
		// Language assignments
		lines.push(formatHeading("Language Assignments", 2));
		lines.push(`**${task.languages.length} language(s) configured:**`);
		lines.push("");
		for (const language of task.languages) {
			const userCount = language.users?.length || 0;
			const groupCount = language.groups?.length || 0;
			lines.push(
				`- **${language.language_iso.toUpperCase()}:** ${userCount} user(s), ${groupCount} group(s)`,
			);
		}
		lines.push("");
	}

	// Update confirmation
	lines.push(formatHeading("Update Confirmation", 2));
	lines.push("✅ **Task updated successfully**");
	lines.push("");
	lines.push("**Changes have been applied to:**");
	lines.push("- Task metadata and configuration");
	lines.push("- Assignment and language settings");
	lines.push("- Due date and priority settings");
	lines.push("");

	if (task.status === "closed") {
		lines.push("🎉 **Task has been closed** - work is complete!");
		lines.push("");
	} else if (task.status === "completed") {
		lines.push("✅ **Task marked as completed** - ready for final review");
		lines.push("");
	}

	// Footer
	lines.push(formatFooter("Task updated"));

	return lines.join("\n");
}

/**
 * @function formatDeleteTaskResult
 * @description Formats the result of deleting a task
 * @memberof TasksFormatter
 * @param {TaskDeleted} result - The deletion result from Lokalise API
 * @param {string} projectId - The project ID for context
 * @param {number} taskId - The ID of the deleted task
 * @returns {string} Formatted Markdown string containing the deletion confirmation
 */
export function formatDeleteTaskResult(
	result: TaskDeleted,
	projectId: string,
	taskId: number,
): string {
	const lines: string[] = [];

	// Main heading
	lines.push(formatHeading("Task Deleted Successfully", 1));
	lines.push("");

	// Deletion confirmation
	lines.push(formatHeading("Deletion Confirmation", 2));
	const deletionInfo: Record<string, unknown> = {
		"Task ID": taskId,
		Project: `\`${projectId}\``,
		Status: "✅ **DELETED**",
		Deleted: result.task_deleted ? "Yes" : "No",
		Timestamp: formatDate(new Date()),
	};
	lines.push(formatBulletList(deletionInfo));
	lines.push("");

	// Important notes
	lines.push(formatHeading("Important Notes", 2));
	lines.push(
		"⚠️ **This action is permanent** - the task and all its associated data have been permanently removed.",
	);
	lines.push("");

	lines.push("**What was deleted:**");
	lines.push("- Task metadata (title, description, settings)");
	lines.push("- All task assignments");
	lines.push("- Language-specific assignments");
	lines.push("- Task history and progress tracking");
	lines.push("");

	lines.push("**What was NOT affected:**");
	lines.push("- Translation keys and their content remain unchanged");
	lines.push("- Project settings and other tasks are unaffected");
	lines.push("- User accounts and permissions remain as they were");
	lines.push("");

	// Cleanup complete
	lines.push(formatHeading("Cleanup Complete", 2));
	lines.push(
		"🗑️ **Task removal successful** - the task has been permanently deleted from your project.",
	);
	lines.push("");

	// Footer
	lines.push(formatFooter("Task deleted"));

	return lines.join("\n");
}

// Helper functions for date formatting

function formatDueDate(dueDate?: string): string {
	if (!dueDate) return "No deadline";

	try {
		const due = new Date(dueDate);
		const isOverdue = due < new Date();
		const formatted = due.toLocaleDateString();
		return isOverdue ? `🔴 ${formatted}` : `📅 ${formatted}`;
	} catch {
		return "Invalid date";
	}
}

function formatCreatedDate(createdAt?: string): string {
	if (!createdAt) return "Unknown";

	try {
		return new Date(createdAt).toLocaleDateString();
	} catch {
		return "Invalid date";
	}
}

function formatCreatedDateWithTime(createdAt?: string): string {
	if (!createdAt) return "Invalid date format";

	try {
		return `${createdAt} (${new Date(createdAt).toLocaleDateString()})`;
	} catch {
		return "Invalid date format";
	}
}

function formatDueDateWithTime(dueDate?: string): string {
	if (!dueDate) return "No deadline set";

	try {
		const due = new Date(dueDate);
		return `${due.toLocaleDateString()} at ${due.toLocaleTimeString()}`;
	} catch {
		return "Invalid date format";
	}
}

function formatDueDateDetailed(dueDate?: string): string {
	if (!dueDate) return "No deadline set";

	try {
		const due = new Date(dueDate);
		const now = new Date();
		const isOverdue = due < now;
		const daysDiff = Math.ceil(
			(due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24),
		);

		let status: string;
		if (isOverdue) {
			status = ` (🔴 **OVERDUE** by ${Math.abs(daysDiff)} day${Math.abs(daysDiff) !== 1 ? "s" : ""})`;
		} else if (daysDiff <= 1) {
			status = " (🟡 **DUE SOON**)";
		} else {
			status = " (✅ On schedule)";
		}

		return `${due.toLocaleDateString()} at ${due.toLocaleTimeString()}${status}`;
	} catch {
		return "Invalid date format";
	}
}

function formatScheduleInfo(task: Task): string {
	const lines: string[] = [];

	if (task.due_date) {
		try {
			const dueDate = new Date(task.due_date);
			const now = new Date();
			const isOverdue = dueDate < now;
			const daysDiff = Math.ceil(
				(dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24),
			);

			const scheduleInfo: Record<string, unknown> = {
				"Due Date": `${dueDate.toLocaleDateString()} at ${dueDate.toLocaleTimeString()}`,
			};

			if (isOverdue) {
				scheduleInfo.Status = `🔴 **OVERDUE** by ${Math.abs(daysDiff)} day${Math.abs(daysDiff) !== 1 ? "s" : ""}`;
			} else if (daysDiff <= 1) {
				scheduleInfo.Status = `🟡 **DUE SOON** (${daysDiff === 0 ? "today" : "tomorrow"})`;
			} else if (daysDiff <= 7) {
				scheduleInfo.Status = `📅 **DUE THIS WEEK** (in ${daysDiff} days)`;
			} else {
				scheduleInfo.Status = `✅ **ON SCHEDULE** (in ${daysDiff} days)`;
			}

			lines.push(formatBulletList(scheduleInfo));
		} catch {
			const errorInfo: Record<string, unknown> = {
				"Due Date": "Invalid date format",
			};
			lines.push(formatBulletList(errorInfo));
		}
	} else {
		const noDeadlineInfo: Record<string, unknown> = {
			"Due Date": "No deadline set",
			Status: "⚠️ **NO DEADLINE** - consider setting a due date",
		};
		lines.push(formatBulletList(noDeadlineInfo));
	}

	lines.push("");
	return lines.join("\n");
}

// --- Additional rich formatters ---

function boolToYesNo(value?: boolean): string {
	return value ? "Yes" : "No";
}

function formatArray(arr?: Array<string | number> | null): string {
	if (!arr || arr.length === 0) return "None";
	return arr.join(", ");
}

function formatTaskSnapshot(task: Task): string {
	const lines: string[] = [];

	const meta: Record<string, unknown> = {
		Status: task.status || "Unknown",
		Type: task.task_type || "Unknown",
		Progress: typeof task.progress === "number" ? `${task.progress}%` : "N/A",
		"Due Date": task.due_date
			? formatDueDateWithTime(task.due_date)
			: "No deadline",
		"Due Date (ts)": task.due_date_timestamp ?? "N/A",
		"Created At": task.created_at
			? formatCreatedDateWithTime(task.created_at)
			: "Unknown",
		"Created At (ts)": task.created_at_timestamp ?? "N/A",
		"Created By": task.created_by ?? "Unknown",
		"Created By Email": task.created_by_email ?? "Unknown",
		"Completed At": task.completed_at
			? formatCreatedDateWithTime(task.completed_at)
			: "N/A",
		"Completed At (ts)": task.completed_at_timestamp ?? "N/A",
		"Completed By": task.completed_by ?? "N/A",
		"Completed By Email": task.completed_by_email ?? "N/A",
		"Can Be Parent": boolToYesNo(task.can_be_parent),
		"Parent Task ID": task.parent_task_id ?? "None",
		"Closing Tags": formatArray(task.closing_tags),
		"Lock Translations": boolToYesNo(task.do_lock_translations),
		"Custom Status IDs": formatArray(task.custom_translation_status_ids),
		"Source Language": task.source_language_iso || "Not specified",
		"Auto-close Languages": boolToYesNo(task.auto_close_languages),
		"Auto-close Task": boolToYesNo(task.auto_close_task),
		"Auto-close Items": boolToYesNo(task.auto_close_items),
		"Total Keys": task.keys_count ?? 0,
		"Total Words": task.words_count ?? 0,
		"Target Languages": task.languages?.length ?? 0,
	};

	lines.push(formatBulletList(meta));
	lines.push("");

	if (task.languages && task.languages.length > 0) {
		lines.push("**Languages:**");
		for (const language of task.languages) {
			lines.push(
				`- ${language.language_iso?.toUpperCase() || "Unknown"} • status: ${language.status || "Unknown"} • progress: ${typeof language.progress === "number" ? `${language.progress}%` : "N/A"} • keys: ${language.keys_count ?? 0} • words: ${language.words_count ?? 0}`,
			);
		}
		lines.push("");
	}

	return lines.join("\n");
}

function formatLanguageDetails(language: Task["languages"][number]): string {
	const lines: string[] = [];
	lines.push(formatHeading(language.language_iso.toUpperCase(), 3));
	lines.push("");

	const langInfo: Record<string, unknown> = {
		Status: language.status || "Unknown",
		Progress:
			typeof language.progress === "number" ? `${language.progress}%` : "N/A",
		"Keys Count": language.keys_count ?? 0,
		"Words Count": language.words_count ?? 0,
		"Completed At": language.completed_at || "N/A",
		"Completed At (ts)": language.completed_at_timestamp ?? "N/A",
		"Completed By": language.completed_by ?? "N/A",
		"Completed By Email": language.completed_by_email ?? "N/A",
	};
	lines.push(formatBulletList(langInfo));
	lines.push("");

	if (Array.isArray(language.keys) && language.keys.length > 0) {
		lines.push(`Keys scope: ${language.keys.length} key(s)`);
	}

	if (language.users && language.users.length > 0) {
		lines.push(`Assigned Users (${language.users.length}):`);
		for (const user of language.users) {
			lines.push(`- ${user.fullname || user.email || `ID: ${user.user_id}`}`);
		}
		lines.push("");
	}

	if (language.groups && language.groups.length > 0) {
		lines.push(`Assigned Groups (${language.groups.length}):`);
		for (const group of language.groups) {
			lines.push(`- ${group.name || `ID: ${group.id}`}`);
		}
		lines.push("");
	}

	// Leverage
	if (language.initial_tm_leverage) {
		lines.push("Initial TM Leverage:");
		lines.push(formatLeverageBuckets(language.initial_tm_leverage));
		lines.push("");
	}
	if (language.tm_leverage) {
		lines.push(
			`TM Leverage Status: ${language.tm_leverage.status || "Unknown"}`,
		);
		if (language.tm_leverage.value) {
			lines.push(formatLeverageBuckets(language.tm_leverage.value));
		}
		lines.push("");
	}

	if (
		(!language.users || language.users.length === 0) &&
		(!language.groups || language.groups.length === 0)
	) {
		lines.push("*No specific users or groups assigned to this language*");
		lines.push("");
	}

	return lines.join("\n");
}

function formatLeverageBuckets(value: Record<string, number>): string {
	const orderedKeys = ["0%+", "50%+", "60%+", "75%+", "85%+", "95%+", "100%"];
	const present = orderedKeys.filter((k) => k in value);
	if (present.length === 0) return "- No leverage data";
	const lines: string[] = [];
	for (const k of present) {
		lines.push(`- ${k}: ${value[k]}%`);
	}
	return lines.join("\n");
}
