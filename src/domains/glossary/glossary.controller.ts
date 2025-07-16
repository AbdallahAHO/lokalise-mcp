import type { ControllerResponse } from "../../shared/types/common.types.js";
import { ErrorType, McpError } from "../../shared/utils/error.util.js";
import { handleControllerError } from "../../shared/utils/error-handler.util.js";
import { Logger } from "../../shared/utils/logger.util.js";
import {
	formatCreateGlossaryTermsResult,
	formatDeleteGlossaryTermsResult,
	formatGlossaryTermDetails,
	formatGlossaryTermsList,
	formatUpdateGlossaryTermsResult,
} from "./glossary.formatter.js";
import { glossaryService } from "./glossary.service.js";
import type {
	CreateGlossaryToolArgsType,
	DeleteGlossaryToolArgsType,
	GetGlossaryToolArgsType,
	ListGlossaryToolArgsType,
	UpdateGlossaryToolArgsType,
} from "./glossary.types.js";

/**
 * @namespace GlossaryController
 * @description Controller responsible for handling Lokalise Glossary Terms API operations.
 *              It orchestrates calls to the glossary service, manages cursor pagination,
 *              handles bulk operations, and formats the response using the formatter.
 */

/**
 * @function listGlossaryTerms
 * @description Fetches a list of glossary terms from a Lokalise project using cursor pagination.
 * @memberof GlossaryController
 * @param {ListGlossaryToolArgsType} args - Arguments containing project ID and pagination options
 * @returns {Promise<ControllerResponse>} A promise that resolves to the formatted glossary terms list.
 * @throws {McpError} Throws an McpError if validation fails or service call fails.
 */
async function listGlossaryTerms(
	args: ListGlossaryToolArgsType,
): Promise<ControllerResponse> {
	const methodLogger = Logger.forContext(
		"glossary.controller.ts",
		"listGlossaryTerms",
	);
	methodLogger.debug("Getting Lokalise glossary terms list...", args);

	try {
		// Validate project ID
		if (!args.projectId || typeof args.projectId !== "string") {
			throw new McpError(
				"Project ID is required and must be a string.",
				ErrorType.API_ERROR,
			);
		}

		// Validate limit parameter
		if (args.limit !== undefined && (args.limit < 1 || args.limit > 5000)) {
			throw new McpError(
				"Invalid limit parameter. Must be between 1 and 5000.",
				ErrorType.API_ERROR,
			);
		}

		// Call service layer
		const result = await glossaryService.list(args);

		// Format response using the formatter
		const formattedContent = formatGlossaryTermsList(result);

		methodLogger.debug("Glossary terms list fetched successfully", {
			projectId: args.projectId,
			termsCount: result.items?.length || 0,
			hasNext: result.hasNextCursor(),
		});

		return {
			content: formattedContent,
		};
	} catch (error: unknown) {
		throw handleControllerError(error, {
			source: "GlossaryController.listGlossaryTerms",
			entityType: "GlossaryTerms",
			entityId: args.projectId,
			operation: "listing",
		});
	}
}

/**
 * @function getGlossaryTerm
 * @description Fetches details of a specific glossary term.
 * @memberof GlossaryController
 * @param {GetGlossaryToolArgsType} args - Arguments containing project ID and term ID
 * @returns {Promise<ControllerResponse>} A promise that resolves to the formatted term details.
 * @throws {McpError} Throws an McpError if validation fails or service call fails.
 */
async function getGlossaryTerm(
	args: GetGlossaryToolArgsType,
): Promise<ControllerResponse> {
	const methodLogger = Logger.forContext(
		"glossary.controller.ts",
		"getGlossaryTerm",
	);
	methodLogger.debug("Getting glossary term details...", args);

	try {
		// Validate inputs
		if (!args.projectId || typeof args.projectId !== "string") {
			throw new McpError(
				"Project ID is required and must be a string.",
				ErrorType.API_ERROR,
			);
		}

		if (!args.termId || typeof args.termId !== "number") {
			throw new McpError(
				"Term ID is required and must be a number.",
				ErrorType.API_ERROR,
			);
		}

		// Call service layer
		const result = await glossaryService.get(args);

		// Format response
		const formattedContent = formatGlossaryTermDetails(result);

		methodLogger.debug("Glossary term details fetched successfully", {
			projectId: args.projectId,
			termId: args.termId,
			term: result.term,
		});

		return {
			content: formattedContent,
		};
	} catch (error: unknown) {
		throw handleControllerError(error, {
			source: "GlossaryController.getGlossaryTerm",
			entityType: "GlossaryTerm",
			entityId: { project: args.projectId, term: String(args.termId) },
			operation: "retrieving",
		});
	}
}

/**
 * @function createGlossaryTerms
 * @description Creates one or more glossary terms in a project (bulk operation).
 * @memberof GlossaryController
 * @param {CreateGlossaryToolArgsType} args - Arguments containing project ID and terms data
 * @returns {Promise<ControllerResponse>} A promise that resolves to the formatted result.
 * @throws {McpError} Throws an McpError if validation fails or service call fails.
 */
async function createGlossaryTerms(
	args: CreateGlossaryToolArgsType,
): Promise<ControllerResponse> {
	const methodLogger = Logger.forContext(
		"glossary.controller.ts",
		"createGlossaryTerms",
	);
	methodLogger.debug("Creating glossary terms...", {
		projectId: args.projectId,
		termsCount: args.terms.length,
	});

	try {
		// Validate inputs
		if (!args.projectId || typeof args.projectId !== "string") {
			throw new McpError(
				"Project ID is required and must be a string.",
				ErrorType.API_ERROR,
			);
		}

		if (!args.terms || args.terms.length === 0) {
			throw new McpError(
				"At least one glossary term is required.",
				ErrorType.API_ERROR,
			);
		}

		// Validate each term
		for (const term of args.terms) {
			if (!term.term || !term.description) {
				throw new McpError(
					"Each term must have both 'term' and 'description' fields.",
					ErrorType.API_ERROR,
				);
			}
		}

		// Call service layer
		const result = await glossaryService.create(args);

		// Format response
		const formattedContent = formatCreateGlossaryTermsResult(result);

		methodLogger.debug("Glossary terms created successfully", {
			projectId: args.projectId,
			createdCount: result.items.length,
			errorCount: result.errors?.length || 0,
		});

		return {
			content: formattedContent,
		};
	} catch (error: unknown) {
		throw handleControllerError(error, {
			source: "GlossaryController.createGlossaryTerms",
			entityType: "GlossaryTerms",
			entityId: args.projectId,
			operation: "creating",
		});
	}
}

/**
 * @function updateGlossaryTerms
 * @description Updates one or more glossary terms in a project (bulk operation).
 * @memberof GlossaryController
 * @param {UpdateGlossaryToolArgsType} args - Arguments containing project ID and terms to update
 * @returns {Promise<ControllerResponse>} A promise that resolves to the formatted update result.
 * @throws {McpError} Throws an McpError if validation fails or service call fails.
 */
async function updateGlossaryTerms(
	args: UpdateGlossaryToolArgsType,
): Promise<ControllerResponse> {
	const methodLogger = Logger.forContext(
		"glossary.controller.ts",
		"updateGlossaryTerms",
	);
	methodLogger.debug("Updating glossary terms...", {
		projectId: args.projectId,
		termsCount: args.terms.length,
	});

	try {
		// Validate inputs
		if (!args.projectId || typeof args.projectId !== "string") {
			throw new McpError(
				"Project ID is required and must be a string.",
				ErrorType.API_ERROR,
			);
		}

		if (!args.terms || args.terms.length === 0) {
			throw new McpError(
				"At least one term update is required.",
				ErrorType.API_ERROR,
			);
		}

		// Validate each term has an ID
		for (const term of args.terms) {
			if (!term.id || typeof term.id !== "number") {
				throw new McpError(
					"Each term update must include a valid term ID.",
					ErrorType.API_ERROR,
				);
			}
		}

		// Call service layer
		const result = await glossaryService.update(args);

		// Format response
		const formattedContent = formatUpdateGlossaryTermsResult(result);

		methodLogger.debug("Glossary terms updated successfully", {
			projectId: args.projectId,
			updatedCount: result.items.length,
			errorCount: result.errors?.length || 0,
		});

		return {
			content: formattedContent,
		};
	} catch (error: unknown) {
		throw handleControllerError(error, {
			source: "GlossaryController.updateGlossaryTerms",
			entityType: "GlossaryTerms",
			entityId: args.projectId,
			operation: "updating",
		});
	}
}

/**
 * @function deleteGlossaryTerms
 * @description Deletes one or more glossary terms from a project (bulk operation).
 * @memberof GlossaryController
 * @param {DeleteGlossaryToolArgsType} args - Arguments containing project ID and term IDs
 * @returns {Promise<ControllerResponse>} A promise that resolves to the formatted deletion result.
 * @throws {McpError} Throws an McpError if validation fails or service call fails.
 */
async function deleteGlossaryTerms(
	args: DeleteGlossaryToolArgsType,
): Promise<ControllerResponse> {
	const methodLogger = Logger.forContext(
		"glossary.controller.ts",
		"deleteGlossaryTerms",
	);
	methodLogger.debug("Deleting glossary terms...", {
		projectId: args.projectId,
		termIds: args.termIds,
	});

	try {
		// Validate inputs
		if (!args.projectId || typeof args.projectId !== "string") {
			throw new McpError(
				"Project ID is required and must be a string.",
				ErrorType.API_ERROR,
			);
		}

		if (!args.termIds || args.termIds.length === 0) {
			throw new McpError(
				"At least one term ID is required for deletion.",
				ErrorType.API_ERROR,
			);
		}

		// Validate all term IDs are numbers
		for (const termId of args.termIds) {
			if (typeof termId !== "number") {
				throw new McpError(
					"All term IDs must be numbers.",
					ErrorType.API_ERROR,
				);
			}
		}

		// Call service layer
		const result = await glossaryService.delete(args);

		// Format response
		const formattedContent = formatDeleteGlossaryTermsResult(result);

		methodLogger.debug("Glossary terms deleted", {
			projectId: args.projectId,
			deletedCount: result.deleted.count,
			failedCount: result.failed?.length || 0,
		});

		return {
			content: formattedContent,
		};
	} catch (error: unknown) {
		throw handleControllerError(error, {
			source: "GlossaryController.deleteGlossaryTerms",
			entityType: "GlossaryTerms",
			entityId: args.projectId,
			operation: "deleting",
		});
	}
}

/**
 * Export the controller functions
 */
const glossaryController = {
	listGlossaryTerms,
	getGlossaryTerm,
	createGlossaryTerms,
	updateGlossaryTerms,
	deleteGlossaryTerms,
};

export default glossaryController;
