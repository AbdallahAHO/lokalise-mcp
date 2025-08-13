import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type {
	DomainMeta,
	DomainTool,
} from "../../shared/types/domain.types.js";
import { formatErrorForMcpTool } from "../../shared/utils/error.util.js";
import { Logger } from "../../shared/utils/logger.util.js";
import tasksController from "./tasks.controller.js";
import type {
	CreateTaskToolArgsType,
	DeleteTaskToolArgsType,
	GetTaskToolArgsType,
	ListTasksToolArgsType,
	UpdateTaskToolArgsType,
} from "./tasks.types.js";
import {
	CreateTaskToolArgs,
	DeleteTaskToolArgs,
	GetTaskToolArgs,
	ListTasksToolArgs,
	UpdateTaskToolArgs,
} from "./tasks.types.js";

/**
 * @function handleListTasks
 * @description MCP Tool handler to retrieve a list of tasks from a Lokalise project.
 *              It calls the tasksController to fetch the data and formats the response for the MCP.
 *
 * @param {ListTasksToolArgsType} args - Arguments provided to the tool.
 * @returns {Promise<{ content: Array<{ type: 'text', text: string }> }>} Formatted response for the MCP.
 * @throws {McpError} Formatted error if the controller or service layer encounters an issue.
 */
async function handleListTasks(args: ListTasksToolArgsType) {
	const methodLogger = Logger.forContext(
		"tools/tasks.tool.ts",
		"handleListTasks",
	);
	methodLogger.debug(
		`Getting Lokalise tasks list (limit: ${args.limit || "default"}, page: ${args.page || "1"})...`,
		args,
	);

	try {
		// Pass args directly to the controller
		const result = await tasksController.listTasks(args);
		methodLogger.debug("Got the response from the controller", result);

		// Format the response for the MCP tool
		return {
			content: [
				{
					type: "text" as const,
					text: result.content,
				},
			],
		};
	} catch (error) {
		methodLogger.error("Error in handleListTasks", { error, args });
		return formatErrorForMcpTool(error);
	}
}

/**
 * @function handleCreateTask
 * @description MCP Tool handler to create a task in a Lokalise project.
 *
 * @param {CreateTaskToolArgsType} args - Arguments provided to the tool.
 * @returns {Promise<{ content: Array<{ type: 'text', text: string }> }>} Formatted response for the MCP.
 * @throws {McpError} Formatted error if the controller or service layer encounters an issue.
 */
async function handleCreateTask(args: CreateTaskToolArgsType) {
	const methodLogger = Logger.forContext(
		"tools/tasks.tool.ts",
		"handleCreateTask",
	);
	methodLogger.debug(
		`Creating task "${args.title}" in project ${args.projectId}...`,
		args,
	);

	try {
		const result = await tasksController.createTask(args);
		methodLogger.debug("Got the response from the controller", result);

		return {
			content: [
				{
					type: "text" as const,
					text: result.content,
				},
			],
		};
	} catch (error) {
		methodLogger.error("Error in handleCreateTask", { error, args });
		return formatErrorForMcpTool(error);
	}
}

/**
 * @function handleGetTask
 * @description MCP Tool handler to retrieve a single task from a Lokalise project.
 *
 * @param {GetTaskToolArgsType} args - Arguments provided to the tool.
 * @returns {Promise<{ content: Array<{ type: 'text', text: string }> }>} Formatted response for the MCP.
 * @throws {McpError} Formatted error if the controller or service layer encounters an issue.
 */
async function handleGetTask(args: GetTaskToolArgsType) {
	const methodLogger = Logger.forContext(
		"tools/tasks.tool.ts",
		"handleGetTask",
	);
	methodLogger.debug(
		`Getting task ${args.taskId} from project ${args.projectId}...`,
		args,
	);

	try {
		const result = await tasksController.getTask(args);
		methodLogger.debug("Got the response from the controller", result);

		return {
			content: [
				{
					type: "text" as const,
					text: result.content,
				},
			],
		};
	} catch (error) {
		methodLogger.error("Error in handleGetTask", { error, args });
		return formatErrorForMcpTool(error);
	}
}

/**
 * @function handleUpdateTask
 * @description MCP Tool handler to update a single task in a Lokalise project.
 *
 * @param {UpdateTaskToolArgsType} args - Arguments provided to the tool.
 * @returns {Promise<{ content: Array<{ type: 'text', text: string }> }>} Formatted response for the MCP.
 * @throws {McpError} Formatted error if the controller or service layer encounters an issue.
 */
async function handleUpdateTask(args: UpdateTaskToolArgsType) {
	const methodLogger = Logger.forContext(
		"tools/tasks.tool.ts",
		"handleUpdateTask",
	);
	methodLogger.debug(
		`Updating task ${args.taskId} in project ${args.projectId}...`,
		args,
	);

	try {
		const result = await tasksController.updateTask(args);
		methodLogger.debug("Got the response from the controller", result);

		return {
			content: [
				{
					type: "text" as const,
					text: result.content,
				},
			],
		};
	} catch (error) {
		methodLogger.error("Error in handleUpdateTask", { error, args });
		return formatErrorForMcpTool(error);
	}
}

/**
 * @function handleDeleteTask
 * @description MCP Tool handler to delete a single task from a Lokalise project.
 *
 * @param {DeleteTaskToolArgsType} args - Arguments provided to the tool.
 * @returns {Promise<{ content: Array<{ type: 'text', text: string }> }>} Formatted response for the MCP.
 * @throws {McpError} Formatted error if the controller or service layer encounters an issue.
 */
async function handleDeleteTask(args: DeleteTaskToolArgsType) {
	const methodLogger = Logger.forContext(
		"tools/tasks.tool.ts",
		"handleDeleteTask",
	);
	methodLogger.debug(
		`Deleting task ${args.taskId} from project ${args.projectId}...`,
		args,
	);

	try {
		const result = await tasksController.deleteTask(args);
		methodLogger.debug("Got the response from the controller", result);

		return {
			content: [
				{
					type: "text" as const,
					text: result.content,
				},
			],
		};
	} catch (error) {
		methodLogger.error("Error in handleDeleteTask", { error, args });
		return formatErrorForMcpTool(error);
	}
}

/**
 * Register all MCP tools for the Tasks collection with the server
 */
function registerTools(server: McpServer) {
	const logger = Logger.forContext("tools/tasks.tool.ts", "registerTools");
	logger.debug("Registering Tasks MCP tools...");

	// List Tasks Tool
	server.tool(
		"lokalise_list_tasks",
		"Monitors ongoing translation work and deadlines across the project. Required: projectId. Optional: filterTitle, filterStatuses array, limit (50), page. Use to track workload, find overdue tasks, or check assignment status. Returns: Tasks with assignees, progress, due dates, and language scope. Essential for project management and workflow monitoring.",
		ListTasksToolArgs.shape,
		handleListTasks,
	);

	// Create Task Tool
	server.tool(
		"lokalise_create_task",
		"Initiates a new batch of translation or review work. Required: projectId, title, languages array. Optional: description, due_date, assignees (applies to all languages), type (translation/review), keys scope. Use to assign work to translators, set deadlines, or organize sprints. Returns: Created task with ID and assignments. Tip: Use assignees for simple same-user-all-languages setup.",
		CreateTaskToolArgs.shape,
		handleCreateTask,
	);

	// Get Task Tool
	server.tool(
		"lokalise_get_task",
		"Investigates a specific work assignment in detail. Required: projectId, taskId. Use to check task progress, view assignee workload, or debug workflow issues. Returns: Complete task data including all assignments, completion percentages, settings, and history. Pairs with: lokalise_update_task for modifications.",
		GetTaskToolArgs.shape,
		handleGetTask,
	);

	// Update Task Tool
	server.tool(
		"lokalise_update_task",
		"Modifies an active work assignment. Required: projectId, taskId. Optional: title, description, due_date, language assignments, settings. Use to extend deadlines, reassign work, or update scope. Returns: Updated task details. Note: Cannot change task type after creation. Changes notify assignees automatically.",
		UpdateTaskToolArgs.shape,
		handleUpdateTask,
	);

	// Delete Task Tool
	server.tool(
		"lokalise_delete_task",
		"Cancels a work assignment, removing it from assignee queues. Required: projectId, taskId. Use to cancel mistaken tasks, clean completed work, or remove test assignments. Returns: Deletion confirmation. Note: Only removes the assignment - keys and translations remain unchanged. Cannot be undone.",
		DeleteTaskToolArgs.shape,
		handleDeleteTask,
	);

	logger.debug("All Tasks MCP tools registered successfully");
}

// Export the tools registry
const tasksTools: DomainTool = {
	registerTools,
	getMeta(): DomainMeta {
		return {
			name: "tasks",
			description: "Tasks management domain",
			version: "1.0.0",
			toolsCount: 5,
		};
	},
};

export default tasksTools;
