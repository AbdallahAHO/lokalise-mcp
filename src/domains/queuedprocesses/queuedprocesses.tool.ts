import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type {
	DomainMeta,
	DomainTool,
} from "../../shared/types/domain.types.js";
import { formatErrorForMcpTool } from "../../shared/utils/error.util.js";
import { Logger } from "../../shared/utils/logger.util.js";
import queuedprocessesController from "./queuedprocesses.controller.js";
import type {
	GetQueuedprocessesToolArgsType,
	ListQueuedprocessesToolArgsType,
} from "./queuedprocesses.types.js";
import {
	GetQueuedprocessesToolArgs,
	ListQueuedprocessesToolArgs,
} from "./queuedprocesses.types.js";

/**
 * @function handleListQueuedprocesses
 * @description MCP Tool handler to retrieve a list of queuedprocesses from a Lokalise project.
 *              It calls the queuedprocessesController to fetch the data and formats the response for the MCP.
 *
 * @param {ListQueuedprocessessToolArgsType} args - Arguments provided to the tool.
 * @returns {Promise<{ content: Array<{ type: 'text', text: string }> }>} Formatted response for the MCP.
 * @throws {McpError} Formatted error if the controller or service layer encounters an issue.
 */
async function handleListQueuedprocesses(
	args: ListQueuedprocessesToolArgsType,
) {
	const methodLogger = Logger.forContext(
		"queuedprocesses.tool.ts",
		"handleListQueuedprocesses",
	);
	methodLogger.debug(
		`Getting Lokalise queuedprocesses list (limit: ${args.limit || "default"}, page: ${args.page || "1"})...`,
		args,
	);

	try {
		const result = await queuedprocessesController.listQueuedprocesses(args);
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
		methodLogger.error("Tool failed", {
			error: (error as Error).message,
			args,
		});
		return formatErrorForMcpTool(error);
	}
}

/**
 * MCP Tool handler to retrieve details of a specific queued process.
 * Returns status, type, and details about the async operation.
 */
async function handleGetQueuedprocesses(
	args: GetQueuedprocessesToolArgsType,
): Promise<{ content: Array<{ type: "text"; text: string }> }> {
	const methodLogger = Logger.forContext(
		"queuedprocesses.tool.ts",
		"handleGetQueuedprocesses",
	);
	methodLogger.debug("Getting queuedprocesses details...", args);

	try {
		const result = await queuedprocessesController.getQueuedprocesses(args);
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
		methodLogger.error("Tool failed", {
			error: (error as Error).message,
			args,
		});
		return formatErrorForMcpTool(error);
	}
}

/**
 * @function registerTools
 * @description Registers all queuedprocesses-related tools with the MCP server.
 *              This function binds the tool names to their handler functions and schemas.
 *
 * @param {McpServer} server - The MCP server instance where tools will be registered.
 */
function registerTools(server: McpServer) {
	const methodLogger = Logger.forContext(
		"queuedprocesses.tool.ts",
		"registerTools",
	);
	methodLogger.info("Registering queuedprocesses MCP tools");

	server.tool(
		"lokalise_list_queued_processes",
		"Lists all background/async processes in a Lokalise project with status tracking",
		ListQueuedprocessesToolArgs.shape,
		handleListQueuedprocesses,
	);

	server.tool(
		"lokalise_get_queued_process",
		"Gets detailed status and information about a specific async process (upload, download, etc.)",
		GetQueuedprocessesToolArgs.shape,
		handleGetQueuedprocesses,
	);

	methodLogger.info("Queuedprocesses MCP tools registered successfully");
}

// Export the domain tool implementation
const queuedprocessesTool: DomainTool = {
	registerTools,
	getMeta(): DomainMeta {
		return {
			name: "queuedprocesses",
			description: "Monitor background/async operations in Lokalise projects",
			version: "1.0.0",
			toolsCount: 2,
		};
	},
};

export default queuedprocessesTool;
