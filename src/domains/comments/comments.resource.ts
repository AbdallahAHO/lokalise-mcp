import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { ResourceTemplate } from "@modelcontextprotocol/sdk/server/mcp.js";
import type {
	DomainMeta,
	DomainResource,
} from "../../shared/types/domain.types.js";
import { formatErrorForMcpResource } from "../../shared/utils/error.util.js";
import { Logger } from "../../shared/utils/logger.util.js";
import commentsController from "./comments.controller.js";

/**
 * Comments MCP resources implementation.
 * Comments are attached to translation keys and allow team collaboration.
 */

const logger = Logger.forContext("domains/comments/comments.resource.ts");

/**
 * Handle key comments resource requests
 * URI format: lokalise://comments/{projectId}/{keyId}?limit=100&page=1
 */
async function handleKeyCommentsResource(uri: URL): Promise<{
	contents: Array<{
		uri: string;
		text: string;
		mimeType: string;
		description?: string;
	}>;
}> {
	const methodLogger = logger.forMethod("handleKeyCommentsResource");
	methodLogger.debug("Handling key comments resource request", {
		uri: uri.toString(),
	});

	try {
		// Extract project ID and key ID from path (after 'comments/')
		const pathParts = uri.pathname.split("/").filter(Boolean);
		if (pathParts.length < 3) {
			throw new Error(
				"Invalid resource URI format. Expected: lokalise://comments/{projectId}/{keyId}",
			);
		}
		const projectId = pathParts[1]; // Second part is the project ID after 'comments'
		const keyId = pathParts[2]; // Third part is the key ID

		// Extract query parameters
		const limit = uri.searchParams.get("limit");
		const page = uri.searchParams.get("page");

		// Build arguments
		const args = {
			projectId,
			keyId: Number.parseInt(keyId, 10),
			limit: limit ? Number.parseInt(limit, 10) : undefined,
			page: page ? Number.parseInt(page, 10) : undefined,
		};

		// Call controller
		const result = await commentsController.listKeyComments(args);

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
 * Handle project comments resource requests
 * URI format: lokalise://comments/{projectId}?limit=100&page=1
 */
async function handleProjectCommentsResource(uri: URL): Promise<{
	contents: Array<{
		uri: string;
		text: string;
		mimeType: string;
		description?: string;
	}>;
}> {
	const methodLogger = logger.forMethod("handleProjectCommentsResource");
	methodLogger.debug("Handling project comments resource request", {
		uri: uri.toString(),
	});

	try {
		// Extract project ID from path (after 'comments/')
		const pathParts = uri.pathname.split("/").filter(Boolean);
		if (pathParts.length < 2) {
			throw new Error(
				"Invalid resource URI format. Expected: lokalise://comments/{projectId}",
			);
		}
		const projectId = pathParts[1]; // Second part is the project ID after 'comments'

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
		const result = await commentsController.listProjectComments(args);

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
 * Register all MCP resources for the comments domain
 * @param server The MCP server instance to register resources with
 */
function registerResources(server: McpServer): void {
	const registerLogger = Logger.forContext(
		"comments.resource.ts",
		"registerResources",
	);
	registerLogger.debug("Registering comments domain resources...");

	// Register key comments resource
	server.resource(
		"lokalise-key-comments",
		new ResourceTemplate("lokalise://comments/{projectId}/{keyId}", {
			list: undefined,
		}),
		async (uri: URL) => {
			return await handleKeyCommentsResource(uri);
		},
	);

	// Register project comments resource
	server.resource(
		"lokalise-project-comments",
		new ResourceTemplate("lokalise://comments/{projectId}", {
			list: undefined,
		}),
		async (uri: URL) => {
			return await handleProjectCommentsResource(uri);
		},
	);

	registerLogger.debug("Comments domain resources registered successfully");
}

/**
 * Get metadata about the comments domain resources
 */
function getMeta(): DomainMeta {
	return {
		name: "comments",
		description: "Comments on translation keys MCP resources",
		version: "1.0.0",
		resourcesCount: 2,
	};
}

const commentsResource: DomainResource = {
	registerResources,
	getMeta,
};

export default commentsResource;
