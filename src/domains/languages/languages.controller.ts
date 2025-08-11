import type {
	CreateLanguageParams,
	UpdateLanguageParams,
} from "@lokalise/node-api";
import type {
	ApiRequestOptions,
	ControllerResponse,
} from "../../shared/types/common.types.js";
import { ErrorType, McpError } from "../../shared/utils/error.util.js";
import {
	buildErrorContext,
	handleControllerError,
} from "../../shared/utils/error-handler.util.js";
import { Logger } from "../../shared/utils/logger.util.js";
import {
	formatAddLanguagesResult,
	formatLanguageDetails,
	formatProjectLanguages,
	formatRemoveLanguageResult,
	formatSystemLanguagesList,
	formatUpdateLanguageResult,
} from "./languages.formatter.js";
import * as languagesService from "./languages.service.js";
import type {
	AddProjectLanguagesToolArgsType,
	GetLanguageToolArgsType,
	ListProjectLanguagesToolArgsType,
	ListSystemLanguagesToolArgsType,
	RemoveLanguageToolArgsType,
	UpdateLanguageToolArgsType,
} from "./languages.types.js";

/**
 * @namespace LanguagesController
 * @description Controller responsible for handling Lokalise Languages API operations.
 *              It orchestrates calls to the languages service, applies defaults,
 *              maps options, and formats the response using the formatter.
 */

/**
 * @function listSystemLanguages
 * @description Fetches a list of system languages from Lokalise.
 * @memberof LanguagesController
 * @param {ListSystemLanguagesToolArgsType} args - Arguments containing pagination options
 * @returns {Promise<ControllerResponse>} A promise that resolves to the standard controller response containing the formatted system languages list in Markdown.
 * @throws {McpError} Throws an McpError (handled by `handleControllerError`) if the service call fails or returns an error.
 */
async function listSystemLanguages(
	args: ListSystemLanguagesToolArgsType = {},
): Promise<ControllerResponse> {
	const methodLogger = Logger.forContext(
		"controllers/languages.controller.ts",
		"listSystemLanguages",
	);
	methodLogger.debug("Getting Lokalise system languages list...");

	try {
		// Apply defaults and validation
		const options: ApiRequestOptions = {
			limit: args.limit,
			page: args.page,
		};

		if (
			options.limit !== undefined &&
			(options.limit < 1 || options.limit > 500)
		) {
			// Validate limit if provided
			throw new McpError(
				"Invalid limit parameter. Must be between 1 and 500.",
				ErrorType.API_ERROR,
			);
		}

		if (options.page !== undefined && options.page < 1) {
			// Validate page if provided
			throw new McpError(
				"Invalid page parameter. Must be 1 or greater.",
				ErrorType.API_ERROR,
			);
		}

		// Note: API key validation is deferred to service layer for lazy loading

		methodLogger.debug("Getting system languages from Lokalise", {
			originalOptions: args,
			options,
		});

		try {
			// Call the service with the options
			const languages =
				await languagesService.default.getSystemLanguages(options);
			methodLogger.debug("Got the response from the service", {
				languageCount: languages.length,
			});

			const formattedContent = formatSystemLanguagesList(languages);
			return { content: formattedContent };
		} catch (error) {
			// Handle specific Lokalise API errors
			if (
				error instanceof McpError &&
				(error.message.includes("Unauthorized") ||
					error.message.includes("Invalid API token"))
			) {
				methodLogger.error("Lokalise API authentication failed");
				throw new McpError(
					"Lokalise API authentication failed. Please check your API token.",
					ErrorType.AUTH_INVALID,
				);
			}

			// For other errors, rethrow
			throw error;
		}
	} catch (error) {
		throw handleControllerError(
			error,
			buildErrorContext(
				"Lokalise System Languages",
				"listSystemLanguages",
				"controllers/languages.controller.ts@listSystemLanguages",
				`limit: ${args.limit}, page: ${args.page}`,
				{ args },
			),
		);
	}
}

/**
 * @function listProjectLanguages
 * @description Lists all languages in a specific Lokalise project.
 * @memberof LanguagesController
 * @param {ListProjectLanguagesToolArgsType} args - Arguments containing project and language options
 * @returns {Promise<ControllerResponse>} A promise that resolves to the standard controller response containing the formatted languages list in Markdown.
 * @throws {McpError} Throws an McpError (handled by `handleControllerError`) if the service call fails or returns an error.
 */
async function listProjectLanguages(
	args: ListProjectLanguagesToolArgsType,
): Promise<ControllerResponse> {
	const methodLogger = Logger.forContext(
		"controllers/languages.controller.ts",
		"listProjectLanguages",
	);
	methodLogger.debug("Getting Lokalise project languages...", args);

	try {
		// Validate project ID
		if (!args.projectId || typeof args.projectId !== "string") {
			throw new McpError(
				"Project ID is required and must be a string.",
				ErrorType.API_ERROR,
			);
		}

		// Note: API key validation is deferred to service layer for lazy loading

		methodLogger.debug("Getting project languages from Lokalise", {
			projectId: args.projectId,
		});

		try {
			// Call the service with the project ID
			const languages = await languagesService.default.getProjectLanguages(
				args.projectId,
			);
			methodLogger.debug("Got the project languages from the service", {
				projectId: args.projectId,
				languageCount: languages.length,
			});

			const formattedContent = formatProjectLanguages(
				languages,
				args.projectId,
				args.includeProgress,
			);
			return { content: formattedContent };
		} catch (error) {
			// Handle specific Lokalise API errors
			if (
				error instanceof McpError &&
				(error.message.includes("Unauthorized") ||
					error.message.includes("Invalid API token"))
			) {
				methodLogger.error("Lokalise API authentication failed");
				throw new McpError(
					"Lokalise API authentication failed. Please check your API token.",
					ErrorType.AUTH_INVALID,
				);
			}

			if (
				error instanceof McpError &&
				(error.message.includes("Not Found") || error.message.includes("404"))
			) {
				methodLogger.error("Project not found", { projectId: args.projectId });
				throw new McpError(
					`Project with ID '${args.projectId}' not found. Please check the project ID.`,
					ErrorType.API_ERROR,
				);
			}

			// For other errors, rethrow
			throw error;
		}
	} catch (error) {
		throw handleControllerError(
			error,
			buildErrorContext(
				"Lokalise Project Languages",
				"listProjectLanguages",
				"controllers/languages.controller.ts@listProjectLanguages",
				`projectId: ${args.projectId}`,
				{ args },
			),
		);
	}
}

/**
 * @function addProjectLanguages
 * @description Adds languages to a Lokalise project.
 * @memberof LanguagesController
 * @param {AddProjectLanguagesToolArgsType} args - Arguments containing project and languages data
 * @returns {Promise<ControllerResponse>} A promise that resolves to the standard controller response containing the formatted addition result.
 * @throws {McpError} Throws an McpError (handled by `handleControllerError`) if the service call fails or returns an error.
 */
async function addProjectLanguages(
	args: AddProjectLanguagesToolArgsType,
): Promise<ControllerResponse> {
	const methodLogger = Logger.forContext(
		"controllers/languages.controller.ts",
		"addProjectLanguages",
	);
	methodLogger.debug("Adding languages to Lokalise project...", {
		projectId: args.projectId,
		languageCount: args.languages?.length,
	});

	try {
		// Validate project ID
		if (!args.projectId || typeof args.projectId !== "string") {
			throw new McpError(
				"Project ID is required and must be a string.",
				ErrorType.API_ERROR,
			);
		}

		// Validate languages array
		if (
			!args.languages ||
			!Array.isArray(args.languages) ||
			args.languages.length === 0
		) {
			throw new McpError(
				"Languages array is required and must contain at least one language.",
				ErrorType.API_ERROR,
			);
		}

		if (args.languages.length > 100) {
			throw new McpError(
				"Cannot add more than 100 languages at once.",
				ErrorType.API_ERROR,
			);
		}

		// Note: API key validation is deferred to service layer for lazy loading

		methodLogger.debug("Adding languages to Lokalise", {
			projectId: args.projectId,
			languageCount: args.languages.length,
		});

		try {
			const result = await languagesService.default.addProjectLanguages(
				args.projectId,
				args.languages as CreateLanguageParams[],
			);
			methodLogger.debug("Languages added successfully", {
				addedCount: result.length,
			});

			const formattedContent = formatAddLanguagesResult(result, args.projectId);
			return { content: formattedContent };
		} catch (error) {
			if (
				error instanceof McpError &&
				(error.message.includes("Unauthorized") ||
					error.message.includes("Invalid API token"))
			) {
				methodLogger.error("Lokalise API authentication failed");
				throw new McpError(
					"Lokalise API authentication failed. Please check your API token.",
					ErrorType.AUTH_INVALID,
				);
			}

			if (
				error instanceof McpError &&
				(error.message.includes("Not Found") || error.message.includes("404"))
			) {
				methodLogger.error("Project not found", { projectId: args.projectId });
				throw new McpError(
					`Project with ID '${args.projectId}' not found. Please check the project ID.`,
					ErrorType.API_ERROR,
				);
			}

			throw error;
		}
	} catch (error) {
		throw handleControllerError(
			error,
			buildErrorContext(
				"Lokalise Languages",
				"addProjectLanguages",
				"controllers/languages.controller.ts@addProjectLanguages",
				`projectId: ${args.projectId}, languageCount: ${args.languages?.length}`,
				{
					args: { ...args, languages: `[${args.languages?.length} languages]` },
				},
			),
		);
	}
}

/**
 * @function getLanguage
 * @description Gets detailed information about a specific language.
 * @memberof LanguagesController
 * @param {GetLanguageToolArgsType} args - Arguments containing language details options
 * @returns {Promise<ControllerResponse>} A promise that resolves to the standard controller response containing the formatted language details.
 * @throws {McpError} Throws an McpError (handled by `handleControllerError`) if the service call fails or returns an error.
 */
async function getLanguage(
	args: GetLanguageToolArgsType,
): Promise<ControllerResponse> {
	const methodLogger = Logger.forContext(
		"controllers/languages.controller.ts",
		"getLanguage",
	);
	methodLogger.debug("Getting Lokalise language details...", args);

	try {
		// Validate project ID
		if (!args.projectId || typeof args.projectId !== "string") {
			throw new McpError(
				"Project ID is required and must be a string.",
				ErrorType.API_ERROR,
			);
		}

		// Validate language ID
		if (
			!args.languageId ||
			typeof args.languageId !== "number" ||
			args.languageId <= 0
		) {
			throw new McpError(
				"Language ID is required and must be a positive number.",
				ErrorType.API_ERROR,
			);
		}

		// Note: API key validation is deferred to service layer for lazy loading

		methodLogger.debug("Getting language details from Lokalise", {
			projectId: args.projectId,
			languageId: args.languageId,
		});

		try {
			const language = await languagesService.default.getLanguage(
				args.projectId,
				args.languageId,
			);
			methodLogger.debug("Got language details from service", {
				languageId: language.lang_id,
				languageName: language.lang_name,
			});

			const formattedContent = formatLanguageDetails(language, args.projectId);
			return { content: formattedContent };
		} catch (error) {
			if (
				error instanceof McpError &&
				(error.message.includes("Unauthorized") ||
					error.message.includes("Invalid API token"))
			) {
				methodLogger.error("Lokalise API authentication failed");
				throw new McpError(
					"Lokalise API authentication failed. Please check your API token.",
					ErrorType.AUTH_INVALID,
				);
			}

			if (
				error instanceof McpError &&
				(error.message.includes("Not Found") || error.message.includes("404"))
			) {
				methodLogger.error("Language or project not found", args);
				throw new McpError(
					`Language with ID '${args.languageId}' not found in project '${args.projectId}'. Please check the IDs.`,
					ErrorType.API_ERROR,
				);
			}

			throw error;
		}
	} catch (error) {
		throw handleControllerError(
			error,
			buildErrorContext(
				"Lokalise Language",
				"getLanguage",
				"controllers/languages.controller.ts@getLanguage",
				`projectId: ${args.projectId}, languageId: ${args.languageId}`,
				{ args },
			),
		);
	}
}

/**
 * @function updateLanguage
 * @description Updates an existing language.
 * @memberof LanguagesController
 * @param {UpdateLanguageToolArgsType} args - Arguments containing language update options
 * @returns {Promise<ControllerResponse>} A promise that resolves to the standard controller response containing the formatted update result.
 * @throws {McpError} Throws an McpError (handled by `handleControllerError`) if the service call fails or returns an error.
 */
async function updateLanguage(
	args: UpdateLanguageToolArgsType,
): Promise<ControllerResponse> {
	const methodLogger = Logger.forContext(
		"controllers/languages.controller.ts",
		"updateLanguage",
	);
	methodLogger.debug("Updating Lokalise language...", {
		projectId: args.projectId,
		languageId: args.languageId,
	});

	try {
		// Validate project ID
		if (!args.projectId || typeof args.projectId !== "string") {
			throw new McpError(
				"Project ID is required and must be a string.",
				ErrorType.API_ERROR,
			);
		}

		// Validate language ID
		if (
			!args.languageId ||
			typeof args.languageId !== "number" ||
			args.languageId <= 0
		) {
			throw new McpError(
				"Language ID is required and must be a positive number.",
				ErrorType.API_ERROR,
			);
		}

		// Validate language data
		if (!args.languageData || typeof args.languageData !== "object") {
			throw new McpError(
				"Language data is required and must be an object.",
				ErrorType.API_ERROR,
			);
		}

		// Check that at least one field is provided for update
		if (Object.keys(args.languageData).length === 0) {
			throw new McpError(
				"At least one field must be provided to update (lang_iso, lang_name, or plural_forms).",
				ErrorType.API_ERROR,
			);
		}

		// Note: API key validation is deferred to service layer for lazy loading

		methodLogger.debug("Updating language in Lokalise", {
			projectId: args.projectId,
			languageId: args.languageId,
			updateFields: Object.keys(args.languageData),
		});

		try {
			const language = await languagesService.default.updateLanguage(
				args.projectId,
				args.languageId,
				args.languageData as UpdateLanguageParams,
			);
			methodLogger.debug("Language updated successfully", {
				languageId: language.lang_id,
				languageName: language.lang_name,
			});

			const formattedContent = formatUpdateLanguageResult(
				language,
				args.projectId,
			);
			return { content: formattedContent };
		} catch (error) {
			if (
				error instanceof McpError &&
				(error.message.includes("Unauthorized") ||
					error.message.includes("Invalid API token"))
			) {
				methodLogger.error("Lokalise API authentication failed");
				throw new McpError(
					"Lokalise API authentication failed. Please check your API token.",
					ErrorType.AUTH_INVALID,
				);
			}

			if (
				error instanceof McpError &&
				(error.message.includes("Not Found") || error.message.includes("404"))
			) {
				methodLogger.error("Language or project not found", args);
				throw new McpError(
					`Language with ID '${args.languageId}' not found in project '${args.projectId}'. Please check the IDs.`,
					ErrorType.API_ERROR,
				);
			}

			throw error;
		}
	} catch (error) {
		throw handleControllerError(
			error,
			buildErrorContext(
				"Lokalise Language",
				"updateLanguage",
				"controllers/languages.controller.ts@updateLanguage",
				`projectId: ${args.projectId}, languageId: ${args.languageId}`,
				{ args: { ...args, languageData: "[languageData object]" } },
			),
		);
	}
}

/**
 * @function removeLanguage
 * @description Removes a language from a Lokalise project.
 * @memberof LanguagesController
 * @param {RemoveLanguageToolArgsType} args - Arguments containing language removal options
 * @returns {Promise<ControllerResponse>} A promise that resolves to the standard controller response containing the formatted removal result.
 * @throws {McpError} Throws an McpError (handled by `handleControllerError`) if the service call fails or returns an error.
 */
async function removeLanguage(
	args: RemoveLanguageToolArgsType,
): Promise<ControllerResponse> {
	const methodLogger = Logger.forContext(
		"controllers/languages.controller.ts",
		"removeLanguage",
	);
	methodLogger.debug("Removing Lokalise language...", args);

	try {
		// Validate project ID
		if (!args.projectId || typeof args.projectId !== "string") {
			throw new McpError(
				"Project ID is required and must be a string.",
				ErrorType.API_ERROR,
			);
		}

		// Validate language ID
		if (
			!args.languageId ||
			typeof args.languageId !== "number" ||
			args.languageId <= 0
		) {
			throw new McpError(
				"Language ID is required and must be a positive number.",
				ErrorType.API_ERROR,
			);
		}

		// Note: API key validation is deferred to service layer for lazy loading

		methodLogger.debug("Removing language from Lokalise", {
			projectId: args.projectId,
			languageId: args.languageId,
		});

		try {
			await languagesService.default.removeLanguage(
				args.projectId,
				args.languageId,
			);
			methodLogger.debug("Language removed successfully", {
				projectId: args.projectId,
				languageId: args.languageId,
			});

			const formattedContent = formatRemoveLanguageResult(
				args.languageId,
				args.projectId,
			);
			return { content: formattedContent };
		} catch (error) {
			if (
				error instanceof McpError &&
				(error.message.includes("Unauthorized") ||
					error.message.includes("Invalid API token"))
			) {
				methodLogger.error("Lokalise API authentication failed");
				throw new McpError(
					"Lokalise API authentication failed. Please check your API token.",
					ErrorType.AUTH_INVALID,
				);
			}

			if (
				error instanceof McpError &&
				(error.message.includes("Not Found") || error.message.includes("404"))
			) {
				methodLogger.error("Language or project not found", args);
				throw new McpError(
					`Language with ID '${args.languageId}' not found in project '${args.projectId}'. Please check the IDs.`,
					ErrorType.API_ERROR,
				);
			}

			throw error;
		}
	} catch (error) {
		throw handleControllerError(
			error,
			buildErrorContext(
				"Lokalise Language",
				"removeLanguage",
				"controllers/languages.controller.ts@removeLanguage",
				`projectId: ${args.projectId}, languageId: ${args.languageId}`,
				{ args },
			),
		);
	}
}

export default {
	listSystemLanguages,
	listProjectLanguages,
	addProjectLanguages,
	getLanguage,
	updateLanguage,
	removeLanguage,
};
