import type { ControllerResponse } from "../../shared/types/common.types.js";
import { ErrorType, McpError } from "../../shared/utils/error.util.js";
import { handleControllerError } from "../../shared/utils/error-handler.util.js";
import { Logger } from "../../shared/utils/logger.util.js";
import {
	formatBulkUpdateTranslationsResult,
	formatTranslationDetails,
	formatTranslationsList,
	formatUpdateTranslationResult,
} from "./translations.formatter.js";
import { translationsService } from "./translations.service.js";
import type {
	BulkUpdateTranslationsToolArgsType,
	GetTranslationToolArgsType,
	ListTranslationsToolArgsType,
	UpdateTranslationToolArgsType,
} from "./translations.types.js";

/**
 * @namespace TranslationsController
 * @description Controller responsible for handling Lokalise Translations API operations.
 *              It orchestrates calls to the translations service, applies defaults,
 *              maps options, and formats the response using the formatter.
 */

/**
 * @function listTranslations
 * @description Fetches a list of translations from a Lokalise project using cursor pagination.
 * @memberof TranslationsController
 * @param {ListTranslationsToolArgsType} args - Arguments containing project ID, cursor, and filters
 * @returns {Promise<ControllerResponse>} A promise that resolves to the standard controller response containing the formatted translations list in Markdown.
 * @throws {McpError} Throws an McpError (handled by `handleControllerError`) if the service call fails or returns an error.
 */
async function listTranslations(
	args: ListTranslationsToolArgsType,
): Promise<ControllerResponse> {
	const methodLogger = Logger.forContext(
		"translations.controller.ts",
		"listTranslations",
	);
	methodLogger.debug("Getting Lokalise translations list...", args);

	try {
		// Validate project ID
		if (!args.projectId || typeof args.projectId !== "string") {
			throw new McpError(
				"Project ID is required and must be a string.",
				ErrorType.API_ERROR,
			);
		}

		// Validate limit parameter (translations support up to 5000)
		if (args.limit !== undefined && (args.limit < 1 || args.limit > 5000)) {
			throw new McpError(
				"Invalid limit parameter. Must be between 1 and 5000.",
				ErrorType.API_ERROR,
			);
		}

		// Validate language ID filter if provided
		if (args.filterLangId !== undefined && args.filterLangId < 1) {
			throw new McpError(
				"Invalid language ID filter. Must be a positive number.",
				ErrorType.API_ERROR,
			);
		}

		// Validate QA issues filter format
		if (args.filterQaIssues !== undefined) {
			const validQaIssues = [
				"spelling_and_grammar",
				"inconsistent_placeholders",
				"inconsistent_html",
				"whitespace_issues",
				"missing_translation",
				"unreliable_translation",
				"unbalanced_brackets",
				"double_space",
				"special_character",
				"unverified",
				"glossary_term_violation",
			];
			const issues = args.filterQaIssues.split(",").map((s) => s.trim());
			for (const issue of issues) {
				if (!validQaIssues.includes(issue)) {
					throw new McpError(
						`Invalid QA issue filter: ${issue}. Valid values are: ${validQaIssues.join(", ")}`,
						ErrorType.API_ERROR,
					);
				}
			}
		}

		// Call service layer
		const result = await translationsService.list(args);

		// Format response using the formatter
		const formattedContent = formatTranslationsList(result);

		methodLogger.debug("Translations list fetched successfully", {
			projectId: args.projectId,
			translationsCount: result.items?.length || 0,
			hasNextCursor: result.hasNextCursor(),
		});

		return {
			content: formattedContent,
		};
	} catch (error: unknown) {
		throw handleControllerError(error, {
			source: "TranslationsController.listTranslations",
			entityType: "Translations",
			entityId: args.projectId,
			operation: "listing",
		});
	}
}

/**
 * @function getTranslation
 * @description Fetches details of a specific translation.
 * @memberof TranslationsController
 * @param {GetTranslationToolArgsType} args - Arguments containing project ID and translation ID
 * @returns {Promise<ControllerResponse>} A promise that resolves to the formatted translation details.
 * @throws {McpError} Throws an McpError if the service call fails.
 */
async function getTranslation(
	args: GetTranslationToolArgsType,
): Promise<ControllerResponse> {
	const methodLogger = Logger.forContext(
		"translations.controller.ts",
		"getTranslation",
	);
	methodLogger.debug("Getting translation details...", args);

	try {
		// Validate inputs
		if (!args.projectId || typeof args.projectId !== "string") {
			throw new McpError(
				"Project ID is required and must be a string.",
				ErrorType.API_ERROR,
			);
		}

		if (!args.translationId) {
			throw new McpError("Translation ID is required.", ErrorType.API_ERROR);
		}

		// Call service layer
		const result = await translationsService.get(args);

		// Format response
		const formattedContent = formatTranslationDetails(result);

		methodLogger.debug("Translation details fetched successfully", {
			projectId: args.projectId,
			translationId: args.translationId,
		});

		return {
			content: formattedContent,
		};
	} catch (error: unknown) {
		throw handleControllerError(error, {
			source: "TranslationsController.getTranslation",
			entityType: "Translation",
			entityId: {
				project: args.projectId,
				translation: String(args.translationId),
			},
			operation: "retrieving",
		});
	}
}

/**
 * @function updateTranslation
 * @description Updates a translation in a project.
 * @memberof TranslationsController
 * @param {UpdateTranslationToolArgsType} args - Arguments containing project ID, translation ID and update data
 * @returns {Promise<ControllerResponse>} A promise that resolves to the formatted update result.
 * @throws {McpError} Throws an McpError if the service call fails.
 */
async function updateTranslation(
	args: UpdateTranslationToolArgsType,
): Promise<ControllerResponse> {
	const methodLogger = Logger.forContext(
		"translations.controller.ts",
		"updateTranslation",
	);
	methodLogger.debug("Updating translation...", args);

	try {
		// Validate inputs
		if (!args.projectId || typeof args.projectId !== "string") {
			throw new McpError(
				"Project ID is required and must be a string.",
				ErrorType.API_ERROR,
			);
		}

		if (!args.translationId) {
			throw new McpError("Translation ID is required.", ErrorType.API_ERROR);
		}

		if (!args.translationData.translation) {
			throw new McpError(
				"Translation text is required for update.",
				ErrorType.API_ERROR,
			);
		}

		// Call service layer
		const result = await translationsService.update(args);

		// Format response
		const formattedContent = formatUpdateTranslationResult(result);

		methodLogger.debug("Translation updated successfully", {
			projectId: args.projectId,
			translationId: args.translationId,
		});

		return {
			content: formattedContent,
		};
	} catch (error: unknown) {
		throw handleControllerError(error, {
			source: "TranslationsController.updateTranslation",
			entityType: "Translation",
			entityId: {
				project: args.projectId,
				translation: String(args.translationId),
			},
			operation: "updating",
		});
	}
}

/**
 * @function bulkUpdateTranslations
 * @description Updates multiple translations in bulk with rate limiting.
 * @memberof TranslationsController
 * @param {BulkUpdateTranslationsToolArgsType} args - Arguments containing project ID and array of updates
 * @returns {Promise<ControllerResponse>} A promise that resolves to the formatted bulk update result.
 * @throws {McpError} Throws an McpError if the service call fails.
 */
async function bulkUpdateTranslations(
	args: BulkUpdateTranslationsToolArgsType,
): Promise<ControllerResponse> {
	const methodLogger = Logger.forContext(
		"translations.controller.ts",
		"bulkUpdateTranslations",
	);
	methodLogger.debug("Bulk updating translations...", {
		projectId: args.projectId,
		updateCount: args.updates.length,
	});

	try {
		// Validate inputs
		if (!args.projectId || typeof args.projectId !== "string") {
			throw new McpError(
				"Project ID is required and must be a string.",
				ErrorType.API_ERROR,
			);
		}

		if (!args.updates || !Array.isArray(args.updates)) {
			throw new McpError("Updates array is required.", ErrorType.API_ERROR);
		}

		if (args.updates.length === 0) {
			throw new McpError(
				"At least one translation update is required.",
				ErrorType.API_ERROR,
			);
		}

		if (args.updates.length > 100) {
			throw new McpError(
				"Maximum 100 translations can be updated in a single bulk operation.",
				ErrorType.API_ERROR,
			);
		}

		// Validate each update
		for (const [index, update] of args.updates.entries()) {
			if (!update.translationId) {
				throw new McpError(
					`Translation ID is required for update at index ${index}.`,
					ErrorType.API_ERROR,
				);
			}

			if (!update.translationData?.translation) {
				throw new McpError(
					`Translation text is required for update at index ${index}.`,
					ErrorType.API_ERROR,
				);
			}
		}

		// Call service layer
		const result = await translationsService.bulkUpdate(args);

		// Format response
		const formattedContent = formatBulkUpdateTranslationsResult(result);

		methodLogger.debug("Bulk translations update completed", {
			projectId: args.projectId,
			totalRequested: result.totalRequested,
			successCount: result.successCount,
			failureCount: result.failureCount,
		});

		return {
			content: formattedContent,
		};
	} catch (error: unknown) {
		throw handleControllerError(error, {
			source: "TranslationsController.bulkUpdateTranslations",
			entityType: "Translations",
			entityId: args.projectId,
			operation: "bulk updating",
		});
	}
}

/**
 * Export the controller functions
 */
const translationsController = {
	listTranslations,
	getTranslation,
	updateTranslation,
	bulkUpdateTranslations,
};

export default translationsController;
