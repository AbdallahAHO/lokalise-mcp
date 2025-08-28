import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type {
	DomainMeta,
	DomainTool,
} from "../../shared/types/domain.types.js";
import { formatErrorForMcpTool } from "../../shared/utils/error.util.js";
import { Logger } from "../../shared/utils/logger.util.js";
import usergroupsController from "./usergroups.controller.js";
import type {
	AddMembersToolArgsType,
	AddProjectsToolArgsType,
	CreateUsergroupsToolArgsType,
	DeleteUsergroupsToolArgsType,
	GetUsergroupsToolArgsType,
	ListUsergroupsToolArgsType,
	RemoveMembersToolArgsType,
	RemoveProjectsToolArgsType,
	UpdateUsergroupsToolArgsType,
} from "./usergroups.types.js";
import {
	AddMembersToolArgs,
	AddProjectsToolArgs,
	CreateUsergroupsToolArgs,
	DeleteUsergroupsToolArgs,
	GetUsergroupsToolArgs,
	ListUsergroupsToolArgs,
	RemoveMembersToolArgs,
	RemoveProjectsToolArgs,
	UpdateUsergroupsToolArgs,
} from "./usergroups.types.js";

/**
 * Handle list user groups
 */
async function handleListUsergroups(args: ListUsergroupsToolArgsType) {
	const methodLogger = Logger.forContext(
		"usergroups.tool.ts",
		"handleListUsergroups",
	);
	methodLogger.debug("Getting Lokalise user groups list...", args);

	try {
		const result = await usergroupsController.list(args);
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
 * Handle get user group details
 */
async function handleGetUsergroups(args: GetUsergroupsToolArgsType) {
	const methodLogger = Logger.forContext(
		"usergroups.tool.ts",
		"handleGetUsergroups",
	);
	methodLogger.debug("Getting user group details...", args);

	try {
		const result = await usergroupsController.get(args);
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
 * Handle create user group
 */
async function handleCreateUsergroups(args: CreateUsergroupsToolArgsType) {
	const methodLogger = Logger.forContext(
		"usergroups.tool.ts",
		"handleCreateUsergroups",
	);
	methodLogger.debug("Creating user group...", args);

	try {
		const result = await usergroupsController.create(args);
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
 * Handle update user group
 */
async function handleUpdateUsergroups(args: UpdateUsergroupsToolArgsType) {
	const methodLogger = Logger.forContext(
		"usergroups.tool.ts",
		"handleUpdateUsergroups",
	);
	methodLogger.debug("Updating user group...", args);

	try {
		const result = await usergroupsController.update(args);
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
 * Handle delete user group
 */
async function handleDeleteUsergroups(args: DeleteUsergroupsToolArgsType) {
	const methodLogger = Logger.forContext(
		"usergroups.tool.ts",
		"handleDeleteUsergroups",
	);
	methodLogger.debug("Deleting user group...", args);

	try {
		const result = await usergroupsController.delete(args);
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
 * Handle add members to group
 */
async function handleAddMembers(args: AddMembersToolArgsType) {
	const methodLogger = Logger.forContext(
		"usergroups.tool.ts",
		"handleAddMembers",
	);
	methodLogger.debug("Adding members to user group...", args);

	try {
		const result = await usergroupsController.addMembers(args);
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
 * Handle remove members from group
 */
async function handleRemoveMembers(args: RemoveMembersToolArgsType) {
	const methodLogger = Logger.forContext(
		"usergroups.tool.ts",
		"handleRemoveMembers",
	);
	methodLogger.debug("Removing members from user group...", args);

	try {
		const result = await usergroupsController.removeMembers(args);
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
 * Handle add projects to group
 */
async function handleAddProjects(args: AddProjectsToolArgsType) {
	const methodLogger = Logger.forContext(
		"usergroups.tool.ts",
		"handleAddProjects",
	);
	methodLogger.debug("Adding projects to user group...", args);

	try {
		const result = await usergroupsController.addProjects(args);
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
 * Handle remove projects from group
 */
async function handleRemoveProjects(args: RemoveProjectsToolArgsType) {
	const methodLogger = Logger.forContext(
		"usergroups.tool.ts",
		"handleRemoveProjects",
	);
	methodLogger.debug("Removing projects from user group...", args);

	try {
		const result = await usergroupsController.removeProjects(args);
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
 * Register all user groups tools with the MCP server
 */
function registerTools(server: McpServer) {
	const methodLogger = Logger.forContext("usergroups.tool.ts", "registerTools");
	methodLogger.info("Registering user groups MCP tools");

	server.tool(
		"lokalise_list_usergroups",
		"Lists all user groups in a Lokalise team with pagination support. Required: teamId. Optional: limit (100), page. Use to audit team organization, check group structure, or prepare group management operations. Returns: User groups with names, member counts, permissions, and language assignments. Essential for understanding team hierarchy.",
		ListUsergroupsToolArgs.shape,
		handleListUsergroups,
	);

	server.tool(
		"lokalise_get_usergroup",
		"Gets detailed information about a specific user group including members, permissions, and project assignments. Required: teamId, groupId. Use to audit group configuration, verify member access, or understand permission structure. Returns: Complete group profile with admin rights, language permissions, and assigned projects/members.",
		GetUsergroupsToolArgs.shape,
		handleGetUsergroups,
	);

	server.tool(
		"lokalise_create_usergroup",
		"Creates a new user group in a Lokalise team for organized permission management. Required: teamId, name, isReviewer, isAdmin. Optional: adminRights, languages, projects, members. Use to establish role-based access control, organize team permissions, or set up project-specific groups. Returns: Created group with assigned ID and configuration.",
		CreateUsergroupsToolArgs.shape,
		handleCreateUsergroups,
	);

	server.tool(
		"lokalise_update_usergroup",
		"Updates a user group's properties including permissions and assignments. Required: teamId, groupId, name, isReviewer, isAdmin. Optional: adminRights, languages. Use to adjust group permissions, modify access levels, or reorganize team structure. Returns: Updated group configuration. Note: Cannot modify projects/members here - use dedicated tools.",
		UpdateUsergroupsToolArgs.shape,
		handleUpdateUsergroups,
	);

	server.tool(
		"lokalise_delete_usergroup",
		"Deletes a user group from a Lokalise team, removing all associated permissions. Required: teamId, groupId. Use for cleanup, removing obsolete groups, or restructuring team organization. Returns: Deletion confirmation. Warning: Removes all group assignments - members lose group-based permissions immediately.",
		DeleteUsergroupsToolArgs.shape,
		handleDeleteUsergroups,
	);

	server.tool(
		"lokalise_add_members_to_group",
		"Adds users to a user group, granting them group-based permissions and project access. Required: teamId, groupId, userIds array. Use to onboard team members, assign role-based access, or batch permission updates. Returns: Operation confirmation. Members immediately gain group permissions and project access.",
		AddMembersToolArgs.shape,
		handleAddMembers,
	);

	server.tool(
		"lokalise_remove_members_from_group",
		"Removes users from a user group, revoking group-based permissions and project access. Required: teamId, groupId, userIds array. Use for role changes, offboarding, or permission cleanup. Returns: Operation confirmation. Warning: Immediate effect - users lose group permissions and project access.",
		RemoveMembersToolArgs.shape,
		handleRemoveMembers,
	);

	server.tool(
		"lokalise_add_projects_to_group",
		"Adds projects to a user group, granting all group members access to specified projects. Required: teamId, groupId, projectIds array. Use to expand group project scope, onboard projects to existing teams, or batch project assignments. Returns: Operation confirmation. All group members gain immediate project access.",
		AddProjectsToolArgs.shape,
		handleAddProjects,
	);

	server.tool(
		"lokalise_remove_projects_from_group",
		"Removes projects from a user group, revoking group member access to specified projects. Required: teamId, groupId, projectIds array. Use to limit project scope, offboard projects, or restructure access. Returns: Operation confirmation. Warning: All group members lose immediate project access.",
		RemoveProjectsToolArgs.shape,
		handleRemoveProjects,
	);

	methodLogger.info("User groups MCP tools registered successfully");
}

// Export the domain tool implementation
const usergroupsTool: DomainTool = {
	registerTools,
	getMeta(): DomainMeta {
		return {
			name: "usergroups",
			description: "User groups management for team-based permissions",
			version: "1.0.0",
			toolsCount: 9,
		};
	},
};

export default usergroupsTool;
