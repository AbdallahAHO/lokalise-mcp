import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { ResourceTemplate } from "@modelcontextprotocol/sdk/server/mcp.js";
import type {
	DomainMeta,
	DomainResource,
} from "../../shared/types/domain.types.js";
import { formatErrorForMcpResource } from "../../shared/utils/error.util.js";
import { Logger } from "../../shared/utils/logger.util.js";
import controller from "./languages.controller.js";

const logger = Logger.forContext("languages.resource.ts");

/**
 * Register all MCP resources for the languages domain
 * @param server The MCP server instance to register resources with
 */
function registerResources(server: McpServer): void {
	const registerLogger = logger.forMethod("registerResources");
	registerLogger.debug("Registering languages domain resources...");

	// Register the project languages resource
	server.resource(
		"lokalise-project-languages",
		new ResourceTemplate("lokalise://languages/{projectId}", {
			list: undefined, // No listing of resources needed
		}),
		async (uri: URL) => {
			const methodLogger = logger.forMethod("projectLanguagesResource");
			try {
				// Extract the project ID from the request path
				// Format: lokalise://languages/<project-id>?includeProgress=true&page=1&limit=50
				methodLogger.debug("Project languages resource called", {
					uri: uri.toString(),
				});

				// Get project ID from the path
				const pathParts = uri.pathname.split("/").filter(Boolean);
				const projectId = pathParts[0]; // First part should be the project ID

				if (!projectId) {
					throw new Error("Project ID is required in the URI path");
				}

				const urlParams = new URLSearchParams(uri.search);
				const includeProgress = urlParams.get("includeProgress") === "true";

				// Call the controller to get the project languages
				const result = await controller.listProjectLanguages({
					projectId,
					includeProgress,
				});

				// Return the content as a text resource
				return {
					contents: [
						{
							uri: uri.toString(),
							text: result.content,
							mimeType: "text/markdown",
							description: `Lokalise Project Languages: ${projectId}${includeProgress ? " (with progress)" : ""}`,
						},
					],
				};
			} catch (error) {
				methodLogger.error("Project languages resource error", error);
				return formatErrorForMcpResource(error, uri.toString());
			}
		},
	);

	// Register the system languages resource
	server.resource(
		"lokalise-system-languages",
		new ResourceTemplate("lokalise://languages/system", {
			list: undefined, // No listing of resources needed
		}),
		async (uri: URL) => {
			const methodLogger = logger.forMethod("systemLanguagesResource");
			try {
				// Extract optional parameters from the URI query string
				// Format: lokalise://languages/system?page=1&limit=100
				methodLogger.debug("System languages resource called", {
					uri: uri.toString(),
				});

				const urlParams = new URLSearchParams(uri.search);
				const page = urlParams.get("page")
					? Number.parseInt(urlParams.get("page") ?? "1", 10)
					: undefined;
				const limit = urlParams.get("limit")
					? Number.parseInt(urlParams.get("limit") ?? "100", 10)
					: undefined;

				// Call the controller to get the system languages
				const result = await controller.listSystemLanguages({
					page,
					limit,
				});

				// Return the content as a text resource
				return {
					contents: [
						{
							uri: uri.toString(),
							text: result.content,
							mimeType: "text/markdown",
							description: `Lokalise System Languages${page ? ` (page: ${page})` : ""}${limit ? ` (limit: ${limit})` : ""}`,
						},
					],
				};
			} catch (error) {
				methodLogger.error("System languages resource error", error);
				return formatErrorForMcpResource(error, uri.toString());
			}
		},
	);

	registerLogger.debug("Languages domain resources registered successfully");
}

/**
 * Get metadata about the languages domain resources
 */
function getMeta(): DomainMeta {
	return {
		name: "languages",
		description: "Lokalise languages domain resources",
		version: "1.0.0",
		resourcesCount: 2,
	};
}

const languagesResource: DomainResource = {
	registerResources,
	getMeta,
};

export default languagesResource;
