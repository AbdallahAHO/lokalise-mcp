import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type {
	DomainMeta,
	DomainTool,
} from "../../shared/types/domain.types.js";
import { formatErrorForMcpTool } from "../../shared/utils/error.util.js";
import { Logger } from "../../shared/utils/logger.util.js";
import teamusersController from "./teamusers.controller.js";
import type {
	DeleteTeamusersToolArgsType,
	GetTeamusersToolArgsType,
	ListTeamusersToolArgsType,
	UpdateTeamusersToolArgsType,
} from "./teamusers.types.js";
import {
	DeleteTeamusersToolArgs,
	GetTeamusersToolArgs,
	ListTeamusersToolArgs,
	UpdateTeamusersToolArgs,
} from "./teamusers.types.js";

/**
 * @function handleListTeamusers
 * @description MCP Tool handler to retrieve a list of teamusers from a Lokalise project.
 *              It calls the teamusersController to fetch the data and formats the response for the MCP.
 *
 * @param {ListTeamuserssToolArgsType} args - Arguments provided to the tool.
 * @returns {Promise<{ content: Array<{ type: 'text', text: string }> }>} Formatted response for the MCP.
 * @throws {McpError} Formatted error if the controller or service layer encounters an issue.
 */
async function handleListTeamusers(args: ListTeamusersToolArgsType) {
	const methodLogger = Logger.forContext(
		"teamusers.tool.ts",
		"handleListTeamusers",
	);
	methodLogger.debug(
		`Getting Lokalise teamusers list (limit: ${args.limit || "default"}, page: ${args.page || "1"})...`,
		args,
	);

	try {
		const result = await teamusersController.listTeamusers(args);
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
 * @function handleGetTeamusers
 * @description MCP Tool handler to retrieve details of a specific teamusers.
 *
 * @param {GetTeamusersToolArgsType} args - Arguments provided to the tool.
 * @returns {Promise<{ content: Array<{ type: 'text', text: string }> }>} Formatted response for the MCP.
 * @throws {McpError} Formatted error if the controller or service layer encounters an issue.
 */
async function handleGetTeamusers(args: GetTeamusersToolArgsType) {
	const methodLogger = Logger.forContext(
		"teamusers.tool.ts",
		"handleGetTeamusers",
	);
	methodLogger.debug("Getting teamusers details...", args);

	try {
		const result = await teamusersController.getTeamusers(args);
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
 * @function handleUpdateTeamusers
 * @description MCP Tool handler to update a teamusers's properties.
 *
 * @param {UpdateTeamusersToolArgsType} args - Arguments provided to the tool.
 * @returns {Promise<{ content: Array<{ type: 'text', text: string }> }>} Formatted response for the MCP.
 * @throws {McpError} Formatted error if the controller or service layer encounters an issue.
 */
async function handleUpdateTeamusers(args: UpdateTeamusersToolArgsType) {
	const methodLogger = Logger.forContext(
		"teamusers.tool.ts",
		"handleUpdateTeamusers",
	);
	methodLogger.debug("Updating teamusers...", args);

	try {
		const result = await teamusersController.updateTeamusers(args);
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
 * @function handleDeleteTeamusers
 * @description MCP Tool handler to remove a teamusers from a project.
 *
 * @param {DeleteTeamusersToolArgsType} args - Arguments provided to the tool.
 * @returns {Promise<{ content: Array<{ type: 'text', text: string }> }>} Formatted response for the MCP.
 * @throws {McpError} Formatted error if the controller or service layer encounters an issue.
 */
async function handleDeleteTeamusers(args: DeleteTeamusersToolArgsType) {
	const methodLogger = Logger.forContext(
		"teamusers.tool.ts",
		"handleDeleteTeamusers",
	);
	methodLogger.debug("Removing teamusers...", args);

	try {
		const result = await teamusersController.deleteTeamusers(args);
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
 * @description Registers all teamusers-related tools with the MCP server.
 *              This function binds the tool names to their handler functions and schemas.
 *
 * @param {McpServer} server - The MCP server instance where tools will be registered.
 */
function registerTools(server: McpServer) {
	const methodLogger = Logger.forContext("teamusers.tool.ts", "registerTools");
	methodLogger.info("Registering teamusers MCP tools");

	server.tool(
		"lokalise_list_team_users",
		"Lists all users in a Lokalise team with pagination support",
		ListTeamusersToolArgs.shape,
		handleListTeamusers,
	);

	server.tool(
		"lokalise_get_team_user",
		"Gets detailed information about a specific user in a team",
		GetTeamusersToolArgs.shape,
		handleGetTeamusers,
	);

	server.tool(
		"lokalise_update_team_user",
		"Updates a team user's role (owner, admin, member, or biller)",
		UpdateTeamusersToolArgs.shape,
		handleUpdateTeamusers,
	);

	server.tool(
		"lokalise_delete_team_user",
		"Removes a user from a Lokalise team",
		DeleteTeamusersToolArgs.shape,
		handleDeleteTeamusers,
	);

	methodLogger.info("Teamusers MCP tools registered successfully");
}

// Export the domain tool implementation
const teamusersTool: DomainTool = {
	registerTools,
	getMeta(): DomainMeta {
		return {
			name: "teamusers",
			description: "Team users management for Lokalise teams",
			version: "1.0.0",
			toolsCount: 4,
		};
	},
};

export default teamusersTool;
