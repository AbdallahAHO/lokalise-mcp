import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { ResourceTemplate } from "@modelcontextprotocol/sdk/server/mcp.js";
import type {
	DomainMeta,
	DomainResource,
} from "../../shared/types/domain.types.js";
import { formatErrorForMcpResource } from "../../shared/utils/error.util.js";
import { Logger } from "../../shared/utils/logger.util.js";
import controller from "./tasks.controller.js";

const logger = Logger.forContext("tasks.resource.ts");

/**
 * Register all MCP resources for the tasks domain
 * @param server The MCP server instance to register resources with
 */
function registerResources(server: McpServer): void {
	const registerLogger = logger.forMethod("registerResources");
	registerLogger.debug("Registering tasks domain resources...");

	// Register the project tasks resource
	server.resource(
		"lokalise-project-tasks",
		new ResourceTemplate("lokalise://tasks/{projectId}", { list: undefined }),
		async (uri: URL) => {
			const methodLogger = logger.forMethod("projectTasksResource");
			try {
				// Extract the project ID from the request path
				// Format: lokalise://tasks/{projectId}?status=open&assignedTo=user123&page=1&limit=50
				methodLogger.debug("Project tasks resource called", {
					uri: uri.toString(),
				});

				// Get project ID from the path (after 'tasks/')
				const pathParts = uri.pathname.split("/").filter(Boolean);
				const projectId = pathParts[1]; // Second part is the project ID after 'tasks'

				if (!projectId) {
					throw new Error("Project ID is required in the URI path");
				}

				const urlParams = new URLSearchParams(uri.search);
				const filterTitle = urlParams.get("filterTitle") || undefined;
				const filterStatuses =
					(urlParams.get("filterStatuses")?.split(",") as
						| ("new" | "in_progress" | "completed" | "closed")[]
						| undefined) || undefined;
				const page = urlParams.get("page")
					? Number.parseInt(urlParams.get("page") ?? "0", 10)
					: undefined;
				const limit = urlParams.get("limit")
					? Number.parseInt(urlParams.get("limit") ?? "0", 10)
					: undefined;

				// Call the controller to get the project tasks
				const result = await controller.listTasks({
					projectId,
					filterTitle,
					filterStatuses,
					page,
					limit,
				});

				// Return the content as a text resource
				return {
					contents: [
						{
							uri: uri.toString(),
							text: result.content,
							mimeType: "text/markdown",
							description: `Lokalise Project Tasks: ${projectId}${filterTitle ? ` (title: ${filterTitle})` : ""}${filterStatuses ? ` (statuses: ${filterStatuses.join(",")})` : ""}`,
						},
					],
				};
			} catch (error) {
				methodLogger.error("Project tasks resource error", error);
				return formatErrorForMcpResource(error, uri.toString());
			}
		},
	);

	// Register the single task resource
	server.resource(
		"lokalise-task-details",
		new ResourceTemplate("lokalise://tasks/{projectId}/{taskId}", {
			list: undefined,
		}),
		async (uri: URL) => {
			const methodLogger = logger.forMethod("taskDetailsResource");
			try {
				// Extract the project ID and task ID from the request path
				// Format: lokalise://tasks/{projectId}/{taskId}?includeProgress=true
				methodLogger.debug("Task details resource called", {
					uri: uri.toString(),
				});

				// Get project ID and task ID from the path (after 'tasks/')
				const pathParts = uri.pathname.split("/").filter(Boolean);
				const projectId = pathParts[1]; // Second part is the project ID after 'tasks'
				const taskId = pathParts[2]; // Third part is the task ID

				if (!projectId || !taskId) {
					throw new Error(
						"Both project ID and task ID are required in the URI path",
					);
				}

				// Call the controller to get the task details
				const result = await controller.getTask({
					projectId,
					taskId: Number.parseInt(taskId, 10),
				});

				// Return the content as a text resource
				return {
					contents: [
						{
							uri: uri.toString(),
							text: result.content,
							mimeType: "text/markdown",
							description: `Lokalise Task Details: ${taskId} (Project: ${projectId})`,
						},
					],
				};
			} catch (error) {
				methodLogger.error("Task details resource error", error);
				return formatErrorForMcpResource(error, uri.toString());
			}
		},
	);

	registerLogger.debug("Tasks domain resources registered successfully");
}

/**
 * Get metadata about the tasks domain resources
 */
function getMeta(): DomainMeta {
	return {
		name: "tasks",
		description: "Lokalise tasks domain resources",
		version: "1.0.0",
		resourcesCount: 2,
	};
}

const tasksResource: DomainResource = {
	registerResources,
	getMeta,
};

export default tasksResource;
