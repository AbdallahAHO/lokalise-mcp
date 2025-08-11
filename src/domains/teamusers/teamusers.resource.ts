import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { ResourceTemplate } from "@modelcontextprotocol/sdk/server/mcp.js";
import type {
	DomainMeta,
	DomainResource,
} from "../../shared/types/domain.types.js";
import { Logger } from "../../shared/utils/logger.util.js";
import teamusersController from "./teamusers.controller.js";

/**
 * Teamusers MCP resources implementation.
 * Generated on 2025-08-11 for Team users management for Lokalise teams.
 */

const logger = Logger.forContext("domains/teamusers/teamusers.resource.ts");

/**
 * Handle teamusers collection resource requests
 */
async function handleTeamusersCollectionResource(uri: URL): Promise<{
	contents: Array<{
		uri: string;
		mimeType: string;
		text: string;
	}>;
}> {
	const methodLogger = logger.forMethod("handleTeamusersCollectionResource");
	methodLogger.debug("Handling teamusers collection resource request", {
		uri: uri.toString(),
	});

	try {
		// Extract project ID from path
		const pathParts = uri.pathname.split("/").filter(Boolean);
		if (pathParts.length < 2 || pathParts[0] !== "teamusers") {
			throw new Error(
				"Invalid resource URI format. Expected: lokalise://teamusers/<project-id>",
			);
		}
		const projectId = pathParts[1];

		// Extract query parameters
		const limit = uri.searchParams.get("limit");
		const page = uri.searchParams.get("page");
		// TODO: Add more domain-specific filters

		// Build arguments
		const args = {
			teamId: projectId,
			limit: limit ? Number.parseInt(limit, 10) : undefined,
			page: page ? Number.parseInt(page, 10) : undefined,
		};

		// Call controller
		const result = await teamusersController.listTeamusers(args);

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
 * Handle teamusers detail resource requests
 */
async function handleTeamusersDetailResource(uri: URL): Promise<{
	contents: Array<{
		uri: string;
		mimeType: string;
		text: string;
	}>;
}> {
	const methodLogger = logger.forMethod("handleTeamusersDetailResource");
	methodLogger.debug("Handling teamusers detail resource request", {
		uri: uri.toString(),
	});

	try {
		// Extract project ID and teamusers ID from path
		const pathParts = uri.pathname.split("/").filter(Boolean);
		if (pathParts.length < 3 || pathParts[0] !== "teamusers") {
			throw new Error(
				"Invalid resource URI format. Expected: lokalise://teamusers/<project-id>/<teamusers-id>",
			);
		}
		const projectId = pathParts[1];
		const teamusersId = pathParts[2];

		// Build arguments
		const args = {
			teamId: projectId,
			userId: teamusersId,
		};

		// Call controller
		const result = await teamusersController.getTeamusers(args);

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
 * Register all MCP resources for the teamusers domain
 * @param server The MCP server instance to register resources with
 */
function registerResources(server: McpServer): void {
	const registerLogger = Logger.forContext(
		"teamusers.resource.ts",
		"registerResources",
	);
	registerLogger.debug("Registering teamusers domain resources...");

	// Register collection resource
	server.resource(
		"lokalise-teamusers",
		new ResourceTemplate("lokalise://teamusers/{projectId}", {
			list: undefined, // No listing of resources needed
		}),
		async (uri: URL) => handleTeamusersCollectionResource(uri),
	);

	// Register detail resource
	server.resource(
		"lokalise-teamusers-details",
		new ResourceTemplate("lokalise://teamusers/{projectId}/{teamusersId}", {
			list: undefined, // No listing of resources needed
		}),
		async (uri: URL) => handleTeamusersDetailResource(uri),
	);

	registerLogger.debug("Teamusers domain resources registered successfully");
}

/**
 * Get metadata about the teamusers domain resources
 */
function getMeta(): DomainMeta {
	return {
		name: "teamusers",
		description: "Team users management for Lokalise teams MCP resources",
		version: "1.0.0",
		resourcesCount: 2,
	};
}

const teamusersResource: DomainResource = {
	registerResources,
	getMeta,
};

export default teamusersResource;
