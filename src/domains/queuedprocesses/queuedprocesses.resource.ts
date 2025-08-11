import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { ResourceTemplate } from "@modelcontextprotocol/sdk/server/mcp.js";
import type {
	DomainMeta,
	DomainResource,
} from "../../shared/types/domain.types.js";
import { Logger } from "../../shared/utils/logger.util.js";
import queuedprocessesController from "./queuedprocesses.controller.js";

/**
 * Queuedprocesses MCP resources implementation.
 * Generated on 2025-08-11 for Monitor async operations in Lokalise.
 */

const logger = Logger.forContext(
	"domains/queuedprocesses/queuedprocesses.resource.ts",
);

/**
 * Handle queuedprocesses collection resource requests
 */
async function handleQueuedprocessesCollectionResource(uri: URL): Promise<{
	contents: Array<{
		uri: string;
		mimeType: string;
		text: string;
	}>;
}> {
	const methodLogger = logger.forMethod(
		"handleQueuedprocessesCollectionResource",
	);
	methodLogger.debug("Handling queuedprocesses collection resource request", {
		uri: uri.toString(),
	});

	try {
		// Extract project ID from path
		const pathParts = uri.pathname.split("/").filter(Boolean);
		if (pathParts.length < 2 || pathParts[0] !== "queuedprocesses") {
			throw new Error(
				"Invalid resource URI format. Expected: lokalise://queuedprocesses/<project-id>",
			);
		}
		const projectId = pathParts[1];

		// Extract query parameters
		const limit = uri.searchParams.get("limit");
		const page = uri.searchParams.get("page");
		// TODO: Add more domain-specific filters when needed

		// Build arguments with defaults for required fields
		const args = {
			projectId,
			limit: limit ? Number.parseInt(limit, 10) : 100,
			page: page ? Number.parseInt(page, 10) : 1,
		};

		// Call controller
		const result = await queuedprocessesController.listQueuedprocesses(args);

		return {
			contents: [
				{
					uri: uri.toString(),
					mimeType: "text/markdown",
					text: result.content,
				},
			],
		};
	} catch (error) {
		methodLogger.error("Resource handler failed", {
			error: (error as Error).message,
		});
		throw error;
	}
}

/**
 * Register all MCP resources for the queuedprocesses domain
 * @param server The MCP server instance to register resources with
 */
function registerResources(server: McpServer): void {
	const registerLogger = Logger.forContext(
		"queuedprocesses.resource.ts",
		"registerResources",
	);
	registerLogger.debug("Registering queuedprocesses domain resources...");

	// Register collection resource
	server.resource(
		"lokalise-queuedprocesses",
		new ResourceTemplate("lokalise://queuedprocesses/{projectId}", {
			list: undefined, // No listing of resources needed
		}),
		async (uri: URL) => handleQueuedprocessesCollectionResource(uri),
	);

	registerLogger.debug(
		"Queuedprocesses domain resources registered successfully",
	);
}

/**
 * Get metadata about the queuedprocesses domain resources
 */
function getMeta(): DomainMeta {
	return {
		name: "queuedprocesses",
		description: "Monitor async operations in Lokalise MCP resources",
		version: "1.0.0",
		resourcesCount: 1,
	};
}

const queuedprocessesResource: DomainResource = {
	registerResources,
	getMeta,
};

export default queuedprocessesResource;
