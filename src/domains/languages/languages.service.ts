import type {
	CreateLanguageParams,
	Language,
	UpdateLanguageParams,
} from "@lokalise/node-api";
import type { ApiRequestOptions } from "../../shared/types/common.types.js";
import {
	createUnexpectedError,
	McpError,
} from "../../shared/utils/error.util.js";
import { Logger } from "../../shared/utils/logger.util.js";
import { getLokaliseApi } from "../../shared/utils/lokalise-api.util.js";

// Create a contextualized logger for this file
const serviceLogger = Logger.forContext(
	"services/vendor.lokalise.com.languages.service.ts",
);

// (Removed inline Lokalise API initialization logic)

// Log service initialization
serviceLogger.debug("Lokalise Languages API service initialized");

/**
 * @namespace VendorLanguagesService
 * @description Service layer for interacting with Lokalise Languages API endpoints.
 *              Uses the official Lokalise SDK for reliable API communication.
 */

/**
 * @function getSystemLanguages
 * @description Fetches a list of system languages from Lokalise API using the official SDK.
 * @memberof VendorLanguagesService
 * @param {ApiRequestOptions} [options={}] - Optional request options for pagination and limits.
 * @returns {Promise<Language[]>} A promise that resolves to an array of system language information.
 * @throws {McpError} Throws an `McpError` if the API call fails.
 */
async function getSystemLanguages(
	options: ApiRequestOptions = {},
): Promise<Language[]> {
	const methodLogger = Logger.forContext(
		"services/vendor.lokalise.com.languages.service.ts",
		"getSystemLanguages",
	);
	methodLogger.debug("Calling Lokalise API for system languages", options);

	try {
		const api = getLokaliseApi();

		// Use SDK to fetch system languages
		const response = await api.languages().system_languages({
			limit: options.limit,
			page: options.page,
		});

		methodLogger.debug(
			`Received successful data from Lokalise API: ${response.items.length} system languages`,
		);

		// Return the SDK response items directly as they match our Language type
		return response.items as Language[];
	} catch (error) {
		methodLogger.error(
			"Service error fetching Lokalise system languages",
			error,
		);

		// Rethrow other McpErrors
		if (error instanceof McpError) {
			throw error;
		}

		// Wrap any other unexpected errors
		throw createUnexpectedError(
			"Unexpected service error while fetching Lokalise system languages",
			error,
		);
	}
}

/**
 * @function getProjectLanguages
 * @description Fetches a list of languages for a specific project from Lokalise API using the official SDK.
 * @memberof VendorLanguagesService
 * @param {string} projectId - The project ID to get languages for.
 * @returns {Promise<Language[]>} A promise that resolves to an array of language information.
 * @throws {McpError} Throws an `McpError` if the API call fails.
 */
async function getProjectLanguages(projectId: string): Promise<Language[]> {
	const methodLogger = Logger.forContext(
		"services/vendor.lokalise.com.languages.service.ts",
		"getProjectLanguages",
	);
	methodLogger.debug("Calling Lokalise API for project languages", {
		projectId,
	});

	try {
		const api = getLokaliseApi();

		// Use SDK to fetch project languages
		const response = await api.languages().list({ project_id: projectId });

		methodLogger.debug(
			`Received project languages from Lokalise API: ${response.items.length} languages`,
		);

		// Return the SDK response items directly as they match our Language type
		return response.items as Language[];
	} catch (error) {
		methodLogger.error(
			"Service error fetching Lokalise project languages",
			error,
		);

		// Rethrow other McpErrors
		if (error instanceof McpError) {
			throw error;
		}

		// Wrap any other unexpected errors
		throw createUnexpectedError(
			"Unexpected service error while fetching Lokalise project languages",
			error,
		);
	}
}

/**
 * @function addProjectLanguages
 * @description Adds languages to a project in Lokalise using the official SDK.
 * @memberof VendorLanguagesService
 * @param {string} projectId - The project ID to add languages to.
 * @param {CreateLanguageParams[]} languages - Array of language data to add.
 * @returns {Promise<Language[]>} A promise that resolves to an array of added languages.
 * @throws {McpError} Throws an `McpError` if the API call fails.
 */
async function addProjectLanguages(
	projectId: string,
	languages: CreateLanguageParams[],
): Promise<Language[]> {
	const methodLogger = Logger.forContext(
		"services/vendor.lokalise.com.languages.service.ts",
		"addProjectLanguages",
	);
	methodLogger.debug("Adding languages to Lokalise project", {
		projectId,
		languageCount: languages.length,
	});

	try {
		const api = getLokaliseApi();

		// Use SDK to add languages
		const result = await api
			.languages()
			.create(languages, { project_id: projectId });

		methodLogger.debug(
			`Added languages successfully: ${result.items.length} languages added`,
		);

		return result.items as Language[];
	} catch (error) {
		methodLogger.error(
			"Service error adding Lokalise project languages",
			error,
		);

		if (error instanceof McpError) {
			throw error;
		}

		throw createUnexpectedError(
			"Unexpected service error while adding Lokalise project languages",
			error,
		);
	}
}

/**
 * @function getLanguage
 * @description Fetches detailed information about a specific language from Lokalise API using the official SDK.
 * @memberof VendorLanguagesService
 * @param {string} projectId - The project ID.
 * @param {number} languageId - The language ID to get details for.
 * @returns {Promise<Language>} A promise that resolves to the language details.
 * @throws {McpError} Throws an `McpError` if the API call fails.
 */
async function getLanguage(
	projectId: string,
	languageId: number,
): Promise<Language> {
	const methodLogger = Logger.forContext(
		"services/vendor.lokalise.com.languages.service.ts",
		"getLanguage",
	);
	methodLogger.debug("Calling Lokalise API for language details", {
		projectId,
		languageId,
	});

	try {
		const api = getLokaliseApi();

		const language = await api
			.languages()
			.get(languageId, { project_id: projectId });

		methodLogger.debug(
			`Received language details from Lokalise API: ${language.lang_name}`,
		);

		return language as Language;
	} catch (error) {
		methodLogger.error(
			"Service error fetching Lokalise language details",
			error,
		);

		if (error instanceof McpError) {
			throw error;
		}

		throw createUnexpectedError(
			"Unexpected service error while fetching Lokalise language details",
			error,
		);
	}
}

/**
 * @function updateLanguage
 * @description Updates an existing language using the official SDK.
 * @memberof VendorLanguagesService
 * @param {string} projectId - The project ID.
 * @param {number} languageId - The language ID to update.
 * @param {UpdateLanguageParams} languageData - The language data to update.
 * @returns {Promise<Language>} A promise that resolves to the updated language.
 * @throws {McpError} Throws an `McpError` if the API call fails.
 */
async function updateLanguage(
	projectId: string,
	languageId: number,
	languageData: UpdateLanguageParams,
): Promise<Language> {
	const methodLogger = Logger.forContext(
		"services/vendor.lokalise.com.languages.service.ts",
		"updateLanguage",
	);
	methodLogger.debug("Updating language in Lokalise project", {
		projectId,
		languageId,
		languageData,
	});

	try {
		const api = getLokaliseApi();

		const language = await api
			.languages()
			.update(languageId, languageData, { project_id: projectId });

		methodLogger.debug(`Updated language successfully: ${language.lang_name}`);

		return language as Language;
	} catch (error) {
		methodLogger.error("Service error updating Lokalise language", error);

		if (error instanceof McpError) {
			throw error;
		}

		throw createUnexpectedError(
			"Unexpected service error while updating Lokalise language",
			error,
		);
	}
}

/**
 * @function removeLanguage
 * @description Removes a language from a project using the official SDK.
 * @memberof VendorLanguagesService
 * @param {string} projectId - The project ID.
 * @param {number} languageId - The language ID to remove.
 * @returns {Promise<{ project_id: string; language_deleted: boolean }>} A promise that resolves to confirmation of removal.
 * @throws {McpError} Throws an `McpError` if the API call fails.
 */
async function removeLanguage(
	projectId: string,
	languageId: number,
): Promise<{ project_id: string; language_deleted: boolean }> {
	const methodLogger = Logger.forContext(
		"services/vendor.lokalise.com.languages.service.ts",
		"removeLanguage",
	);
	methodLogger.debug("Removing language from Lokalise project", {
		projectId,
		languageId,
	});

	try {
		const api = getLokaliseApi();

		const result = await api
			.languages()
			.delete(languageId, { project_id: projectId });

		methodLogger.debug(
			`Removed language successfully from project: ${projectId}`,
		);

		return result;
	} catch (error) {
		methodLogger.error("Service error removing Lokalise language", error);

		if (error instanceof McpError) {
			throw error;
		}

		throw createUnexpectedError(
			"Unexpected service error while removing Lokalise language",
			error,
		);
	}
}

export default {
	getSystemLanguages,
	getProjectLanguages,
	addProjectLanguages,
	getLanguage,
	updateLanguage,
	removeLanguage,
};
