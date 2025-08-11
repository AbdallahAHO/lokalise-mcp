import type { ControllerResponse } from "../../shared/types/common.types.js";
import { ErrorType, McpError } from "../../shared/utils/error.util.js";
import { handleControllerError } from "../../shared/utils/error-handler.util.js";
import { Logger } from "../../shared/utils/logger.util.js";
import {
	formatAddMembersResult,
	formatAddProjectsResult,
	formatCreateUsergroupsResult,
	formatDeleteUsergroupsResult,
	formatRemoveMembersResult,
	formatRemoveProjectsResult,
	formatUpdateUsergroupsResult,
	formatUsergroupsDetails,
	formatUsergroupsList,
} from "./usergroups.formatter.js";
import { usergroupsService } from "./usergroups.service.js";
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

/**
 * @namespace UsergroupsController
 * @description Controller responsible for handling Lokalise User Groups API operations.
 */

/**
 * List user groups for a team
 */
async function listUsergroups(
	args: ListUsergroupsToolArgsType,
): Promise<ControllerResponse> {
	const methodLogger = Logger.forContext(
		"usergroups.controller.ts",
		"listUsergroups",
	);
	methodLogger.debug("Getting Lokalise user groups list...", args);

	try {
		// Validate team ID
		if (!args.teamId || typeof args.teamId !== "string") {
			throw new McpError(
				"Team ID is required and must be a string.",
				ErrorType.API_ERROR,
			);
		}

		// Validate pagination parameters
		if (args.limit !== undefined && (args.limit < 1 || args.limit > 100)) {
			throw new McpError(
				"Invalid limit parameter. Must be between 1 and 100.",
				ErrorType.API_ERROR,
			);
		}

		if (args.page !== undefined && args.page < 1) {
			throw new McpError(
				"Invalid page parameter. Must be 1 or greater.",
				ErrorType.API_ERROR,
			);
		}

		// Call service layer
		const result = await usergroupsService.list(args);

		// Format response using the formatter
		const formattedContent = formatUsergroupsList(result, args.teamId);

		methodLogger.debug("User groups list fetched successfully", {
			teamId: args.teamId,
			groupCount: result.items?.length || 0,
		});

		return {
			content: formattedContent,
		};
	} catch (error: unknown) {
		throw handleControllerError(error, {
			source: "UsergroupsController.listUsergroups",
			entityType: "UserGroups",
			entityId: args.teamId,
			operation: "listing",
		});
	}
}

/**
 * Get details of a specific user group
 */
async function getUsergroups(
	args: GetUsergroupsToolArgsType,
): Promise<ControllerResponse> {
	const methodLogger = Logger.forContext(
		"usergroups.controller.ts",
		"getUsergroups",
	);
	methodLogger.debug("Getting user group details...", args);

	try {
		// Validate inputs
		if (!args.teamId) {
			throw new McpError("Team ID is required.", ErrorType.API_ERROR);
		}

		if (!args.groupId) {
			throw new McpError("Group ID is required.", ErrorType.API_ERROR);
		}

		// Call service layer
		const result = await usergroupsService.get(args);

		// Format response
		const formattedContent = formatUsergroupsDetails(result);

		methodLogger.debug("User group details fetched successfully", {
			teamId: args.teamId,
			groupId: args.groupId,
		});

		return {
			content: formattedContent,
		};
	} catch (error: unknown) {
		throw handleControllerError(error, {
			source: "UsergroupsController.getUsergroups",
			entityType: "UserGroup",
			entityId: String(args.groupId),
			operation: "retrieving",
		});
	}
}

/**
 * Create a new user group
 */
async function createUsergroups(
	args: CreateUsergroupsToolArgsType,
): Promise<ControllerResponse> {
	const methodLogger = Logger.forContext(
		"usergroups.controller.ts",
		"createUsergroups",
	);
	methodLogger.debug("Creating user group...", args);

	try {
		// Validate inputs
		if (!args.teamId) {
			throw new McpError("Team ID is required.", ErrorType.API_ERROR);
		}

		if (!args.name || args.name.trim().length === 0) {
			throw new McpError("Group name is required.", ErrorType.API_ERROR);
		}

		// Call service layer
		const result = await usergroupsService.create(args);

		// Format response
		const formattedContent = formatCreateUsergroupsResult(result);

		methodLogger.debug("User group created successfully", {
			teamId: args.teamId,
			groupId: result.group_id,
		});

		return {
			content: formattedContent,
		};
	} catch (error: unknown) {
		throw handleControllerError(error, {
			source: "UsergroupsController.createUsergroups",
			entityType: "UserGroup",
			entityId: args.teamId,
			operation: "creating",
		});
	}
}

/**
 * Update a user group
 */
async function updateUsergroups(
	args: UpdateUsergroupsToolArgsType,
): Promise<ControllerResponse> {
	const methodLogger = Logger.forContext(
		"usergroups.controller.ts",
		"updateUsergroups",
	);
	methodLogger.debug("Updating user group...", args);

	try {
		// Validate inputs
		if (!args.teamId) {
			throw new McpError("Team ID is required.", ErrorType.API_ERROR);
		}

		if (!args.groupId) {
			throw new McpError("Group ID is required.", ErrorType.API_ERROR);
		}

		if (!args.name || args.name.trim().length === 0) {
			throw new McpError("Group name is required.", ErrorType.API_ERROR);
		}

		// Call service layer
		const result = await usergroupsService.update(args);

		// Format response
		const formattedContent = formatUpdateUsergroupsResult(result);

		methodLogger.debug("User group updated successfully", {
			teamId: args.teamId,
			groupId: args.groupId,
		});

		return {
			content: formattedContent,
		};
	} catch (error: unknown) {
		throw handleControllerError(error, {
			source: "UsergroupsController.updateUsergroups",
			entityType: "UserGroup",
			entityId: String(args.groupId),
			operation: "updating",
		});
	}
}

/**
 * Delete a user group
 */
async function deleteUsergroups(
	args: DeleteUsergroupsToolArgsType,
): Promise<ControllerResponse> {
	const methodLogger = Logger.forContext(
		"usergroups.controller.ts",
		"deleteUsergroups",
	);
	methodLogger.debug("Deleting user group...", args);

	try {
		// Validate inputs
		if (!args.teamId) {
			throw new McpError("Team ID is required.", ErrorType.API_ERROR);
		}

		if (!args.groupId) {
			throw new McpError("Group ID is required.", ErrorType.API_ERROR);
		}

		// Call service layer
		const result = await usergroupsService.delete(args);

		// Format response
		const formattedContent = formatDeleteUsergroupsResult(result);

		methodLogger.debug("User group deleted successfully", {
			teamId: args.teamId,
			groupId: args.groupId,
		});

		return {
			content: formattedContent,
		};
	} catch (error: unknown) {
		throw handleControllerError(error, {
			source: "UsergroupsController.deleteUsergroups",
			entityType: "UserGroup",
			entityId: String(args.groupId),
			operation: "deleting",
		});
	}
}

/**
 * Add members to a user group
 */
async function addMembers(
	args: AddMembersToolArgsType,
): Promise<ControllerResponse> {
	const methodLogger = Logger.forContext(
		"usergroups.controller.ts",
		"addMembers",
	);
	methodLogger.debug("Adding members to user group...", args);

	try {
		// Validate inputs
		if (!args.teamId) {
			throw new McpError("Team ID is required.", ErrorType.API_ERROR);
		}

		if (!args.groupId) {
			throw new McpError("Group ID is required.", ErrorType.API_ERROR);
		}

		if (!args.userIds || args.userIds.length === 0) {
			throw new McpError(
				"At least one user ID is required.",
				ErrorType.API_ERROR,
			);
		}

		// Call service layer
		const result = await usergroupsService.addMembers(args);

		// Format response
		const formattedContent = formatAddMembersResult(
			result,
			args.userIds.length,
		);

		methodLogger.debug("Members added successfully", {
			teamId: args.teamId,
			groupId: args.groupId,
			userCount: args.userIds.length,
		});

		return {
			content: formattedContent,
		};
	} catch (error: unknown) {
		throw handleControllerError(error, {
			source: "UsergroupsController.addMembers",
			entityType: "UserGroup",
			entityId: String(args.groupId),
			operation: "adding members",
		});
	}
}

/**
 * Remove members from a user group
 */
async function removeMembers(
	args: RemoveMembersToolArgsType,
): Promise<ControllerResponse> {
	const methodLogger = Logger.forContext(
		"usergroups.controller.ts",
		"removeMembers",
	);
	methodLogger.debug("Removing members from user group...", args);

	try {
		// Validate inputs
		if (!args.teamId) {
			throw new McpError("Team ID is required.", ErrorType.API_ERROR);
		}

		if (!args.groupId) {
			throw new McpError("Group ID is required.", ErrorType.API_ERROR);
		}

		if (!args.userIds || args.userIds.length === 0) {
			throw new McpError(
				"At least one user ID is required.",
				ErrorType.API_ERROR,
			);
		}

		// Call service layer
		const result = await usergroupsService.removeMembers(args);

		// Format response
		const formattedContent = formatRemoveMembersResult(
			result,
			args.userIds.length,
		);

		methodLogger.debug("Members removed successfully", {
			teamId: args.teamId,
			groupId: args.groupId,
			userCount: args.userIds.length,
		});

		return {
			content: formattedContent,
		};
	} catch (error: unknown) {
		throw handleControllerError(error, {
			source: "UsergroupsController.removeMembers",
			entityType: "UserGroup",
			entityId: String(args.groupId),
			operation: "removing members",
		});
	}
}

/**
 * Add projects to a user group
 */
async function addProjects(
	args: AddProjectsToolArgsType,
): Promise<ControllerResponse> {
	const methodLogger = Logger.forContext(
		"usergroups.controller.ts",
		"addProjects",
	);
	methodLogger.debug("Adding projects to user group...", args);

	try {
		// Validate inputs
		if (!args.teamId) {
			throw new McpError("Team ID is required.", ErrorType.API_ERROR);
		}

		if (!args.groupId) {
			throw new McpError("Group ID is required.", ErrorType.API_ERROR);
		}

		if (!args.projectIds || args.projectIds.length === 0) {
			throw new McpError(
				"At least one project ID is required.",
				ErrorType.API_ERROR,
			);
		}

		// Call service layer
		const result = await usergroupsService.addProjects(args);

		// Format response
		const formattedContent = formatAddProjectsResult(
			result,
			args.projectIds.length,
		);

		methodLogger.debug("Projects added successfully", {
			teamId: args.teamId,
			groupId: args.groupId,
			projectCount: args.projectIds.length,
		});

		return {
			content: formattedContent,
		};
	} catch (error: unknown) {
		throw handleControllerError(error, {
			source: "UsergroupsController.addProjects",
			entityType: "UserGroup",
			entityId: String(args.groupId),
			operation: "adding projects",
		});
	}
}

/**
 * Remove projects from a user group
 */
async function removeProjects(
	args: RemoveProjectsToolArgsType,
): Promise<ControllerResponse> {
	const methodLogger = Logger.forContext(
		"usergroups.controller.ts",
		"removeProjects",
	);
	methodLogger.debug("Removing projects from user group...", args);

	try {
		// Validate inputs
		if (!args.teamId) {
			throw new McpError("Team ID is required.", ErrorType.API_ERROR);
		}

		if (!args.groupId) {
			throw new McpError("Group ID is required.", ErrorType.API_ERROR);
		}

		if (!args.projectIds || args.projectIds.length === 0) {
			throw new McpError(
				"At least one project ID is required.",
				ErrorType.API_ERROR,
			);
		}

		// Call service layer
		const result = await usergroupsService.removeProjects(args);

		// Format response
		const formattedContent = formatRemoveProjectsResult(
			result,
			args.projectIds.length,
		);

		methodLogger.debug("Projects removed successfully", {
			teamId: args.teamId,
			groupId: args.groupId,
			projectCount: args.projectIds.length,
		});

		return {
			content: formattedContent,
		};
	} catch (error: unknown) {
		throw handleControllerError(error, {
			source: "UsergroupsController.removeProjects",
			entityType: "UserGroup",
			entityId: String(args.groupId),
			operation: "removing projects",
		});
	}
}

/**
 * Controller for Lokalise User Groups API operations
 */
const usergroupsController = {
	list: listUsergroups,
	get: getUsergroups,
	create: createUsergroups,
	update: updateUsergroups,
	delete: deleteUsergroups,
	addMembers,
	removeMembers,
	addProjects,
	removeProjects,
};

export default usergroupsController;
