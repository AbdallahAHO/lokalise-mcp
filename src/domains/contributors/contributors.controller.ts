import type { ControllerResponse } from "../../shared/types/common.types.js";
import { ErrorType, McpError } from "../../shared/utils/error.util.js";
import { handleControllerError } from "../../shared/utils/error-handler.util.js";
import { Logger } from "../../shared/utils/logger.util.js";
import {
	formatAddContributorsResult,
	formatContributorDetails,
	formatContributorsList,
	formatRemoveContributorResult,
	formatUpdateContributorResult,
} from "./contributors.formatter.js";
import { contributorsService } from "./contributors.service.js";
import type {
	AddContributorsToolArgsType,
	GetContributorToolArgsType,
	GetCurrentUserToolArgsType,
	ListContributorsToolArgsType,
	RemoveContributorToolArgsType,
	UpdateContributorToolArgsType,
} from "./contributors.types.js";

/**
 * @namespace ContributorsController
 * @description Controller responsible for handling Lokalise Contributors API operations.
 *              It orchestrates calls to the contributors service, applies defaults,
 *              maps options, and formats the response using the formatter.
 */

/**
 * @function listContributors
 * @description Fetches a list of contributors from a Lokalise project.
 * @memberof ContributorsController
 * @param {ListContributorsToolArgsType} args - Arguments containing project ID and pagination options
 * @returns {Promise<ControllerResponse>} A promise that resolves to the standard controller response containing the formatted contributors list in Markdown.
 * @throws {McpError} Throws an McpError (handled by `handleControllerError`) if the service call fails or returns an error.
 */
async function listContributors(
	args: ListContributorsToolArgsType,
): Promise<ControllerResponse> {
	const methodLogger = Logger.forContext(
		"contributors.controller.ts",
		"listContributors",
	);
	methodLogger.debug("Getting Lokalise contributors list...", args);

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
		const result = await contributorsService.list(args);

		// Format response using the formatter
		const formattedContent = formatContributorsList(result);

		methodLogger.debug("Contributors list fetched successfully", {
			projectId: args.projectId,
			contributorsCount: result.items?.length || 0,
		});

		return {
			content: formattedContent,
		};
	} catch (error: unknown) {
		throw handleControllerError(error, {
			source: "ContributorsController.listContributors",
			entityType: "Contributors",
			entityId: args.projectId,
			operation: "listing",
		});
	}
}

/**
 * @function getContributor
 * @description Fetches details of a specific contributor.
 * @memberof ContributorsController
 * @param {GetContributorToolArgsType} args - Arguments containing project ID and contributor ID
 * @returns {Promise<ControllerResponse>} A promise that resolves to the formatted contributor details.
 * @throws {McpError} Throws an McpError if the service call fails.
 */
async function getContributor(
	args: GetContributorToolArgsType,
): Promise<ControllerResponse> {
	const methodLogger = Logger.forContext(
		"contributors.controller.ts",
		"getContributor",
	);
	methodLogger.debug("Getting contributor details...", args);

	try {
		// Validate inputs
		if (!args.projectId || typeof args.projectId !== "string") {
			throw new McpError(
				"Project ID is required and must be a string.",
				ErrorType.API_ERROR,
			);
		}

		if (!args.contributorId) {
			throw new McpError("Contributor ID is required.", ErrorType.API_ERROR);
		}

		// Call service layer
		const result = await contributorsService.get(args);

		// Format response
		const formattedContent = formatContributorDetails(result);

		methodLogger.debug("Contributor details fetched successfully", {
			projectId: args.projectId,
			contributorId: args.contributorId,
		});

		return {
			content: formattedContent,
		};
	} catch (error: unknown) {
		throw handleControllerError(error, {
			source: "ContributorsController.getContributor",
			entityType: "Contributor",
			entityId: {
				project: args.projectId,
				contributor: String(args.contributorId),
			},
			operation: "retrieving",
		});
	}
}

/**
 * @function addContributors
 * @description Adds one or more contributors to a project.
 * @memberof ContributorsController
 * @param {AddContributorsToolArgsType} args - Arguments containing project ID and contributor data
 * @returns {Promise<ControllerResponse>} A promise that resolves to the formatted result.
 * @throws {McpError} Throws an McpError if the service call fails.
 */
async function addContributors(
	args: AddContributorsToolArgsType,
): Promise<ControllerResponse> {
	const methodLogger = Logger.forContext(
		"contributors.controller.ts",
		"addContributors",
	);
	methodLogger.debug("Adding contributors...", args);

	try {
		// Validate inputs
		if (!args.projectId || typeof args.projectId !== "string") {
			throw new McpError(
				"Project ID is required and must be a string.",
				ErrorType.API_ERROR,
			);
		}

		if (!args.contributors || args.contributors.length === 0) {
			throw new McpError(
				"At least one contributor is required.",
				ErrorType.API_ERROR,
			);
		}

		// Call service layer
		const result = await contributorsService.create(args);

		// Format response
		const formattedContent = formatAddContributorsResult(result);

		methodLogger.debug("Contributors added successfully", {
			projectId: args.projectId,
			addedCount: result.length,
		});

		return {
			content: formattedContent,
		};
	} catch (error: unknown) {
		throw handleControllerError(error, {
			source: "ContributorsController.addContributors",
			entityType: "Contributors",
			entityId: args.projectId,
			operation: "adding",
		});
	}
}

/**
 * @function getCurrentUser
 * @description Gets the current user's contributor profile for a project.
 * @memberof ContributorsController
 * @param {GetCurrentUserToolArgsType} args - Arguments containing project ID
 * @returns {Promise<ControllerResponse>} A promise that resolves to the formatted current user details.
 * @throws {McpError} Throws an McpError if the service call fails.
 */
async function getCurrentUser(
	args: GetCurrentUserToolArgsType,
): Promise<ControllerResponse> {
	const methodLogger = Logger.forContext(
		"contributors.controller.ts",
		"getCurrentUser",
	);
	methodLogger.debug("Getting current user contributor profile...", args);

	try {
		// Validate inputs
		if (!args.projectId || typeof args.projectId !== "string") {
			throw new McpError(
				"Project ID is required and must be a string.",
				ErrorType.API_ERROR,
			);
		}

		// Call service layer
		const result = await contributorsService.me(args);

		// Format response
		const formattedContent = formatContributorDetails(result);

		methodLogger.debug("Current user profile fetched successfully", {
			projectId: args.projectId,
			userId: result.user_id,
		});

		return {
			content: formattedContent,
		};
	} catch (error: unknown) {
		throw handleControllerError(error, {
			source: "ContributorsController.getCurrentUser",
			entityType: "Current User",
			entityId: args.projectId,
			operation: "retrieving",
		});
	}
}

/**
 * @function updateContributor
 * @description Updates a contributor's permissions in a project.
 * @memberof ContributorsController
 * @param {UpdateContributorToolArgsType} args - Arguments containing project ID, contributor ID and update data
 * @returns {Promise<ControllerResponse>} A promise that resolves to the formatted update result.
 * @throws {McpError} Throws an McpError if the service call fails.
 */
async function updateContributor(
	args: UpdateContributorToolArgsType,
): Promise<ControllerResponse> {
	const methodLogger = Logger.forContext(
		"contributors.controller.ts",
		"updateContributor",
	);
	methodLogger.debug("Updating contributor...", args);

	try {
		// Validate inputs
		if (!args.projectId || typeof args.projectId !== "string") {
			throw new McpError(
				"Project ID is required and must be a string.",
				ErrorType.API_ERROR,
			);
		}

		if (!args.contributorId) {
			throw new McpError("Contributor ID is required.", ErrorType.API_ERROR);
		}

		// Call service layer
		const result = await contributorsService.update(args);

		// Format response
		const formattedContent = formatUpdateContributorResult(result);

		methodLogger.debug("Contributor updated successfully", {
			projectId: args.projectId,
			contributorId: args.contributorId,
		});

		return {
			content: formattedContent,
		};
	} catch (error: unknown) {
		throw handleControllerError(error, {
			source: "ContributorsController.updateContributor",
			entityType: "Contributor",
			entityId: {
				project: args.projectId,
				contributor: String(args.contributorId),
			},
			operation: "updating",
		});
	}
}

/**
 * @function removeContributor
 * @description Removes a contributor from a project.
 * @memberof ContributorsController
 * @param {RemoveContributorToolArgsType} args - Arguments containing project ID and contributor ID
 * @returns {Promise<ControllerResponse>} A promise that resolves to the formatted deletion result.
 * @throws {McpError} Throws an McpError if the service call fails.
 */
async function removeContributor(
	args: RemoveContributorToolArgsType,
): Promise<ControllerResponse> {
	const methodLogger = Logger.forContext(
		"contributors.controller.ts",
		"removeContributor",
	);
	methodLogger.debug("Removing contributor...", args);

	try {
		// Validate inputs
		if (!args.projectId || typeof args.projectId !== "string") {
			throw new McpError(
				"Project ID is required and must be a string.",
				ErrorType.API_ERROR,
			);
		}

		if (!args.contributorId) {
			throw new McpError("Contributor ID is required.", ErrorType.API_ERROR);
		}

		// Call service layer
		const result = await contributorsService.delete(args);

		// Format response
		const formattedContent = formatRemoveContributorResult(result);

		methodLogger.debug("Contributor removed successfully", {
			projectId: args.projectId,
			contributorId: args.contributorId,
		});

		return {
			content: formattedContent,
		};
	} catch (error: unknown) {
		throw handleControllerError(error, {
			source: "ContributorsController.removeContributor",
			entityType: "Contributor",
			entityId: {
				project: args.projectId,
				contributor: String(args.contributorId),
			},
			operation: "removing",
		});
	}
}

/**
 * Export the controller functions
 */
const contributorsController = {
	listContributors,
	getContributor,
	addContributors,
	getCurrentUser,
	updateContributor,
	removeContributor,
};

export default contributorsController;
