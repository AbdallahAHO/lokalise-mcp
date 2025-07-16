import { z } from "zod";

/**
 * Zod schema for task language assignment
 */
export const TaskLanguageSchema = z
	.object({
		language_iso: z.string().describe("Language ISO code"),
		users: z
			.array(z.number())
			.optional()
			.describe(
				"User IDs assigned to this language. Either 'users' or 'groups' must be specified, unless using top-level 'assignees'",
			),
		groups: z
			.array(z.number())
			.optional()
			.describe(
				"Group IDs assigned to this language. Either 'users' or 'groups' must be specified, unless using top-level 'assignees'",
			),
	})
	.strict();

/**
 * Zod schema for the list tasks tool arguments.
 */
export const ListTasksToolArgs = z
	.object({
		projectId: z.string().describe("Project ID to list tasks for"),
		limit: z
			.number()
			.optional()
			.describe("Number of tasks to return (1-500, default: 100)"),
		page: z
			.number()
			.optional()
			.describe("Page number for pagination (default: 1)"),
		filterTitle: z.string().optional().describe("Filter tasks by title"),
		filterStatuses: z
			.array(z.enum(["new", "in_progress", "completed", "closed"]))
			.optional()
			.describe("Filter by task statuses"),
	})
	.strict();

export type ListTasksToolArgsType = z.infer<typeof ListTasksToolArgs>;

/**
 * Zod schema for the get task tool arguments.
 */
export const GetTaskToolArgs = z
	.object({
		projectId: z.string().describe("Project ID containing the task"),
		taskId: z.number().describe("Task ID to get details for"),
	})
	.strict();

export type GetTaskToolArgsType = z.infer<typeof GetTaskToolArgs>;

/**
 * Zod schema for the create task tool arguments.
 */
export const CreateTaskToolArgs = z
	.object({
		projectId: z.string().describe("Project ID to create task in"),
		title: z.string().min(1).describe("Task title (required)"),
		description: z.string().optional().describe("Task description"),
		keys: z
			.array(z.number())
			.optional()
			.describe(
				"Array of key IDs to include in this task. Only provide if you want to limit the task to specific keys. Leave empty to include all project keys",
			),
		languages: z
			.array(TaskLanguageSchema)
			.optional()
			.describe(
				"Languages with specific user/group assignments. Each language MUST have either 'users' or 'groups' specified, unless you use the top-level 'assignees' parameter",
			),
		assignees: z
			.array(z.number())
			.optional()
			.describe(
				"User IDs to assign to ALL languages in the task. This is a convenience parameter - if specified, these users will be assigned to every language in the task. Use this OR specify users/groups per language, not both",
			),
		due_date: z
			.string()
			.optional()
			.describe("Due date in ISO format (YYYY-MM-DD HH:MM:SS)"),
		source_language_iso: z
			.string()
			.optional()
			.describe("Source language ISO code"),
		auto_close_languages: z
			.boolean()
			.optional()
			.describe("Auto-close languages when completed"),
		auto_close_task: z
			.boolean()
			.optional()
			.describe("Auto-close task when all languages completed"),
		auto_close_items: z
			.boolean()
			.optional()
			.describe("Auto-close items when completed"),
		task_type: z
			.enum(["translation", "review"])
			.optional()
			.default("translation")
			.describe("Type of task"),
		parent_task_id: z
			.number()
			.optional()
			.describe("Parent task ID for subtasks"),
		closing_tags: z
			.array(z.string())
			.optional()
			.describe("Tags that close the task when applied"),
		do_lock_translations: z
			.boolean()
			.optional()
			.describe("Lock translations when task is created"),
		custom_translation_status_ids: z
			.array(z.number())
			.optional()
			.describe("Custom translation status IDs"),
	})
	.strict();

export type CreateTaskToolArgsType = z.infer<typeof CreateTaskToolArgs>;

/**
 * Zod schema for the update task tool arguments.
 */
export const UpdateTaskToolArgs = z
	.object({
		projectId: z.string().describe("Project ID containing the task"),
		taskId: z.number().describe("Task ID to update"),
		taskData: z
			.object({
				title: z.string().optional().describe("Updated task title"),
				description: z.string().optional().describe("Updated task description"),
				due_date: z
					.string()
					.optional()
					.describe("Updated due date in ISO format"),
				languages: z
					.array(
						TaskLanguageSchema.extend({
							close_language: z
								.boolean()
								.optional()
								.describe("Close this language assignment"),
						}),
					)
					.optional()
					.describe("Updated language assignments"),
				auto_close_languages: z
					.boolean()
					.optional()
					.describe("Auto-close languages when completed"),
				auto_close_task: z
					.boolean()
					.optional()
					.describe("Auto-close task when all languages completed"),
				auto_close_items: z
					.boolean()
					.optional()
					.describe("Auto-close items when completed"),
				closing_tags: z
					.array(z.string())
					.optional()
					.describe("Tags that close the task when applied"),
				do_lock_translations: z
					.boolean()
					.optional()
					.describe("Lock translations"),
				close_task: z.boolean().optional().describe("Close the entire task"),
			})
			.describe("Task data to update"),
	})
	.strict();

export type UpdateTaskToolArgsType = z.infer<typeof UpdateTaskToolArgs>;

/**
 * Zod schema for the delete task tool arguments.
 */
export const DeleteTaskToolArgs = z
	.object({
		projectId: z.string().describe("Project ID containing the task"),
		taskId: z.number().describe("Task ID to delete"),
	})
	.strict();

export type DeleteTaskToolArgsType = z.infer<typeof DeleteTaskToolArgs>;
