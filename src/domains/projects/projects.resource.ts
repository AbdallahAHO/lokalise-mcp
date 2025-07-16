import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { ResourceTemplate } from "@modelcontextprotocol/sdk/server/mcp.js";
import type {
	DomainMeta,
	DomainResource,
} from "../../shared/types/domain.types.js";
import { formatErrorForMcpResource } from "../../shared/utils/error.util.js";
import { Logger } from "../../shared/utils/logger.util.js";
import controller from "./projects.controller.js";

const logger = Logger.forContext("projects.resource.ts");

/**
 * Register all MCP resources for the projects domain
 * @param server The MCP server instance to register resources with
 */
function registerResources(server: McpServer): void {
	const registerLogger = logger.forMethod("registerResources");
	registerLogger.debug("Registering projects domain resources...");

	// Register the projects list resource
	server.resource(
		"lokalise-projects",
		new ResourceTemplate("lokalise://projects", {
			list: undefined, // No listing of resources needed
		}),
		async (uri: URL) => {
			const methodLogger = logger.forMethod("projectsListResource");
			try {
				// Extract optional parameters from the URI query string
				// Format: lokalise://projects?limit=10&page=1&includeStats=true
				methodLogger.debug("Projects list resource called", {
					uri: uri.toString(),
				});

				const urlParams = new URLSearchParams(uri.search);
				const page = urlParams.get("page")
					? Number.parseInt(urlParams.get("page") ?? "1", 10)
					: undefined;
				const limit = urlParams.get("limit")
					? Number.parseInt(urlParams.get("limit") ?? "100", 10)
					: undefined;
				const includeStats = urlParams.get("includeStats") === "true";

				// Call the controller to get the projects list
				const result = await controller.listProjects({
					limit,
					page,
					includeStats,
				});

				// Return the content as a text resource
				return {
					contents: [
						{
							uri: uri.toString(),
							text: result.content,
							mimeType: "text/markdown",
							description: `Lokalise Projects List${limit ? ` (limit: ${limit})` : ""}${page ? ` (page: ${page})` : ""}`,
						},
					],
				};
			} catch (error) {
				methodLogger.error("Projects list resource error", error);
				return formatErrorForMcpResource(error, uri.toString());
			}
		},
	);

	// Register the project details resource
	server.resource(
		"lokalise-project-details",
		new ResourceTemplate("lokalise://projects/{projectId}", {
			list: undefined, // No listing of resources needed
		}),
		async (uri: URL) => {
			const methodLogger = logger.forMethod("projectDetailsResource");
			try {
				// Extract the project ID from the request path
				// Format: lokalise://projects/{projectId}?includeLanguages=true&includeKeysSummary=true
				methodLogger.debug("Project details resource called", {
					uri: uri.toString(),
				});

				// Get project ID from the path (after 'projects/')
				const pathParts = uri.pathname.split("/").filter(Boolean);
				const projectId = pathParts[1]; // Second part is the project ID after 'projects'

				if (!projectId) {
					throw new Error("Project ID is required in the URI path");
				}

				const urlParams = new URLSearchParams(uri.search);
				const includeLanguages = urlParams.get("includeLanguages") === "true";
				const includeKeysSummary =
					urlParams.get("includeKeysSummary") === "true";

				// Call the controller to get the project details
				const result = await controller.getProjectDetails({
					projectId,
					includeLanguages,
					includeKeysSummary,
				});

				// Return the content as a text resource
				return {
					contents: [
						{
							uri: uri.toString(),
							text: result.content,
							mimeType: "text/markdown",
							description: `Lokalise Project Details: ${projectId}`,
						},
					],
				};
			} catch (error) {
				methodLogger.error("Project details resource error", error);
				return formatErrorForMcpResource(error, uri.toString());
			}
		},
	);

	registerLogger.debug("Projects domain resources registered successfully");
}

/**
 * Get metadata about the projects domain resources
 */
function getMeta(): DomainMeta {
	return {
		name: "projects",
		description: "Lokalise projects domain resources",
		version: "1.0.0",
		resourcesCount: 2,
	};
}

const projectsResource: DomainResource = {
	registerResources,
	getMeta,
};

export default projectsResource;
