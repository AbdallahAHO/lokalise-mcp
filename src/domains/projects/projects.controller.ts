import type {
	CreateProjectParams,
	UpdateProjectParams,
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
	formatCreateProjectResult,
	formatDeleteProjectResult,
	formatEmptyProjectResult,
	formatProjectDetails,
	formatProjectsList,
	formatUpdateProjectResult,
} from "./projects.formatter.js";
import * as projectsService from "./projects.service.js";
import type {
	CreateProjectToolArgsType,
	DeleteProjectToolArgsType,
	EmptyProjectToolArgsType,
	GetProjectDetailsToolArgsType,
	ListProjectsToolArgsType,
	UpdateProjectToolArgsType,
} from "./projects.types.js";

/**
 * @namespace ProjectsController
 * @description Controller responsible for handling Lokalise Projects API operations.
 *              It orchestrates calls to the projects service, applies defaults,
 *              maps options, and formats the response using the formatter.
 */

/**
 * @function listProjects
 * @description Fetches a list of Lokalise projects accessible with the current API token.
 *              Handles pagination options and applies configuration defaults.
 * @memberof ProjectsController
 * @param {ListProjectsToolArgsType} args - Arguments containing pagination options
 * @returns {Promise<ControllerResponse>} A promise that resolves to the standard controller response containing the formatted projects list in Markdown.
 * @throws {McpError} Throws an McpError (handled by `handleControllerError`) if the service call fails or returns an error.
 */
async function listProjects(
	args: ListProjectsToolArgsType,
): Promise<ControllerResponse> {
	const methodLogger = Logger.forContext(
		"controllers/projects.controller.ts",
		"listProjects",
	);
	methodLogger.debug("Getting Lokalise projects list...");

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
		methodLogger.debug("Getting projects from Lokalise", {
			originalOptions: args,
			options,
		});

		try {
			// Call the service with the options
			const projects = await projectsService.default.getProjects(options);
			methodLogger.debug("Got the response from the service", {
				projectCount: projects.length,
			});

			const formattedContent = formatProjectsList(projects, args.includeStats);
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
				"Lokalise Project",
				"listProjects",
				"controllers/projects.controller.ts@listProjects",
				`limit: ${args.limit}, page: ${args.page}`,
				{ args },
			),
		);
	}
}

/**
 * @function getProjectDetails
 * @description Gets detailed information about a specific Lokalise project.
 * @memberof ProjectsController
 * @param {GetProjectDetailsToolArgsType} args - Arguments containing project details options
 * @returns {Promise<ControllerResponse>} A promise that resolves to the standard controller response containing the formatted project details in Markdown.
 * @throws {McpError} Throws an McpError (handled by `handleControllerError`) if the service call fails or returns an error.
 */
async function getProjectDetails(
	args: GetProjectDetailsToolArgsType,
): Promise<ControllerResponse> {
	const methodLogger = Logger.forContext(
		"controllers/projects.controller.ts",
		"getProjectDetails",
	);
	methodLogger.debug("Getting Lokalise project details...", args);

	try {
		// Validate project ID
		if (!args.projectId || typeof args.projectId !== "string") {
			throw new McpError(
				"Project ID is required and must be a string.",
				ErrorType.API_ERROR,
			);
		}

		// Note: API key validation is deferred to service layer for lazy loading
		methodLogger.debug("Getting project details from Lokalise", {
			projectId: args.projectId,
		});

		try {
			// Call the service with the project ID
			const project = await projectsService.default.getProjectDetails(
				args.projectId,
			);
			methodLogger.debug("Got the project details from the service", {
				projectId: project.project_id,
				projectName: project.name,
			});

			const formattedContent = formatProjectDetails(
				project,
				args.includeLanguages,
				args.includeKeysSummary,
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
				"Lokalise Project",
				"getProjectDetails",
				"controllers/projects.controller.ts@getProjectDetails",
				`projectId: ${args.projectId}`,
				{ args },
			),
		);
	}
}

/**
 * @function createProject
 * @description Creates a new Lokalise project with specified settings.
 * @memberof ProjectsController
 * @param {CreateProjectToolArgsType} args - Arguments containing project creation options
 * @returns {Promise<ControllerResponse>} A promise that resolves to the standard controller response containing the formatted project creation result.
 * @throws {McpError} Throws an McpError (handled by `handleControllerError`) if the service call fails or returns an error.
 */
async function createProject(
	args: CreateProjectToolArgsType,
): Promise<ControllerResponse> {
	const methodLogger = Logger.forContext(
		"controllers/projects.controller.ts",
		"createProject",
	);
	methodLogger.debug("Creating new Lokalise project...", args);

	try {
		// Validate project name
		if (
			!args.name ||
			typeof args.name !== "string" ||
			args.name.trim().length === 0
		) {
			throw new McpError(
				"Project name is required and must be a non-empty string.",
				ErrorType.API_ERROR,
			);
		}

		if (args.name.length > 100) {
			throw new McpError(
				"Project name must be 100 characters or less.",
				ErrorType.API_ERROR,
			);
		}

		// Note: API key validation is deferred to service layer for lazy loading
		methodLogger.debug("Creating project in Lokalise", {
			name: args.name,
			hasDescription: Boolean(args.description),
			baseLang: args.base_lang_iso || "en",
		});

		const projectData: CreateProjectParams = {
			name: args.name.trim(),
			description: args.description?.trim(),
			base_lang_iso: args.base_lang_iso || "en",
		};

		try {
			const project = await projectsService.default.createProject(projectData);
			methodLogger.debug("Project created successfully", {
				projectId: project.project_id,
				projectName: project.name,
			});

			const formattedContent = formatCreateProjectResult(project);
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

			throw error;
		}
	} catch (error) {
		throw handleControllerError(
			error,
			buildErrorContext(
				"Lokalise Project",
				"createProject",
				"controllers/projects.controller.ts@createProject",
				`name: ${args.name}`,
				{ args },
			),
		);
	}
}

/**
 * @function updateProject
 * @description Updates an existing Lokalise project.
 * @memberof ProjectsController
 * @param {UpdateProjectToolArgsType} args - Arguments containing project update options
 * @returns {Promise<ControllerResponse>} A promise that resolves to the standard controller response containing the formatted project update result.
 * @throws {McpError} Throws an McpError (handled by `handleControllerError`) if the service call fails or returns an error.
 */
async function updateProject(
	args: UpdateProjectToolArgsType,
): Promise<ControllerResponse> {
	const methodLogger = Logger.forContext(
		"controllers/projects.controller.ts",
		"updateProject",
	);
	methodLogger.debug("Updating Lokalise project...", args);

	try {
		// Validate project ID
		if (!args.projectId || typeof args.projectId !== "string") {
			throw new McpError(
				"Project ID is required and must be a string.",
				ErrorType.API_ERROR,
			);
		}

		// Validate project data
		if (!args.projectData || typeof args.projectData !== "object") {
			throw new McpError(
				"Project data is required and must be an object.",
				ErrorType.API_ERROR,
			);
		}

		// Check that at least one field is provided for update
		if (Object.keys(args.projectData).length === 0) {
			throw new McpError(
				"At least one field must be provided to update (name or description).",
				ErrorType.API_ERROR,
			);
		}

		// Note: API key validation is deferred to service layer for lazy loading
		methodLogger.debug("Updating project in Lokalise", {
			projectId: args.projectId,
			updateFields: Object.keys(args.projectData),
		});

		try {
			const project = await projectsService.default.updateProject(
				args.projectId,
				args.projectData as UpdateProjectParams,
			);
			methodLogger.debug("Project updated successfully", {
				projectId: project.project_id,
				projectName: project.name,
			});

			const formattedContent = formatUpdateProjectResult(project);
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
				"Lokalise Project",
				"updateProject",
				"controllers/projects.controller.ts@updateProject",
				`projectId: ${args.projectId}`,
				{ args: { ...args, projectData: "[projectData object]" } },
			),
		);
	}
}

/**
 * @function deleteProject
 * @description Deletes a Lokalise project.
 * @memberof ProjectsController
 * @param {DeleteProjectToolArgsType} args - Arguments containing project deletion options
 * @returns {Promise<ControllerResponse>} A promise that resolves to the standard controller response containing the formatted project deletion result.
 * @throws {McpError} Throws an McpError (handled by `handleControllerError`) if the service call fails or returns an error.
 */
async function deleteProject(
	args: DeleteProjectToolArgsType,
): Promise<ControllerResponse> {
	const methodLogger = Logger.forContext(
		"controllers/projects.controller.ts",
		"deleteProject",
	);
	methodLogger.debug("Deleting Lokalise project...", args);

	try {
		// Validate project ID
		if (!args.projectId || typeof args.projectId !== "string") {
			throw new McpError(
				"Project ID is required and must be a string.",
				ErrorType.API_ERROR,
			);
		}

		// Note: API key validation is deferred to service layer for lazy loading
		methodLogger.debug("Deleting project in Lokalise", {
			projectId: args.projectId,
		});

		try {
			await projectsService.default.deleteProject(args.projectId);
			methodLogger.debug("Project deleted successfully", {
				projectId: args.projectId,
			});

			const formattedContent = formatDeleteProjectResult(args.projectId);
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
				"Lokalise Project",
				"deleteProject",
				"controllers/projects.controller.ts@deleteProject",
				`projectId: ${args.projectId}`,
				{ args },
			),
		);
	}
}

/**
 * @function emptyProject
 * @description Empties a Lokalise project (removes all keys and translations).
 * @memberof ProjectsController
 * @param {EmptyProjectToolArgsType} args - Arguments containing project empty options
 * @returns {Promise<ControllerResponse>} A promise that resolves to the standard controller response containing the formatted project empty result.
 * @throws {McpError} Throws an McpError (handled by `handleControllerError`) if the service call fails or returns an error.
 */
async function emptyProject(
	args: EmptyProjectToolArgsType,
): Promise<ControllerResponse> {
	const methodLogger = Logger.forContext(
		"controllers/projects.controller.ts",
		"emptyProject",
	);
	methodLogger.debug("Emptying Lokalise project...", args);

	try {
		// Validate project ID
		if (!args.projectId || typeof args.projectId !== "string") {
			throw new McpError(
				"Project ID is required and must be a string.",
				ErrorType.API_ERROR,
			);
		}

		// Note: API key validation is deferred to service layer for lazy loading
		methodLogger.debug("Emptying project in Lokalise", {
			projectId: args.projectId,
		});

		try {
			await projectsService.default.emptyProject(args.projectId);
			methodLogger.debug("Project emptied successfully", {
				projectId: args.projectId,
			});

			const formattedContent = formatEmptyProjectResult(args.projectId);
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
				"Lokalise Project",
				"emptyProject",
				"controllers/projects.controller.ts@emptyProject",
				`projectId: ${args.projectId}`,
				{ args },
			),
		);
	}
}

export default {
	listProjects,
	getProjectDetails,
	createProject,
	updateProject,
	deleteProject,
	emptyProject,
};
