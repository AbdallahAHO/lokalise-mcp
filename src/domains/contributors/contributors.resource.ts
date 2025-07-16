import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { ResourceTemplate } from "@modelcontextprotocol/sdk/server/mcp.js";
import type {
	DomainMeta,
	DomainResource,
} from "../../shared/types/domain.types.js";
import { formatErrorForMcpResource } from "../../shared/utils/error.util.js";
import { Logger } from "../../shared/utils/logger.util.js";
import contributorsController from "./contributors.controller.js";

/**
 * Contributors MCP resources implementation.
 * Generated on 2025-07-08 for Team member and contributor management.
 */

const logger = Logger.forContext("contributors.resource.ts");

/**
 * Handle contributors collection resource requests
 */
async function handleContributorsCollectionResource(uri: URL): Promise<{
	contents: Array<{
		uri: string;
		mimeType: string;
		text: string;
	}>;
}> {
	const methodLogger = logger.forMethod("handleContributorsCollectionResource");
	methodLogger.debug("Handling contributors collection resource request", {
		uri: uri.toString(),
	});

	try {
		// Extract project ID from path
		const pathParts = uri.pathname.split("/").filter(Boolean);
		if (pathParts.length < 2 || pathParts[0] !== "contributors") {
			throw new Error(
				"Invalid resource URI format. Expected: lokalise://contributors/<project-id>",
			);
		}
		const projectId = pathParts[1];

		// Extract query parameters
		const limit = uri.searchParams.get("limit");
		const page = uri.searchParams.get("page");

		// Build arguments
		const args = {
			projectId,
			limit: limit ? Number.parseInt(limit, 10) : undefined,
			page: page ? Number.parseInt(page, 10) : undefined,
		};

		// Call controller
		const result = await contributorsController.listContributors(args);

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
		return formatErrorForMcpResource(error, uri.toString());
	}
}

/**
 * Handle contributor detail resource requests
 */
async function handleContributorDetailResource(uri: URL): Promise<{
	contents: Array<{
		uri: string;
		mimeType: string;
		text: string;
	}>;
}> {
	const methodLogger = logger.forMethod("handleContributorDetailResource");
	methodLogger.debug("Handling contributor detail resource request", {
		uri: uri.toString(),
	});

	try {
		// Extract project ID and contributor ID from path
		const pathParts = uri.pathname.split("/").filter(Boolean);
		if (pathParts.length < 3 || pathParts[0] !== "contributors") {
			throw new Error(
				"Invalid resource URI format. Expected: lokalise://contributors/<project-id>/<contributor-id>",
			);
		}
		const projectId = pathParts[1];
		const contributorId = pathParts[2];

		// Build arguments
		const args = {
			projectId,
			contributorId: contributorId,
		};

		// Call controller
		const result = await contributorsController.getContributor(args);

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
		return formatErrorForMcpResource(error, uri.toString());
	}
}

/**
 * Register all contributors resources with the MCP server
 */
function registerResources(server: McpServer) {
	const methodLogger = logger.forMethod("registerResources");
	methodLogger.info("Registering contributors MCP resources");

	// Collection resource
	server.resource(
		"lokalise-contributors",
		new ResourceTemplate("lokalise://contributors/{projectId}", {
			list: undefined, // No listing of resources needed
		}),
		async (uri: URL) => handleContributorsCollectionResource(uri),
	);

	// Detail resource
	server.resource(
		"lokalise-contributor-details",
		new ResourceTemplate(
			"lokalise://contributors/{projectId}/{contributorId}",
			{
				list: undefined, // No listing of resources needed
			},
		),
		async (uri: URL) => handleContributorDetailResource(uri),
	);

	methodLogger.info("Contributors MCP resources registered successfully");
}

// Export the domain resource implementation
const contributorsResource: DomainResource = {
	registerResources,
	getMeta(): DomainMeta {
		return {
			name: "contributors",
			description: "Contributors resources",
			version: "1.0.0",
			resourcesCount: 2,
		};
	},
};

export default contributorsResource;
