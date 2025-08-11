import type { ControllerResponse } from "../../shared/types/common.types.js";
import { ErrorType, McpError } from "../../shared/utils/error.util.js";
import { handleControllerError } from "../../shared/utils/error-handler.util.js";
import { Logger } from "../../shared/utils/logger.util.js";
import {
	formatQueuedprocessesDetails,
	formatQueuedprocessesList,
} from "./queuedprocesses.formatter.js";
import { queuedprocessesService } from "./queuedprocesses.service.js";
import type {
	GetQueuedprocessesToolArgsType,
	ListQueuedprocessesToolArgsType,
} from "./queuedprocesses.types.js";

/**
 * Controller for Queued Processes API operations
 */

/**
 * List queued processes
 */
async function listQueuedprocesses(
	args: ListQueuedprocessesToolArgsType,
): Promise<ControllerResponse> {
	const methodLogger = Logger.forContext(
		"queuedprocesses.controller.ts",
		"listQueuedprocesses",
	);
	methodLogger.debug("Getting Lokalise queued processes list...", args);

	try {
		// Validate project ID
		if (!args.projectId || typeof args.projectId !== "string") {
			throw new McpError(
				"Project ID is required and must be a string.",
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
		const result = await queuedprocessesService.list(args);

		// Format response using the formatter
		const formattedContent = formatQueuedprocessesList(result, args.projectId);

		methodLogger.debug("Queued processes list fetched successfully", {
			projectId: args.projectId,
			processCount: result.items?.length || 0,
		});

		return {
			content: formattedContent,
		};
	} catch (error: unknown) {
		throw handleControllerError(error, {
			source: "QueuedprocessesController.listQueuedprocesses",
			entityType: "QueuedProcesses",
			entityId: args.projectId,
			operation: "listing",
		});
	}
}

/**
 * Get details of a specific queued process
 */
async function getQueuedprocesses(
	args: GetQueuedprocessesToolArgsType,
): Promise<ControllerResponse> {
	const methodLogger = Logger.forContext(
		"queuedprocesses.controller.ts",
		"getQueuedprocesses",
	);
	methodLogger.debug("Getting queued process details...", args);

	try {
		// Validate inputs
		if (!args.projectId) {
			throw new McpError("Project ID is required.", ErrorType.API_ERROR);
		}

		if (!args.processId) {
			throw new McpError("Process ID is required.", ErrorType.API_ERROR);
		}

		// Call service layer
		const result = await queuedprocessesService.get(args);

		// Format response
		const formattedContent = formatQueuedprocessesDetails(result);

		methodLogger.debug("Queued process details fetched successfully", {
			projectId: args.projectId,
			processId: args.processId,
		});

		return {
			content: formattedContent,
		};
	} catch (error: unknown) {
		throw handleControllerError(error, {
			source: "QueuedprocessesController.getQueuedprocesses",
			entityType: "QueuedProcess",
			entityId: args.processId,
			operation: "retrieving",
		});
	}
}

/**
 * Controller for Lokalise Queued Processes API operations
 */
const queuedprocessesController = {
	listQueuedprocesses,
	getQueuedprocesses,
};

export default queuedprocessesController;
