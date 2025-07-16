import type { ControllerResponse } from "../../shared/types/common.types.js";
import {
	buildErrorContext,
	handleControllerError,
} from "../../shared/utils/error-handler.util.js";
import { Logger } from "../../shared/utils/logger.util.js";
import {
	formatCreateTaskResult,
	formatDeleteTaskResult,
	formatTaskDetails,
	formatTasksList,
	formatUpdateTaskResult,
} from "./tasks.formatter.js";
import * as tasksService from "./tasks.service.js";
import type {
	CreateTaskToolArgsType,
	DeleteTaskToolArgsType,
	GetTaskToolArgsType,
	ListTasksToolArgsType,
	UpdateTaskToolArgsType,
} from "./tasks.types.js";

/**
 * @namespace TasksController
 * @description Controller responsible for handling Lokalise Tasks API operations.
 *              It orchestrates calls to the tasks service, applies defaults,
 *              maps options, and formats the response using the formatter.
 */

/**
 * @function listTasks
 * @description Fetches a list of tasks from a Lokalise project with optional filtering and pagination.
 * @memberof TasksController
 * @param {ListTasksToolArgsType} args - Arguments containing project ID, filters, and pagination options
 * @returns {Promise<ControllerResponse>} A promise that resolves to the standard controller response containing the formatted tasks list in Markdown.
 * @throws {McpError} Throws an McpError (handled by `handleControllerError`) if the service call fails or returns an error.
 */
async function listTasks(
	args: ListTasksToolArgsType,
): Promise<ControllerResponse> {
	const methodLogger = Logger.forContext(
		"controllers/tasks.controller.ts",
		"listTasks",
	);

	try {
		methodLogger.debug("Starting listTasks operation", {
			projectId: args.projectId,
			limit: args.limit,
			page: args.page,
			filterTitle: args.filterTitle,
			filterStatuses: args.filterStatuses,
		});

		// Map arguments to service parameters
		const serviceParams: tasksService.TaskListParams = {
			project_id: args.projectId,
			limit: args.limit || 100,
			page: args.page || 1,
			filter_title: args.filterTitle,
			filter_statuses: args.filterStatuses?.join(","),
		};

		const result = await tasksService.getTasks(serviceParams);

		methodLogger.debug("Tasks service call successful", {
			projectId: args.projectId,
			tasksCount: result.items?.length || 0,
			hasNextPage: result.hasNextPage(),
		});

		const formatted = formatTasksList(result, args.projectId);

		return { content: formatted };
	} catch (error) {
		throw handleControllerError(
			error,
			buildErrorContext(
				"Lokalise Task",
				"listTasks",
				"controllers/tasks.controller.ts@listTasks",
				args.projectId,
				{ args },
			),
		);
	}
}

/**
 * @function createTask
 * @description Creates a task in a Lokalise project
 * @memberof TasksController
 * @param {CreateTaskToolArgsType} args - Arguments containing project ID and task data
 * @returns {Promise<ControllerResponse>} A promise that resolves to the standard controller response containing the creation results.
 */
async function createTask(
	args: CreateTaskToolArgsType,
): Promise<ControllerResponse> {
	const methodLogger = Logger.forContext(
		"controllers/tasks.controller.ts",
		"createTask",
	);

	try {
		methodLogger.debug("Starting createTask operation", {
			projectId: args.projectId,
			title: args.title,
			languagesCount: args.languages?.length || 0,
		});

		// Map arguments to service parameters
		const serviceParams: tasksService.CreateTaskServiceParams = {
			project_id: args.projectId,
			title: args.title,
			description: args.description,
			keys: args.keys,
			languages: args.languages,
			assignees: args.assignees,
			due_date: args.due_date,
			source_language_iso: args.source_language_iso,
			auto_close_languages: args.auto_close_languages,
			auto_close_task: args.auto_close_task,
			auto_close_items: args.auto_close_items,
			task_type: args.task_type,
			parent_task_id: args.parent_task_id,
			closing_tags: args.closing_tags,
			do_lock_translations: args.do_lock_translations,
			custom_translation_status_ids: args.custom_translation_status_ids,
		};

		const result = await tasksService.createTask(serviceParams);

		methodLogger.debug("Task creation successful", {
			projectId: args.projectId,
			taskId: result.task_id,
			title: result.title,
		});

		const formatted = formatCreateTaskResult(result, args.projectId);

		return { content: formatted };
	} catch (error) {
		throw handleControllerError(
			error,
			buildErrorContext(
				"Lokalise Task",
				"createTask",
				"controllers/tasks.controller.ts@createTask",
				args.projectId,
				{ args: { ...args, title: args.title } },
			),
		);
	}
}

/**
 * @function getTask
 * @description Fetches a single task from a Lokalise project
 * @memberof TasksController
 * @param {GetTaskToolArgsType} args - Arguments containing project ID and task ID
 * @returns {Promise<ControllerResponse>} A promise that resolves to the standard controller response containing the task details.
 */
async function getTask(args: GetTaskToolArgsType): Promise<ControllerResponse> {
	const methodLogger = Logger.forContext(
		"controllers/tasks.controller.ts",
		"getTask",
	);

	try {
		methodLogger.debug("Starting getTask operation", {
			projectId: args.projectId,
			taskId: args.taskId,
		});

		// Map arguments to service parameters
		const serviceParams: tasksService.GetTaskParams = {
			project_id: args.projectId,
			task_id: args.taskId,
		};

		const result = await tasksService.getTask(serviceParams);

		methodLogger.debug("Task retrieval successful", {
			projectId: args.projectId,
			taskId: args.taskId,
			title: result.title,
		});

		const formatted = formatTaskDetails(result, args.projectId);

		return { content: formatted };
	} catch (error) {
		throw handleControllerError(
			error,
			buildErrorContext(
				"Lokalise Task",
				"getTask",
				"controllers/tasks.controller.ts@getTask",
				`${args.projectId}:${args.taskId}`,
				{ args },
			),
		);
	}
}

/**
 * @function updateTask
 * @description Updates a single task in a Lokalise project
 * @memberof TasksController
 * @param {UpdateTaskToolArgsType} args - Arguments containing project ID, task ID and update data
 * @returns {Promise<ControllerResponse>} A promise that resolves to the standard controller response containing the updated task details.
 */
async function updateTask(
	args: UpdateTaskToolArgsType,
): Promise<ControllerResponse> {
	const methodLogger = Logger.forContext(
		"controllers/tasks.controller.ts",
		"updateTask",
	);

	try {
		methodLogger.debug("Starting updateTask operation", {
			projectId: args.projectId,
			taskId: args.taskId,
		});

		// Map arguments to service parameters
		const serviceParams: tasksService.UpdateTaskServiceParams = {
			project_id: args.projectId,
			task_id: args.taskId,
			title: args.taskData.title,
			description: args.taskData.description,
			due_date: args.taskData.due_date,
			languages: args.taskData.languages,
			auto_close_languages: args.taskData.auto_close_languages,
			auto_close_task: args.taskData.auto_close_task,
			auto_close_items: args.taskData.auto_close_items,
			closing_tags: args.taskData.closing_tags,
			do_lock_translations: args.taskData.do_lock_translations,
			close_task: args.taskData.close_task,
		};

		const result = await tasksService.updateTask(serviceParams);

		methodLogger.debug("Task update successful", {
			projectId: args.projectId,
			taskId: args.taskId,
			title: result.title,
		});

		const formatted = formatUpdateTaskResult(result, args.projectId);

		return { content: formatted };
	} catch (error) {
		throw handleControllerError(
			error,
			buildErrorContext(
				"Lokalise Task",
				"updateTask",
				"controllers/tasks.controller.ts@updateTask",
				`${args.projectId}:${args.taskId}`,
				{ args },
			),
		);
	}
}

/**
 * @function deleteTask
 * @description Deletes a single task from a Lokalise project
 * @memberof TasksController
 * @param {DeleteTaskToolArgsType} args - Arguments containing project ID and task ID
 * @returns {Promise<ControllerResponse>} A promise that resolves to the standard controller response containing the deletion confirmation.
 */
async function deleteTask(
	args: DeleteTaskToolArgsType,
): Promise<ControllerResponse> {
	const methodLogger = Logger.forContext(
		"controllers/tasks.controller.ts",
		"deleteTask",
	);

	try {
		methodLogger.debug("Starting deleteTask operation", {
			projectId: args.projectId,
			taskId: args.taskId,
		});

		// Map arguments to service parameters
		const serviceParams: tasksService.DeleteTaskParams = {
			project_id: args.projectId,
			task_id: args.taskId,
		};

		const result = await tasksService.deleteTask(serviceParams);

		methodLogger.debug("Task deletion successful", {
			projectId: args.projectId,
			taskId: args.taskId,
		});

		const formatted = formatDeleteTaskResult(
			result,
			args.projectId,
			args.taskId,
		);

		return { content: formatted };
	} catch (error) {
		throw handleControllerError(
			error,
			buildErrorContext(
				"Lokalise Task",
				"deleteTask",
				"controllers/tasks.controller.ts@deleteTask",
				`${args.projectId}:${args.taskId}`,
				{ args },
			),
		);
	}
}

/**
 * Export the controller functions
 */
const tasksController = {
	listTasks,
	createTask,
	getTask,
	updateTask,
	deleteTask,
};

export default tasksController;
