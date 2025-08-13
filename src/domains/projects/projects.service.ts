import type {
	CreateProjectParams,
	Project,
	UpdateProjectParams,
} from "@lokalise/node-api";
import type { ApiRequestOptions } from "../../shared/types/common.types.js";
import {
	createUnexpectedError,
	McpError,
} from "../../shared/utils/error.util.js";
import { Logger } from "../../shared/utils/logger.util.js";
import { getLokaliseApi } from "../../shared/utils/lokalise-api.util.js";

// Create a contextualized logger for this file
const serviceLogger = Logger.forContext("domains/projects/projects.service.ts");

// Log service initialization
serviceLogger.debug("Lokalise Projects API service initialized");

/**
 * @namespace VendorProjectsService
 * @description Service layer for interacting with Lokalise Projects API endpoints.
 *              Uses the official Lokalise SDK for reliable API communication.
 */

/**
 * @function getProjects
 * @description Fetches a list of projects from Lokalise API using the official SDK.
 * @memberof VendorProjectsService
 * @param {ApiRequestOptions} [options={}] - Optional request options for pagination and limits.
 * @returns {Promise<Project[]>} A promise that resolves to an array of project information.
 * @throws {McpError} Throws an `McpError` if the API call fails.
 */
async function getProjects(
	options: ApiRequestOptions = {},
): Promise<Project[]> {
	const methodLogger = Logger.forContext(
		"services/vendor.lokalise.com.projects.service.ts",
		"getProjects",
	);
	methodLogger.debug("Calling Lokalise API for projects", options);

	try {
		const api = getLokaliseApi();

		// Use SDK to fetch projects
		const response = await api.projects().list({
			limit: options.limit,
			page: options.page,
		});

		methodLogger.debug(
			`Received successful data from Lokalise API: ${response.items.length} projects`,
		);

		// Return the SDK response items directly as they match our Project type
		return response.items as Project[];
	} catch (error) {
		methodLogger.error("Service error fetching Lokalise projects", error);

		// Rethrow other McpErrors
		if (error instanceof McpError) {
			throw error;
		}

		// Wrap any other unexpected errors
		throw createUnexpectedError(
			"Unexpected service error while fetching Lokalise projects",
			error,
		);
	}
}

/**
 * @function getProjectDetails
 * @description Fetches detailed information about a specific project from Lokalise API using the official SDK.
 * @memberof VendorProjectsService
 * @param {string} projectId - The project ID to get details for.
 * @returns {Promise<Project>} A promise that resolves to the project details.
 * @throws {McpError} Throws an `McpError` if the API call fails.
 */
async function getProjectDetails(projectId: string): Promise<Project> {
	const methodLogger = Logger.forContext(
		"services/vendor.lokalise.com.projects.service.ts",
		"getProjectDetails",
	);
	methodLogger.debug("Calling Lokalise API for project details", {
		projectId,
	});

	try {
		const api = getLokaliseApi();

		// Use SDK to fetch project details
		const project = await api.projects().get(projectId);

		methodLogger.debug(
			`Received project details from Lokalise API: ${project.name}`,
		);

		// Return the SDK response directly as it matches our Project type
		return project as Project;
	} catch (error) {
		methodLogger.error(
			"Service error fetching Lokalise project details",
			error,
		);

		// Rethrow other McpErrors
		if (error instanceof McpError) {
			throw error;
		}

		// Wrap any other unexpected errors
		throw createUnexpectedError(
			"Unexpected service error while fetching Lokalise project details",
			error,
		);
	}
}

/**
 * @function createProject
 * @description Creates a new project in Lokalise using the official SDK.
 * @memberof VendorProjectsService
 * @param {CreateProjectParams} projectData - The project data to create.
 * @returns {Promise<Project>} A promise that resolves to the created project.
 * @throws {McpError} Throws an `McpError` if the API call fails.
 */
async function createProject(
	projectData: CreateProjectParams,
): Promise<Project> {
	const methodLogger = Logger.forContext(
		"services/vendor.lokalise.com.projects.service.ts",
		"createProject",
	);
	methodLogger.debug("Creating new Lokalise project", projectData);

	try {
		const api = getLokaliseApi();

		// Use SDK to create project
		const project = await api.projects().create({
			name: projectData.name,
			description: projectData.description,
			base_lang_iso: projectData.base_lang_iso || "en",
			languages: projectData.languages,
		});

		methodLogger.debug(
			`Created project successfully: ${project.name} (ID: ${project.project_id})`,
		);

		return project as Project;
	} catch (error) {
		methodLogger.error("Service error creating Lokalise project", error);

		if (error instanceof McpError) {
			throw error;
		}

		throw createUnexpectedError(
			"Unexpected service error while creating Lokalise project",
			error,
		);
	}
}

/**
 * @function updateProject
 * @description Updates an existing project in Lokalise using the official SDK.
 * @memberof VendorProjectsService
 * @param {string} projectId - The project ID to update.
 * @param {UpdateProjectData} projectData - The project data to update.
 * @returns {Promise<Project>} A promise that resolves to the updated project.
 * @throws {McpError} Throws an `McpError` if the API call fails.
 */
async function updateProject(
	projectId: string,
	projectData: UpdateProjectParams,
): Promise<Project> {
	const methodLogger = Logger.forContext(
		"services/vendor.lokalise.com.projects.service.ts",
		"updateProject",
	);
	methodLogger.debug("Updating Lokalise project", { projectId, projectData });

	try {
		const api = getLokaliseApi();

		// Use SDK to update project
		const project = await api.projects().update(projectId, projectData);

		methodLogger.debug(
			`Updated project successfully: ${project.name} (ID: ${project.project_id})`,
		);

		return project as Project;
	} catch (error) {
		methodLogger.error("Service error updating Lokalise project", error);

		if (error instanceof McpError) {
			throw error;
		}

		throw createUnexpectedError(
			"Unexpected service error while updating Lokalise project",
			error,
		);
	}
}

/**
 * @function deleteProject
 * @description Deletes a project from Lokalise using the official SDK.
 * @memberof VendorProjectsService
 * @param {string} projectId - The project ID to delete.
 * @returns {Promise<{ project_id: string }>} A promise that resolves to confirmation of deletion.
 * @throws {McpError} Throws an `McpError` if the API call fails.
 */
async function deleteProject(
	projectId: string,
): Promise<{ project_id: string }> {
	const methodLogger = Logger.forContext(
		"services/vendor.lokalise.com.projects.service.ts",
		"deleteProject",
	);
	methodLogger.debug("Deleting Lokalise project", { projectId });

	try {
		const api = getLokaliseApi();

		// Use SDK to delete project
		const result = await api.projects().delete(projectId);

		methodLogger.debug(`Deleted project successfully: ${projectId}`);

		return result;
	} catch (error) {
		methodLogger.error("Service error deleting Lokalise project", error);

		if (error instanceof McpError) {
			throw error;
		}

		throw createUnexpectedError(
			"Unexpected service error while deleting Lokalise project",
			error,
		);
	}
}

/**
 * @function emptyProject
 * @description Empties a project (removes all keys and translations) from Lokalise using the official SDK.
 * @memberof VendorProjectsService
 * @param {string} projectId - The project ID to empty.
 * @returns {Promise<{ project_id: string; keys_deleted: boolean }>} A promise that resolves to confirmation of emptying.
 * @throws {McpError} Throws an `McpError` if the API call fails.
 */
async function emptyProject(
	projectId: string,
): Promise<{ project_id: string; keys_deleted: boolean }> {
	const methodLogger = Logger.forContext(
		"services/vendor.lokalise.com.projects.service.ts",
		"emptyProject",
	);
	methodLogger.debug("Emptying Lokalise project", { projectId });

	try {
		const api = getLokaliseApi();

		// Use SDK to empty project
		const result = await api.projects().empty(projectId);

		methodLogger.debug(`Emptied project successfully: ${projectId}`);

		return result;
	} catch (error) {
		methodLogger.error("Service error emptying Lokalise project", error);

		if (error instanceof McpError) {
			throw error;
		}

		throw createUnexpectedError(
			"Unexpected service error while emptying Lokalise project",
			error,
		);
	}
}

export default {
	getProjects,
	getProjectDetails,
	createProject,
	updateProject,
	deleteProject,
	emptyProject,
};
