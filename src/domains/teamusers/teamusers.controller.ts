import type { ControllerResponse } from "../../shared/types/common.types.js";
import { ErrorType, McpError } from "../../shared/utils/error.util.js";
import { handleControllerError } from "../../shared/utils/error-handler.util.js";
import { Logger } from "../../shared/utils/logger.util.js";
import {
	formatDeleteTeamusersResult,
	formatTeamusersDetails,
	formatTeamusersList,
	formatUpdateTeamusersResult,
} from "./teamusers.formatter.js";
import { teamusersService } from "./teamusers.service.js";
import type {
	DeleteTeamusersToolArgsType,
	GetTeamusersToolArgsType,
	ListTeamusersToolArgsType,
	UpdateTeamusersToolArgsType,
} from "./teamusers.types.js";

/**
 * Controller for Team Users API operations
 */

/**
 * List team users
 */
async function listTeamusers(
	args: ListTeamusersToolArgsType,
): Promise<ControllerResponse> {
	const methodLogger = Logger.forContext(
		"teamusers.controller.ts",
		"listTeamusers",
	);
	methodLogger.debug("Getting Lokalise team users list...", args);

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
		const result = await teamusersService.list(args);

		// Format response using the formatter
		const formattedContent = formatTeamusersList(result, args.teamId);

		methodLogger.debug("Team users list fetched successfully", {
			teamId: args.teamId,
			userCount: result.items?.length || 0,
		});

		return {
			content: formattedContent,
		};
	} catch (error: unknown) {
		throw handleControllerError(error, {
			source: "TeamusersController.listTeamusers",
			entityType: "TeamUsers",
			entityId: args.teamId,
			operation: "listing",
		});
	}
}

/**
 * Get details of a specific team user
 */
async function getTeamusers(
	args: GetTeamusersToolArgsType,
): Promise<ControllerResponse> {
	const methodLogger = Logger.forContext(
		"teamusers.controller.ts",
		"getTeamusers",
	);
	methodLogger.debug("Getting team user details...", args);

	try {
		// Validate inputs
		if (!args.teamId) {
			throw new McpError("Team ID is required.", ErrorType.API_ERROR);
		}

		if (!args.userId) {
			throw new McpError("User ID is required.", ErrorType.API_ERROR);
		}

		// Call service layer
		const result = await teamusersService.get(args);

		// Format response
		const formattedContent = formatTeamusersDetails(result);

		methodLogger.debug("Team user details fetched successfully", {
			teamId: args.teamId,
			userId: args.userId,
		});

		return {
			content: formattedContent,
		};
	} catch (error: unknown) {
		throw handleControllerError(error, {
			source: "TeamusersController.getTeamusers",
			entityType: "TeamUser",
			entityId: String(args.userId),
			operation: "retrieving",
		});
	}
}

/**
 * Update a team user's role
 */
async function updateTeamusers(
	args: UpdateTeamusersToolArgsType,
): Promise<ControllerResponse> {
	const methodLogger = Logger.forContext(
		"teamusers.controller.ts",
		"updateTeamusers",
	);
	methodLogger.debug("Updating team user...", args);

	try {
		// Validate inputs
		if (!args.teamId) {
			throw new McpError("Team ID is required.", ErrorType.API_ERROR);
		}

		if (!args.userId) {
			throw new McpError("User ID is required.", ErrorType.API_ERROR);
		}

		if (!args.role) {
			throw new McpError("Role is required.", ErrorType.API_ERROR);
		}

		// Call service layer
		const result = await teamusersService.update(args);

		// Format response
		const formattedContent = formatUpdateTeamusersResult(result);

		methodLogger.debug("Team user updated successfully", {
			teamId: args.teamId,
			userId: args.userId,
			newRole: args.role,
		});

		return {
			content: formattedContent,
		};
	} catch (error: unknown) {
		throw handleControllerError(error, {
			source: "TeamusersController.updateTeamusers",
			entityType: "TeamUser",
			entityId: String(args.userId),
			operation: "updating",
		});
	}
}

/**
 * Delete a team user
 */
async function deleteTeamusers(
	args: DeleteTeamusersToolArgsType,
): Promise<ControllerResponse> {
	const methodLogger = Logger.forContext(
		"teamusers.controller.ts",
		"deleteTeamusers",
	);
	methodLogger.debug("Deleting team user...", args);

	try {
		// Validate inputs
		if (!args.teamId) {
			throw new McpError("Team ID is required.", ErrorType.API_ERROR);
		}

		if (!args.userId) {
			throw new McpError("User ID is required.", ErrorType.API_ERROR);
		}

		// Call service layer
		const result = await teamusersService.delete(args);

		// Format response
		const formattedContent = formatDeleteTeamusersResult(result);

		methodLogger.debug("Team user deleted successfully", {
			teamId: args.teamId,
			userId: args.userId,
		});

		return {
			content: formattedContent,
		};
	} catch (error: unknown) {
		throw handleControllerError(error, {
			source: "TeamusersController.deleteTeamusers",
			entityType: "TeamUser",
			entityId: String(args.userId),
			operation: "deleting",
		});
	}
}

/**
 * Controller for Lokalise Team Users API operations
 */
const teamusersController = {
	listTeamusers,
	getTeamusers,
	updateTeamusers,
	deleteTeamusers,
};

export default teamusersController;
