import type {
	ApiError,
	CreateTaskParams,
	ListTaskParams,
	PaginatedResult,
	Task,
	TaskDeleted,
	UpdateTaskParams,
} from "@lokalise/node-api";
import type { ApiRequestOptions } from "../../shared/types/common.types.js";
import {
	createApiError,
	createUnexpectedError,
} from "../../shared/utils/error.util.js";
import { Logger } from "../../shared/utils/logger.util.js";
import { getLokaliseApi } from "../../shared/utils/lokalise-api.util.js";

// Create a contextualized logger for this file
const serviceLogger = Logger.forContext(
	"services/vendor.lokalise.com.tasks.service.ts",
);

// Log service initialization
serviceLogger.debug("Lokalise Tasks API service initialized");

/**
 * @namespace VendorLokaliseTasksService
 * @description Service layer for interacting with Lokalise Tasks API endpoints.
 *              Uses the official Lokalise SDK for reliable API communication.
 */

/**
 * Parameters for listing tasks in a project
 */
export interface TaskListParams extends ApiRequestOptions {
	project_id: string;
	filter_title?: string;
	filter_statuses?: string;
}

/**
 * Parameters for creating a task in a project
 */
export interface CreateTaskServiceParams {
	project_id: string;
	title: string;
	description?: string;
	keys?: number[];
	languages?: Array<{
		language_iso: string;
		users?: number[];
		groups?: number[];
	}>;
	assignees?: number[]; // Top-level assignees to be applied to all languages
	due_date?: string;
	source_language_iso?: string;
	auto_close_languages?: boolean;
	auto_close_task?: boolean;
	auto_close_items?: boolean;
	task_type?: string;
	parent_task_id?: number;
	closing_tags?: string[];
	do_lock_translations?: boolean;
	custom_translation_status_ids?: number[];
}

/**
 * Parameters for getting a single task
 */
export interface GetTaskParams {
	project_id: string;
	task_id: number;
}

/**
 * Parameters for updating a task
 */
export interface UpdateTaskServiceParams {
	project_id: string;
	task_id: number;
	title?: string;
	description?: string;
	due_date?: string;
	languages?: Array<{
		language_iso: string;
		users?: number[];
		groups?: number[];
		close_language?: boolean;
	}>;
	auto_close_languages?: boolean;
	auto_close_task?: boolean;
	auto_close_items?: boolean;
	closing_tags?: string[];
	do_lock_translations?: boolean;
	close_task?: boolean;
}

/**
 * Parameters for deleting a task
 */
export interface DeleteTaskParams {
	project_id: string;
	task_id: number;
}

/**
 * @function getTasks
 * @description Fetches a list of tasks from a Lokalise project with optional filtering and pagination.
 * @memberof VendorLokaliseTasksService
 * @param {TaskListParams} options - Parameters including project ID, filters, and pagination options
 * @returns {Promise<PaginatedResult<Task>>} A promise that resolves to the API response containing the tasks list
 * @throws {McpError} Throws an McpError with details if the API call fails
 */
export async function getTasks(
	options: TaskListParams,
): Promise<PaginatedResult<Task>> {
	const methodLogger = serviceLogger.forMethod("getTasks");

	try {
		methodLogger.debug("Calling Lokalise Tasks API - list", {
			projectId: options.project_id,
			limit: options.limit,
			page: options.page,
			filterTitle: options.filter_title,
			filterStatuses: options.filter_statuses,
		});

		const api = getLokaliseApi();

		// Prepare API parameters with proper typing
		const apiParams: ListTaskParams = {
			project_id: options.project_id,
			limit: options.limit || 100,
			page: options.page || 1,
		};

		if (options.filter_title) {
			apiParams.filter_title = options.filter_title;
		}
		if (options.filter_statuses) {
			apiParams.filter_statuses = options.filter_statuses;
		}

		const result = await api.tasks().list(apiParams);

		methodLogger.debug("Lokalise Tasks API call successful", {
			projectId: options.project_id,
			tasksCount: result.items?.length || 0,
			hasNextPage: result.hasNextPage(),
		});

		return result;
	} catch (error: unknown) {
		methodLogger.error("Lokalise Tasks API call failed - list", {
			error: (error as Error).message,
			projectId: options.project_id,
		});

		if ((error as ApiError).code === 404) {
			throw createApiError(`Project not found: ${options.project_id}`, 404);
		}
		if ((error as ApiError).code === 403) {
			throw createApiError("Access denied to this project", 403);
		}
		if ((error as ApiError).code === 401) {
			throw createApiError("Invalid API key", 401);
		}

		throw createUnexpectedError(
			`Failed to fetch tasks from project ${options.project_id}: ${(error as Error).message}`,
		);
	}
}

/**
 * @function createTask
 * @description Creates a task in a Lokalise project
 * @memberof VendorLokaliseTasksService
 * @param {CreateTaskServiceParams} options - Parameters including project ID and task data
 * @returns {Promise<Task>} A promise that resolves to the API response containing created task
 * @throws {McpError} Throws an McpError with details if the API call fails
 */
export async function createTask(
	options: CreateTaskServiceParams,
): Promise<Task> {
	const methodLogger = serviceLogger.forMethod("createTask");

	try {
		methodLogger.debug("Calling Lokalise Tasks API - create", {
			projectId: options.project_id,
			title: options.title,
			languagesCount: options.languages?.length || 0,
		});

		const api = getLokaliseApi();

		// Prepare API parameters matching SDK interface
		const apiParams: CreateTaskParams = {
			title: options.title,
		};

		// Only include optional parameters if they have values
		if (options.description !== undefined) {
			apiParams.description = options.description;
		}
		if (options.keys !== undefined && options.keys.length > 0) {
			apiParams.keys = options.keys;
		}
		if (options.languages !== undefined) {
			apiParams.languages = options.languages;
		}
		if (options.due_date !== undefined) {
			apiParams.due_date = options.due_date;
		}
		if (options.source_language_iso !== undefined) {
			apiParams.source_language_iso = options.source_language_iso;
		}
		if (options.auto_close_languages !== undefined) {
			apiParams.auto_close_languages = options.auto_close_languages;
		}
		if (options.auto_close_task !== undefined) {
			apiParams.auto_close_task = options.auto_close_task;
		}
		if (options.auto_close_items !== undefined) {
			apiParams.auto_close_items = options.auto_close_items;
		}
		if (options.task_type !== undefined) {
			apiParams.task_type = options.task_type;
		}
		if (options.parent_task_id !== undefined) {
			apiParams.parent_task_id = options.parent_task_id;
		}
		if (options.closing_tags !== undefined && options.closing_tags.length > 0) {
			apiParams.closing_tags = options.closing_tags;
		}
		if (options.do_lock_translations !== undefined) {
			apiParams.do_lock_translations = options.do_lock_translations;
		}
		if (
			options.custom_translation_status_ids !== undefined &&
			options.custom_translation_status_ids.length > 0
		) {
			apiParams.custom_translation_status_ids =
				options.custom_translation_status_ids;
		}

		// Ensure languages have users or groups if they're provided empty
		if (apiParams.languages && apiParams.languages.length > 0) {
			apiParams.languages = apiParams.languages.map((lang) => {
				// If neither users nor groups are specified, we need to provide at least one
				if (!lang.users?.length && !lang.groups?.length) {
					// If assignees were provided at the top level, use them for each language
					if (options.assignees && options.assignees.length > 0) {
						return { ...lang, users: options.assignees };
					}
					// Otherwise, throw a helpful error before calling the API
					throw createApiError(
						"Tasks with languages require either 'users' or 'groups' to be specified for each language, or use the 'assignees' parameter to assign users to all languages",
						400,
					);
				}
				return lang;
			});
		}

		const result = await api
			.tasks()
			.create(apiParams, { project_id: options.project_id });

		methodLogger.debug("Lokalise Tasks API call successful - create", {
			projectId: options.project_id,
			taskId: result.task_id,
			title: result.title,
		});

		return result;
	} catch (error: unknown) {
		methodLogger.error("Lokalise Tasks API call failed - create", {
			error: (error as Error).message,
			projectId: options.project_id,
		});

		if ((error as ApiError).code === 404) {
			throw createApiError(`Project not found: ${options.project_id}`, 404);
		}
		if ((error as ApiError).code === 403) {
			throw createApiError("Access denied to this project", 403);
		}
		if ((error as ApiError).code === 401) {
			throw createApiError("Invalid API key", 401);
		}

		throw createUnexpectedError(
			`Failed to create task in project ${options.project_id}: ${(error as Error).message}`,
		);
	}
}

/**
 * @function getTask
 * @description Fetches a single task from a Lokalise project
 * @memberof VendorLokaliseTasksService
 * @param {GetTaskParams} options - Parameters including project ID and task ID
 * @returns {Promise<Task>} A promise that resolves to the task data
 * @throws {McpError} Throws an McpError with details if the API call fails
 */
export async function getTask(options: GetTaskParams): Promise<Task> {
	const methodLogger = serviceLogger.forMethod("getTask");

	try {
		methodLogger.debug("Calling Lokalise Tasks API - get", {
			projectId: options.project_id,
			taskId: options.task_id,
		});

		const api = getLokaliseApi();
		const result = await api
			.tasks()
			.get(options.task_id, { project_id: options.project_id });

		methodLogger.debug("Lokalise Tasks API call successful - get", {
			projectId: options.project_id,
			taskId: options.task_id,
			title: result.title,
		});

		return result;
	} catch (error: unknown) {
		methodLogger.error("Lokalise Tasks API call failed - get", {
			error: (error as Error).message,
			projectId: options.project_id,
			taskId: options.task_id,
		});

		if ((error as ApiError).code === 404) {
			throw createApiError(
				`Task not found: ${options.task_id} in project ${options.project_id}`,
				404,
			);
		}
		if ((error as ApiError).code === 403) {
			throw createApiError("Access denied to this project", 403);
		}
		if ((error as ApiError).code === 401) {
			throw createApiError("Invalid API key", 401);
		}

		throw createUnexpectedError(
			`Failed to fetch task ${options.task_id} from project ${options.project_id}: ${(error as Error).message}`,
		);
	}
}

/**
 * @function updateTask
 * @description Updates a single task in a Lokalise project
 * @memberof VendorLokaliseTasksService
 * @param {UpdateTaskServiceParams} options - Parameters including project ID, task ID and update data
 * @returns {Promise<Task>} A promise that resolves to the updated task data
 * @throws {McpError} Throws an McpError with details if the API call fails
 */
export async function updateTask(
	options: UpdateTaskServiceParams,
): Promise<Task> {
	const methodLogger = serviceLogger.forMethod("updateTask");

	try {
		methodLogger.debug("Calling Lokalise Tasks API - update", {
			projectId: options.project_id,
			taskId: options.task_id,
		});

		const api = getLokaliseApi();

		// Prepare update data matching SDK interface
		const updateData: UpdateTaskParams = {};
		if (options.title !== undefined) {
			updateData.title = options.title;
		}
		if (options.description !== undefined) {
			updateData.description = options.description;
		}
		if (options.due_date !== undefined) {
			updateData.due_date = options.due_date;
		}
		if (options.languages !== undefined) {
			updateData.languages = options.languages;
		}
		if (options.auto_close_languages !== undefined) {
			updateData.auto_close_languages = options.auto_close_languages;
		}
		if (options.auto_close_task !== undefined) {
			updateData.auto_close_task = options.auto_close_task;
		}
		if (options.auto_close_items !== undefined) {
			updateData.auto_close_items = options.auto_close_items;
		}
		if (options.closing_tags !== undefined && options.closing_tags.length > 0) {
			updateData.closing_tags = options.closing_tags;
		}
		if (options.do_lock_translations !== undefined) {
			updateData.do_lock_translations = options.do_lock_translations;
		}
		if (options.close_task !== undefined) {
			updateData.close_task = options.close_task;
		}

		const result = await api
			.tasks()
			.update(options.task_id, updateData, { project_id: options.project_id });

		methodLogger.debug("Lokalise Tasks API call successful - update", {
			projectId: options.project_id,
			taskId: options.task_id,
			title: result.title,
		});

		return result;
	} catch (error: unknown) {
		methodLogger.error("Lokalise Tasks API call failed - update", {
			error: (error as Error).message,
			projectId: options.project_id,
			taskId: options.task_id,
		});

		if ((error as ApiError).code === 404) {
			throw createApiError(
				`Task not found: ${options.task_id} in project ${options.project_id}`,
				404,
			);
		}
		if ((error as ApiError).code === 403) {
			throw createApiError("Access denied to this project", 403);
		}
		if ((error as ApiError).code === 401) {
			throw createApiError("Invalid API key", 401);
		}

		throw createUnexpectedError(
			`Failed to update task ${options.task_id} in project ${options.project_id}: ${(error as Error).message}`,
		);
	}
}

/**
 * @function deleteTask
 * @description Deletes a single task from a Lokalise project
 * @memberof VendorLokaliseTasksService
 * @param {DeleteTaskParams} options - Parameters including project ID and task ID
 * @returns {Promise<TaskDeleted>} A promise that resolves to the deletion confirmation
 * @throws {McpError} Throws an McpError with details if the API call fails
 */
export async function deleteTask(
	options: DeleteTaskParams,
): Promise<TaskDeleted> {
	const methodLogger = serviceLogger.forMethod("deleteTask");

	try {
		methodLogger.debug("Calling Lokalise Tasks API - delete", {
			projectId: options.project_id,
			taskId: options.task_id,
		});

		const api = getLokaliseApi();
		const result = await api
			.tasks()
			.delete(options.task_id, { project_id: options.project_id });

		methodLogger.debug("Lokalise Tasks API call successful - delete", {
			projectId: options.project_id,
			taskId: options.task_id,
		});

		return result;
	} catch (error: unknown) {
		methodLogger.error("Lokalise Tasks API call failed - delete", {
			error: (error as Error).message,
			projectId: options.project_id,
			taskId: options.task_id,
		});

		if ((error as ApiError).code === 404) {
			throw createApiError(
				`Task not found: ${options.task_id} in project ${options.project_id}`,
				404,
			);
		}
		if ((error as ApiError).code === 403) {
			throw createApiError("Access denied to this project", 403);
		}
		if ((error as ApiError).code === 401) {
			throw createApiError("Invalid API key", 401);
		}

		throw createUnexpectedError(
			`Failed to delete task ${options.task_id} from project ${options.project_id}: ${(error as Error).message}`,
		);
	}
}
