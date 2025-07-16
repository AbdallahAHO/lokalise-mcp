import type { SupportedPlatforms } from "@lokalise/node-api";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { ResourceTemplate } from "@modelcontextprotocol/sdk/server/mcp.js";
import type {
	DomainMeta,
	DomainResource,
} from "../../shared/types/domain.types.js";
import { formatErrorForMcpResource } from "../../shared/utils/error.util.js";
import { Logger } from "../../shared/utils/logger.util.js";
import controller from "./keys.controller.js";

const logger = Logger.forContext("keys.resource.ts");

/**
 * Register all MCP resources for the keys domain
 * @param server The MCP server instance to register resources with
 */
function registerResources(server: McpServer): void {
	const registerLogger = logger.forMethod("registerResources");
	registerLogger.debug("Registering keys domain resources...");

	// Register the project keys resource
	server.resource(
		"lokalise-project-keys",
		new ResourceTemplate("lokalise://keys/{projectId}", { list: undefined }),
		async (uri: URL) => {
			const methodLogger = logger.forMethod("projectKeysResource");
			try {
				// Extract the project ID from the request path
				// Format: lokalise://keys/{projectId}?includeTranslations=true&page=1&limit=100&cursor=abc123
				methodLogger.debug("Project keys resource called", {
					uri: uri.toString(),
				});

				// Get project ID from the path (after 'keys/')
				const pathParts = uri.pathname.split("/").filter(Boolean);
				const projectId = pathParts[1]; // Second part is the project ID after 'keys'

				if (!projectId) {
					throw new Error("Project ID is required in the URI path");
				}

				const urlParams = new URLSearchParams(uri.search);
				const includeTranslations =
					urlParams.get("includeTranslations") === "true";
				const page = urlParams.get("page")
					? Number.parseInt(urlParams.get("page") ?? "1", 10)
					: undefined;
				const limit = urlParams.get("limit")
					? Number.parseInt(urlParams.get("limit") ?? "100", 10)
					: undefined;
				const filterKeys = urlParams.get("filterKeys")?.split(",") || undefined;
				const filterPlatforms =
					(urlParams
						.get("filterPlatforms")
						?.split(",") as SupportedPlatforms[]) || undefined;

				// Call the controller to get the project keys
				const result = await controller.listKeys({
					projectId,
					includeTranslations,
					page,
					limit,
					filterKeys,
					filterPlatforms,
				});

				// Return the content as a text resource
				return {
					contents: [
						{
							uri: uri.toString(),
							text: result.content,
							mimeType: "text/markdown",
							description: `Lokalise Project Keys: ${projectId}${includeTranslations ? " (with translations)" : ""}${filterPlatforms ? ` (platforms: ${filterPlatforms.join(",")})` : ""}`,
						},
					],
				};
			} catch (error) {
				methodLogger.error("Project keys resource error", error);
				return formatErrorForMcpResource(error, uri.toString());
			}
		},
	);

	// Register the single key resource
	server.resource(
		"lokalise-key-details",
		new ResourceTemplate("lokalise://keys/{projectId}/{keyId}", {
			list: undefined,
		}),
		async (uri: URL) => {
			const methodLogger = logger.forMethod("keyDetailsResource");
			try {
				// Extract the project ID and key ID from the request path
				// Format: lokalise://keys/{projectId}/{keyId}?includeTranslations=true
				methodLogger.debug("Key details resource called", {
					uri: uri.toString(),
				});

				// Get project ID and key ID from the path (after 'keys/')
				const pathParts = uri.pathname.split("/").filter(Boolean);
				const projectId = pathParts[1]; // Second part is the project ID after 'keys'
				const keyId = pathParts[2]; // Third part is the key ID

				if (!projectId || !keyId) {
					throw new Error(
						"Both project ID and key ID are required in the URI path",
					);
				}

				// Call the controller to get the key details
				const result = await controller.getKey({
					projectId,
					keyId: Number.parseInt(keyId, 10),
				});

				// Return the content as a text resource
				return {
					contents: [
						{
							uri: uri.toString(),
							text: result.content,
							mimeType: "text/markdown",
							description: `Lokalise Key Details: ${keyId} (Project: ${projectId})`,
						},
					],
				};
			} catch (error) {
				methodLogger.error("Key details resource error", error);
				return formatErrorForMcpResource(error, uri.toString());
			}
		},
	);

	registerLogger.debug("Keys domain resources registered successfully");
}

/**
 * Get metadata about the keys domain resources
 */
function getMeta(): DomainMeta {
	return {
		name: "keys",
		description: "Lokalise keys domain resources",
		version: "1.0.0",
		resourcesCount: 2,
	};
}

const keysResource: DomainResource = {
	registerResources,
	getMeta,
};

export default keysResource;
