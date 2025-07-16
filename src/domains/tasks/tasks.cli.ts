import type { Command } from "commander";
import type { DomainCli, DomainMeta } from "../../shared/types/domain.types.js";
import { handleCliError } from "../../shared/utils/error.util.js";
import { Logger } from "../../shared/utils/logger.util.js";
import tasksController from "./tasks.controller.js";
import type { UpdateTaskToolArgsType } from "./tasks.types.js";

const logger = Logger.forContext("cli/tasks.cli.ts");

/**
 * Register Tasks CLI commands
 * @param program The Commander program instance
 */
function register(program: Command) {
	const methodLogger = logger.forMethod("register");
	methodLogger.debug("Registering Tasks CLI commands...");

	// List Tasks Command
	program
		.command("list-tasks")
		.description(
			"Lists tasks from a Lokalise project with optional filtering. Shows task details including status, assignees, and due dates.",
		)
		.argument("<projectId>", "Project ID to list tasks from")
		.option(
			"-l, --limit <number>",
			"Number of tasks to return (1-500, default: 100)",
			(value) => {
				const parsed = Number.parseInt(value, 10);
				if (Number.isNaN(parsed) || parsed < 1 || parsed > 500) {
					throw new Error("Limit must be a number between 1 and 500");
				}
				return parsed;
			},
		)
		.option(
			"-p, --page <number>",
			"Page number for pagination (default: 1)",
			(value) => {
				const parsed = Number.parseInt(value, 10);
				if (Number.isNaN(parsed) || parsed < 1) {
					throw new Error("Page must be a number greater than 0");
				}
				return parsed;
			},
		)
		.option("--filter-title <title>", "Filter tasks by title (partial match)")
		.option(
			"--filter-status <statuses>",
			"Filter tasks by status (comma-separated: new,in_progress,completed,closed)",
			(value) => {
				const validStatuses = ["new", "in_progress", "completed", "closed"];
				const statuses = value.split(",").map((s) => s.trim());
				for (const status of statuses) {
					if (!validStatuses.includes(status)) {
						throw new Error(
							`Invalid status "${status}". Valid statuses: ${validStatuses.join(", ")}`,
						);
					}
				}
				return statuses;
			},
		)
		.action(async (projectId, options) => {
			const actionLogger = logger.forMethod("action:list-tasks");
			try {
				actionLogger.debug("CLI list-tasks called", {
					projectId,
					limit: options.limit,
					page: options.page,
					filterTitle: options.filterTitle,
					filterStatus: options.filterStatus,
				});

				const args = {
					projectId,
					limit: options.limit,
					page: options.page,
					filterTitle: options.filterTitle,
					filterStatuses: options.filterStatus,
				};

				const result = await tasksController.listTasks(args);
				console.log(result.content);
			} catch (error) {
				handleCliError(error);
			}
		});

	// Get Task Details Command
	program
		.command("get-task")
		.description(
			"Gets detailed information about a specific task including assignees, languages, and progress.",
		)
		.argument("<projectId>", "Project ID containing the task")
		.argument("<taskId>", "Task ID to get details for", (value) => {
			const parsed = Number.parseInt(value, 10);
			if (Number.isNaN(parsed)) {
				throw new Error("Task ID must be a number");
			}
			return parsed;
		})
		.action(async (projectId, taskId) => {
			const actionLogger = logger.forMethod("action:get-task");
			try {
				actionLogger.debug("CLI get-task called", {
					projectId,
					taskId,
				});

				const args = {
					projectId,
					taskId,
				};

				const result = await tasksController.getTask(args);
				console.log(result.content);
			} catch (error) {
				handleCliError(error);
			}
		});

	// Create Task Command
	program
		.command("create-task")
		.description(
			"Creates a new task in a Lokalise project. Note: Tasks with languages require assignees. Use the MCP tool with 'assignees' parameter or specify users/groups per language.",
		)
		.argument("<projectId>", "Project ID to create task in")
		.argument("<title>", "Task title")
		.option("-d, --description <text>", "Task description")
		.option(
			"-l, --languages <codes>",
			"Target language ISO codes (comma-separated, e.g., 'en,fr,de')",
			(value) => {
				return value.split(",").map((code) => code.trim());
			},
		)
		.option("--due-date <date>", "Due date in ISO format (YYYY-MM-DD HH:MM:SS)")
		.option(
			"--task-type <type>",
			"Task type: translation or review",
			"translation",
		)
		.option("--auto-close-languages", "Auto-close languages when completed")
		.option("--auto-close-task", "Auto-close task when all languages completed")
		.option("--lock-translations", "Lock translations when task is created")
		.action(async (projectId, title, options) => {
			const actionLogger = logger.forMethod("action:create-task");
			try {
				actionLogger.debug("CLI create-task called", {
					projectId,
					title,
					options,
				});

				if (!options.languages || options.languages.length === 0) {
					throw new Error(
						"At least one target language must be specified with --languages",
					);
				}

				const languages = options.languages.map((lang: string) => ({
					language_iso: lang,
					// Don't include empty users/groups arrays - let the service handle it
				}));

				const args = {
					projectId,
					title,
					description: options.description,
					languages,
					due_date: options.dueDate,
					task_type: options.taskType,
					auto_close_languages: options.autoCloseLanguages || false,
					auto_close_task: options.autoCloseTask || false,
					do_lock_translations: options.lockTranslations || false,
				};

				const result = await tasksController.createTask(args);
				console.log(result.content);
			} catch (error) {
				handleCliError(error);
			}
		});

	// Update Task Command
	program
		.command("update-task")
		.description("Updates an existing task in a Lokalise project")
		.argument("<projectId>", "Project ID containing the task")
		.argument("<taskId>", "Task ID to update", (value) => {
			const parsed = Number.parseInt(value, 10);
			if (Number.isNaN(parsed)) {
				throw new Error("Task ID must be a number");
			}
			return parsed;
		})
		.option("-t, --title <text>", "New task title")
		.option("-d, --description <text>", "New task description")
		.option(
			"--due-date <date>",
			"New due date in ISO format (YYYY-MM-DD HH:MM:SS)",
		)
		.option("--close-task", "Close the task")
		.action(async (projectId, taskId, options) => {
			const actionLogger = logger.forMethod("action:update-task");
			try {
				actionLogger.debug("CLI update-task called", {
					projectId,
					taskId,
					options,
				});

				const taskData: UpdateTaskToolArgsType["taskData"] = {};

				if (options.title) {
					taskData.title = options.title;
				}

				if (options.description) {
					taskData.description = options.description;
				}

				if (options.dueDate) {
					taskData.due_date = options.dueDate;
				}

				if (options.closeTask) {
					taskData.close_task = true;
				}

				if (Object.keys(taskData).length === 0) {
					throw new Error(
						"At least one field must be provided to update (title, description, due-date, or close-task)",
					);
				}

				const args = {
					projectId,
					taskId,
					taskData,
				};

				const result = await tasksController.updateTask(args);
				console.log(result.content);
			} catch (error) {
				handleCliError(error);
			}
		});

	// Delete Task Command
	program
		.command("delete-task")
		.description(
			"Permanently deletes a task from a Lokalise project (WARNING: This action cannot be undone!)",
		)
		.argument("<projectId>", "Project ID containing the task")
		.argument("<taskId>", "Task ID to delete", (value) => {
			const parsed = Number.parseInt(value, 10);
			if (Number.isNaN(parsed)) {
				throw new Error("Task ID must be a number");
			}
			return parsed;
		})
		.option(
			"--confirm",
			"Confirm that you want to permanently delete this task",
		)
		.action(async (projectId, taskId, options) => {
			const actionLogger = logger.forMethod("action:delete-task");
			try {
				actionLogger.debug("CLI delete-task called", {
					projectId,
					taskId,
					options,
				});

				if (!options.confirm) {
					throw new Error(
						"Task deletion requires confirmation. Use --confirm flag to proceed. WARNING: This action cannot be undone!",
					);
				}

				const args = {
					projectId,
					taskId,
				};

				const result = await tasksController.deleteTask(args);
				console.log(result.content);
			} catch (error) {
				handleCliError(error);
			}
		});

	methodLogger.debug("Tasks CLI commands registered successfully");
}

const tasksCli: DomainCli = {
	register,
	getMeta(): DomainMeta {
		return {
			name: "tasks",
			description: "Tasks management CLI commands",
			version: "1.0.0",
			cliCommandsCount: 5,
		};
	},
};

export default tasksCli;
