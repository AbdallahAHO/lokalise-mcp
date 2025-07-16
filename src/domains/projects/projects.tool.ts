import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type {
	DomainMeta,
	DomainTool,
} from "../../shared/types/domain.types.js";
import { formatErrorForMcpTool } from "../../shared/utils/error.util.js";
import { Logger } from "../../shared/utils/logger.util.js";
import projectsController from "./projects.controller.js";
import type {
	CreateProjectToolArgsType,
	DeleteProjectToolArgsType,
	EmptyProjectToolArgsType,
	GetProjectDetailsToolArgsType,
	ListProjectsToolArgsType,
	UpdateProjectToolArgsType,
} from "./projects.types.js";
import {
	CreateProjectToolArgs,
	DeleteProjectToolArgs,
	EmptyProjectToolArgs,
	GetProjectDetailsToolArgs,
	ListProjectsToolArgs,
	UpdateProjectToolArgs,
} from "./projects.types.js";

/**
 * @function handleListProjects
 * @description MCP Tool handler to retrieve a list of Lokalise projects.
 *              It calls the projectsController to fetch the data and formats the response for the MCP.
 *
 * @param {ListProjectsToolArgsType} args - Arguments provided to the tool.
 * @returns {Promise<{ content: Array<{ type: 'text', text: string }> }>} Formatted response for the MCP.
 * @throws {McpError} Formatted error if the controller or service layer encounters an issue.
 */
async function handleListProjects(args: ListProjectsToolArgsType) {
	const methodLogger = Logger.forContext(
		"tools/projects.tool.ts",
		"handleListProjects",
	);
	methodLogger.debug(
		`Getting Lokalise projects list (limit: ${args.limit || "default"}, page: ${args.page || "1"})...`,
		args,
	);

	try {
		// Pass args directly to the controller
		const result = await projectsController.listProjects(args);
		methodLogger.debug("Got the response from the controller", result);

		// Format the response for the MCP tool
		return {
			content: [
				{
					type: "text" as const,
					text: result.content,
				},
			],
		};
	} catch (error) {
		methodLogger.error("Error getting Lokalise projects list", error);
		return formatErrorForMcpTool(error);
	}
}

/**
 * @function handleGetProjectDetails
 * @description MCP Tool handler to retrieve detailed information about a specific Lokalise project.
 *              It calls the projectsController to fetch the data and formats the response for the MCP.
 *
 * @param {GetProjectDetailsToolArgsType} args - Arguments provided to the tool.
 * @returns {Promise<{ content: Array<{ type: 'text', text: string }> }>} Formatted response for the MCP.
 * @throws {McpError} Formatted error if the controller or service layer encounters an issue.
 */
async function handleGetProjectDetails(args: GetProjectDetailsToolArgsType) {
	const methodLogger = Logger.forContext(
		"tools/projects.tool.ts",
		"handleGetProjectDetails",
	);
	methodLogger.debug(
		`Getting Lokalise project details for project ${args.projectId}...`,
		args,
	);

	try {
		// Pass args directly to the controller
		const result = await projectsController.getProjectDetails(args);
		methodLogger.debug("Got the response from the controller", result);

		// Format the response for the MCP tool
		return {
			content: [
				{
					type: "text" as const,
					text: result.content,
				},
			],
		};
	} catch (error) {
		methodLogger.error(
			`Error getting details for project: ${args.projectId}`,
			error,
		);
		return formatErrorForMcpTool(error);
	}
}

/**
 * @function handleCreateProject
 * @description MCP Tool handler to create a new Lokalise project.
 *
 * @param {CreateProjectToolArgsType} args - Arguments provided to the tool.
 * @returns {Promise<{ content: Array<{ type: 'text', text: string }> }>} Formatted response for the MCP.
 * @throws {McpError} Formatted error if the controller or service layer encounters an issue.
 */
async function handleCreateProject(args: CreateProjectToolArgsType) {
	const methodLogger = Logger.forContext(
		"tools/projects.tool.ts",
		"handleCreateProject",
	);
	methodLogger.debug(`Creating new Lokalise project: ${args.name}...`, args);

	try {
		const result = await projectsController.createProject(args);
		methodLogger.debug("Got the response from the controller", result);

		return {
			content: [
				{
					type: "text" as const,
					text: result.content,
				},
			],
		};
	} catch (error) {
		methodLogger.error(`Error creating project: ${args.name}`, error);
		return formatErrorForMcpTool(error);
	}
}

/**
 * @function handleUpdateProject
 * @description MCP Tool handler to update an existing Lokalise project.
 *
 * @param {UpdateProjectToolArgsType} args - Arguments provided to the tool.
 * @returns {Promise<{ content: Array<{ type: 'text', text: string }> }>} Formatted response for the MCP.
 * @throws {McpError} Formatted error if the controller or service layer encounters an issue.
 */
async function handleUpdateProject(args: UpdateProjectToolArgsType) {
	const methodLogger = Logger.forContext(
		"tools/projects.tool.ts",
		"handleUpdateProject",
	);
	methodLogger.debug(`Updating Lokalise project: ${args.projectId}...`, args);

	try {
		const result = await projectsController.updateProject(args);
		methodLogger.debug("Got the response from the controller", result);

		return {
			content: [
				{
					type: "text" as const,
					text: result.content,
				},
			],
		};
	} catch (error) {
		methodLogger.error(`Error updating project: ${args.projectId}`, error);
		return formatErrorForMcpTool(error);
	}
}

/**
 * @function handleDeleteProject
 * @description MCP Tool handler to delete a Lokalise project.
 *
 * @param {DeleteProjectToolArgsType} args - Arguments provided to the tool.
 * @returns {Promise<{ content: Array<{ type: 'text', text: string }> }>} Formatted response for the MCP.
 * @throws {McpError} Formatted error if the controller or service layer encounters an issue.
 */
async function handleDeleteProject(args: DeleteProjectToolArgsType) {
	const methodLogger = Logger.forContext(
		"tools/projects.tool.ts",
		"handleDeleteProject",
	);
	methodLogger.debug(`Deleting Lokalise project: ${args.projectId}...`, args);

	try {
		const result = await projectsController.deleteProject(args);
		methodLogger.debug("Got the response from the controller", result);

		return {
			content: [
				{
					type: "text" as const,
					text: result.content,
				},
			],
		};
	} catch (error) {
		methodLogger.error(`Error deleting project: ${args.projectId}`, error);
		return formatErrorForMcpTool(error);
	}
}

/**
 * @function handleEmptyProject
 * @description MCP Tool handler to empty a Lokalise project (remove all keys and translations).
 *
 * @param {EmptyProjectToolArgsType} args - Arguments provided to the tool.
 * @returns {Promise<{ content: Array<{ type: 'text', text: string }> }>} Formatted response for the MCP.
 * @throws {McpError} Formatted error if the controller or service layer encounters an issue.
 */
async function handleEmptyProject(args: EmptyProjectToolArgsType) {
	const methodLogger = Logger.forContext(
		"tools/projects.tool.ts",
		"handleEmptyProject",
	);
	methodLogger.debug(`Emptying Lokalise project: ${args.projectId}...`, args);

	try {
		const result = await projectsController.emptyProject(args);
		methodLogger.debug("Got the response from the controller", result);

		return {
			content: [
				{
					type: "text" as const,
					text: result.content,
				},
			],
		};
	} catch (error) {
		methodLogger.error(`Error emptying project: ${args.projectId}`, error);
		return formatErrorForMcpTool(error);
	}
}

/**
 * @function registerTools
 * @description Registers all Projects tools with the MCP server.
 *
 * @param {McpServer} server - The MCP server instance.
 */
function registerTools(server: McpServer) {
	const methodLogger = Logger.forContext(
		"tools/projects.tool.ts",
		"registerTools",
	);
	methodLogger.debug("Registering Projects tools...");

	// Register project listing tool
	server.tool(
		"lokalise_list_projects",
		"Portfolio overview showing all accessible localization projects. Optional: limit (100), page, includeStats (adds progress/QA data). Use as entry point to discover projects, assess translation health, or find specific project IDs. Returns: Projects with names, IDs, base language, stats. Start here before diving into specific projects.",
		ListProjectsToolArgs.shape,
		handleListProjects,
	);

	// Register project details tool
	server.tool(
		"lokalise_get_project",
		"Deep analysis of a single project's health and configuration. Required: projectId. Optional: includeLanguages (completion rates), includeKeysSummary (content stats). Use for project audits, progress reports, or understanding structure. Returns: Complete project metadata, team info, language progress, key statistics. Essential for project status assessment.",
		GetProjectDetailsToolArgs.shape,
		handleGetProjectDetails,
	);

	// Register project creation tool
	server.tool(
		"lokalise_create_project",
		"Initializes a new localization project for an app or service. Required: name. Optional: description, base_lang_iso (default 'en'). Use when starting localization for new products or creating test environments. Returns: Project ID and access details. Next steps: Add languages, upload keys, invite team members.",
		CreateProjectToolArgs.shape,
		handleCreateProject,
	);

	// Register project update tool
	server.tool(
		"lokalise_update_project",
		"Modifies project settings and metadata. Required: projectId, projectData object. Optional in data: name, description. Use to rename projects, update descriptions, or fix project information. Returns: Updated project details. Note: Only changes metadata - use other tools for content/language changes.",
		UpdateProjectToolArgs.shape,
		handleUpdateProject,
	);

	// Register project deletion tool
	server.tool(
		"lokalise_delete_project",
		"Permanently destroys a project and ALL its data. Required: projectId. Use for removing test projects or discontinued products. Returns: Deletion confirmation. CRITICAL WARNING: Irreversible - deletes all keys, translations, history, and team assignments. Export data first if needed. Consider emptying instead.",
		DeleteProjectToolArgs.shape,
		handleDeleteProject,
	);

	// Register project empty tool
	server.tool(
		"lokalise_empty_project",
		"Resets project content while preserving settings and team. Required: projectId. Use for major refactoring, starting fresh, or clearing test data. Returns: Operation confirmation. Effect: Removes all keys and translations but keeps languages, team, and project configuration. Safer alternative to deletion.",
		EmptyProjectToolArgs.shape,
		handleEmptyProject,
	);

	methodLogger.debug("Successfully registered all Projects tools.");
}

const projectsTools: DomainTool = {
	registerTools,
	getMeta(): DomainMeta {
		return {
			name: "projects",
			description: "Projects management domain",
			version: "1.0.0",
			toolsCount: 6,
		};
	},
};

export default projectsTools;
