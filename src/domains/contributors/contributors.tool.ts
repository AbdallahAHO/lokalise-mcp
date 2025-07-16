import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type {
	DomainMeta,
	DomainTool,
} from "../../shared/types/domain.types.js";
import { formatErrorForMcpTool } from "../../shared/utils/error.util.js";
import { Logger } from "../../shared/utils/logger.util.js";
import contributorsController from "./contributors.controller.js";
import type {
	AddContributorsToolArgsType,
	GetContributorToolArgsType,
	GetCurrentUserToolArgsType,
	ListContributorsToolArgsType,
	RemoveContributorToolArgsType,
	UpdateContributorToolArgsType,
} from "./contributors.types.js";
import {
	AddContributorsToolArgs,
	GetContributorToolArgs,
	GetCurrentUserToolArgs,
	ListContributorsToolArgs,
	RemoveContributorToolArgs,
	UpdateContributorToolArgs,
} from "./contributors.types.js";

/**
 * @function handleListContributors
 * @description MCP Tool handler to retrieve a list of contributors from a Lokalise project.
 *              It calls the contributorsController to fetch the data and formats the response for the MCP.
 *
 * @param {ListContributorsToolArgsType} args - Arguments provided to the tool.
 * @returns {Promise<{ content: Array<{ type: 'text', text: string }> }>} Formatted response for the MCP.
 * @throws {McpError} Formatted error if the controller or service layer encounters an issue.
 */
async function handleListContributors(args: ListContributorsToolArgsType) {
	const methodLogger = Logger.forContext(
		"contributors.tool.ts",
		"handleListContributors",
	);
	methodLogger.debug(
		`Getting Lokalise contributors list (limit: ${args.limit || "default"}, page: ${args.page || "1"})...`,
		args,
	);

	try {
		const result = await contributorsController.listContributors(args);
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
 * @function handleGetContributor
 * @description MCP Tool handler to retrieve details of a specific contributor.
 *
 * @param {GetContributorToolArgsType} args - Arguments provided to the tool.
 * @returns {Promise<{ content: Array<{ type: 'text', text: string }> }>} Formatted response for the MCP.
 * @throws {McpError} Formatted error if the controller or service layer encounters an issue.
 */
async function handleGetContributor(args: GetContributorToolArgsType) {
	const methodLogger = Logger.forContext(
		"contributors.tool.ts",
		"handleGetContributor",
	);
	methodLogger.debug("Getting contributor details...", args);

	try {
		const result = await contributorsController.getContributor(args);
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
 * @function handleAddContributors
 * @description MCP Tool handler to add new contributors to a project.
 *
 * @param {AddContributorsToolArgsType} args - Arguments provided to the tool.
 * @returns {Promise<{ content: Array<{ type: 'text', text: string }> }>} Formatted response for the MCP.
 * @throws {McpError} Formatted error if the controller or service layer encounters an issue.
 */
async function handleAddContributors(args: AddContributorsToolArgsType) {
	const methodLogger = Logger.forContext(
		"contributors.tool.ts",
		"handleAddContributors",
	);
	methodLogger.debug("Adding contributors...", args);

	try {
		const result = await contributorsController.addContributors(args);
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
 * @function handleGetCurrentUser
 * @description MCP Tool handler to get the current user's contributor profile.
 *
 * @param {GetCurrentUserToolArgsType} args - Arguments provided to the tool.
 * @returns {Promise<{ content: Array<{ type: 'text', text: string }> }>} Formatted response for the MCP.
 * @throws {McpError} Formatted error if the controller or service layer encounters an issue.
 */
async function handleGetCurrentUser(args: GetCurrentUserToolArgsType) {
	const methodLogger = Logger.forContext(
		"contributors.tool.ts",
		"handleGetCurrentUser",
	);
	methodLogger.debug("Getting current user contributor profile...", args);

	try {
		const result = await contributorsController.getCurrentUser(args);
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
 * @function handleUpdateContributor
 * @description MCP Tool handler to update a contributor's permissions.
 *
 * @param {UpdateContributorToolArgsType} args - Arguments provided to the tool.
 * @returns {Promise<{ content: Array<{ type: 'text', text: string }> }>} Formatted response for the MCP.
 * @throws {McpError} Formatted error if the controller or service layer encounters an issue.
 */
async function handleUpdateContributor(args: UpdateContributorToolArgsType) {
	const methodLogger = Logger.forContext(
		"contributors.tool.ts",
		"handleUpdateContributor",
	);
	methodLogger.debug("Updating contributor...", args);

	try {
		const result = await contributorsController.updateContributor(args);
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
 * @function handleRemoveContributor
 * @description MCP Tool handler to remove a contributor from a project.
 *
 * @param {RemoveContributorToolArgsType} args - Arguments provided to the tool.
 * @returns {Promise<{ content: Array<{ type: 'text', text: string }> }>} Formatted response for the MCP.
 * @throws {McpError} Formatted error if the controller or service layer encounters an issue.
 */
async function handleRemoveContributor(args: RemoveContributorToolArgsType) {
	const methodLogger = Logger.forContext(
		"contributors.tool.ts",
		"handleRemoveContributor",
	);
	methodLogger.debug("Removing contributor...", args);

	try {
		const result = await contributorsController.removeContributor(args);
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
 * @description Registers all contributors-related tools with the MCP server.
 *              This function binds the tool names to their handler functions and schemas.
 *
 * @param {McpServer} server - The MCP server instance where tools will be registered.
 */
function registerTools(server: McpServer) {
	const methodLogger = Logger.forContext(
		"contributors.tool.ts",
		"registerTools",
	);
	methodLogger.info("Registering contributors MCP tools");

	server.tool(
		"lokalise_list_contributors",
		"Lists all team members in a project with their roles and permissions. Required: projectId. Optional: limit (100), page. Use to audit team access, check language assignments, or prepare permission changes. Returns: Contributors with email, role, admin status, and language permissions. Use before adding new members to avoid duplicates.",
		ListContributorsToolArgs.shape,
		handleListContributors,
	);

	server.tool(
		"lokalise_get_contributor",
		"Retrieves detailed information about a specific team member's access and permissions. Required: projectId, contributorId. Use to verify exact permissions before updates, investigate access issues, or get complete language assignments. Returns: Full contributor profile including all language permissions and administrative rights.",
		GetContributorToolArgs.shape,
		handleGetContributor,
	);

	server.tool(
		"lokalise_add_contributors",
		"Onboards one or more new team members to a project. Required: projectId, contributors array with email and permissions (admin_rights, is_reviewer, languages). Use for team expansion, granting translator access, or adding reviewers. Returns: Added contributors with assigned IDs. Note: Sends invitation emails automatically.",
		AddContributorsToolArgs.shape,
		handleAddContributors,
	);

	server.tool(
		"lokalise_get_current_user",
		"Checks your own permissions and access level in a project. Required: projectId. Use to verify your administrative capabilities, check language access, or confirm reviewer status before attempting restricted operations. Returns: Your contributor profile with all permissions. Essential before permission-sensitive operations.",
		GetCurrentUserToolArgs.shape,
		handleGetCurrentUser,
	);

	server.tool(
		"lokalise_update_contributor",
		"Modifies a team member's role, permissions, or language access. Required: projectId, contributorId. Optional: admin_rights, is_reviewer, languages array. Use to promote/demote users, adjust language assignments, or fix permission issues. Returns: Updated contributor profile. Note: Cannot modify your own admin rights.",
		UpdateContributorToolArgs.shape,
		handleUpdateContributor,
	);

	server.tool(
		"lokalise_remove_contributor",
		"Removes a team member from a project, revoking all access. Required: projectId, contributorId. Use for offboarding, security cleanup, or removing inactive members. Returns: Confirmation of removal. Warning: Immediate effect - contributor loses all project access. Consider permission downgrade instead for temporary changes.",
		RemoveContributorToolArgs.shape,
		handleRemoveContributor,
	);

	methodLogger.info("Contributors MCP tools registered successfully");
}

// Export the domain tool implementation
const contributorsTool: DomainTool = {
	registerTools,
	getMeta(): DomainMeta {
		return {
			name: "contributors",
			description: "Team member and contributor management",
			version: "1.0.0",
			toolsCount: 6,
		};
	},
};

export default contributorsTool;
