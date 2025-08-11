import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { ResourceTemplate } from "@modelcontextprotocol/sdk/server/mcp.js";
import type {
	DomainMeta,
	DomainResource,
} from "../../shared/types/domain.types.js";
import { Logger } from "../../shared/utils/logger.util.js";
import usergroupsController from "./usergroups.controller.js";

/**
 * Usergroups MCP resources implementation.
 * Generated on 2025-08-11 for User groups management for team-based permissions.
 */

const logger = Logger.forContext("domains/usergroups/usergroups.resource.ts");

/**
 * Handle usergroups collection resource requests
 */
async function handleUsergroupsCollectionResource(uri: URL): Promise<{
	contents: Array<{
		uri: string;
		mimeType: string;
		text: string;
	}>;
}> {
	const methodLogger = logger.forMethod("handleUsergroupsCollectionResource");
	methodLogger.debug("Handling usergroups collection resource request", {
		uri: uri.toString(),
	});

	try {
		// Extract team ID from path
		const pathParts = uri.pathname.split("/").filter(Boolean);
		if (pathParts.length < 2 || pathParts[0] !== "usergroups") {
			throw new Error(
				"Invalid resource URI format. Expected: lokalise://usergroups/<team-id>",
			);
		}
		const teamId = pathParts[1];

		// Extract query parameters
		const limit = uri.searchParams.get("limit");
		const page = uri.searchParams.get("page");

		// Build arguments
		const args = {
			teamId,
			limit: limit ? Number.parseInt(limit, 10) : undefined,
			page: page ? Number.parseInt(page, 10) : undefined,
		};

		// Call controller
		const result = await usergroupsController.list(args);

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
 * Handle usergroups detail resource requests
 */
async function handleUsergroupsDetailResource(uri: URL): Promise<{
	contents: Array<{
		uri: string;
		mimeType: string;
		text: string;
	}>;
}> {
	const methodLogger = logger.forMethod("handleUsergroupsDetailResource");
	methodLogger.debug("Handling usergroups detail resource request", {
		uri: uri.toString(),
	});

	try {
		// Extract team ID and group ID from path
		const pathParts = uri.pathname.split("/").filter(Boolean);
		if (pathParts.length < 3 || pathParts[0] !== "usergroups") {
			throw new Error(
				"Invalid resource URI format. Expected: lokalise://usergroups/<team-id>/<group-id>",
			);
		}
		const teamId = pathParts[1];
		const groupId = pathParts[2];

		// Build arguments
		const args = {
			teamId,
			groupId,
		};

		// Call controller
		const result = await usergroupsController.get(args);

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
 * Register all MCP resources for the usergroups domain
 * @param server The MCP server instance to register resources with
 */
function registerResources(server: McpServer): void {
	const registerLogger = Logger.forContext(
		"usergroups.resource.ts",
		"registerResources",
	);
	registerLogger.debug("Registering usergroups domain resources...");

	// Register collection resource
	server.resource(
		"lokalise-usergroups",
		new ResourceTemplate("lokalise://usergroups/{teamId}", {
			list: undefined, // No listing of resources needed
		}),
		async (uri: URL) => handleUsergroupsCollectionResource(uri),
	);

	// Register detail resource
	server.resource(
		"lokalise-usergroups-details",
		new ResourceTemplate("lokalise://usergroups/{teamId}/{groupId}", {
			list: undefined, // No listing of resources needed
		}),
		async (uri: URL) => handleUsergroupsDetailResource(uri),
	);

	registerLogger.debug("Usergroups domain resources registered successfully");
}

/**
 * Get metadata about the usergroups domain resources
 */
function getMeta(): DomainMeta {
	return {
		name: "usergroups",
		description:
			"User groups management for team-based permissions MCP resources",
		version: "1.0.0",
		resourcesCount: 2,
	};
}

const usergroupsResource: DomainResource = {
	registerResources,
	getMeta,
};

export default usergroupsResource;
