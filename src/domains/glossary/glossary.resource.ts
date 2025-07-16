import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { ResourceTemplate } from "@modelcontextprotocol/sdk/server/mcp.js";
import type {
	DomainMeta,
	DomainResource,
} from "../../shared/types/domain.types.js";
import { formatErrorForMcpResource } from "../../shared/utils/error.util.js";
import { Logger } from "../../shared/utils/logger.util.js";
import glossaryController from "./glossary.controller.js";

/**
 * Glossary MCP resources implementation.
 * Generated on 2025-07-10 for Glossary terms management for consistent translations.
 */

const logger = Logger.forContext("domains/glossary/glossary.resource.ts");

/**
 * Handle collection resource requests
 */
async function handleCollectionResource(
	projectId: string,
	params: URLSearchParams,
): Promise<{
	contents: Array<{
		uri: string;
		mimeType: string;
		text: string;
		description?: string;
	}>;
}> {
	const methodLogger = logger.forMethod("handleCollectionResource");

	// Extract query parameters
	const limitParam = params.get("limit");
	const limit = limitParam ? Number.parseInt(limitParam, 10) : 100;
	const cursor = params.get("cursor") || undefined;

	methodLogger.debug("Fetching glossary terms collection", {
		projectId,
		limit,
		cursor,
	});

	// Call controller
	const result = await glossaryController.listGlossaryTerms({
		projectId,
		limit,
		cursor,
	});

	return {
		contents: [
			{
				uri: `lokalise://glossary-terms/${projectId}`,
				mimeType: "text/markdown",
				text: result.content,
				description: `Glossary terms for project ${projectId}`,
			},
		],
	};
}

/**
 * Handle detail resource requests
 */
async function handleDetailResource(
	projectId: string,
	termId: string,
): Promise<{
	contents: Array<{
		uri: string;
		mimeType: string;
		text: string;
		description?: string;
	}>;
}> {
	const methodLogger = logger.forMethod("handleDetailResource");
	methodLogger.debug("Fetching glossary term details", { projectId, termId });

	// Parse term ID
	const parsedTermId = Number.parseInt(termId, 10);
	if (Number.isNaN(parsedTermId)) {
		throw new Error(`Invalid term ID: ${termId}. Must be a number.`);
	}

	// Call controller
	const result = await glossaryController.getGlossaryTerm({
		projectId,
		termId: parsedTermId,
	});

	return {
		contents: [
			{
				uri: `lokalise://glossary-terms/${projectId}/${termId}`,
				mimeType: "text/markdown",
				text: result.content,
				description: `Glossary term ${termId} details`,
			},
		],
	};
}

/**
 * Register all MCP resources for the glossary domain
 * @param server The MCP server instance to register resources with
 */
function registerResources(server: McpServer): void {
	const registerLogger = Logger.forContext(
		"glossary.resource.ts",
		"registerResources",
	);
	registerLogger.debug("Registering glossary domain resources...");

	// Collection resource
	server.resource(
		"lokalise-glossary-terms",
		new ResourceTemplate("lokalise://glossary-terms/{projectId}", {
			list: undefined,
		}),
		{
			description:
				"Browse glossary terms for a project. Supports cursor pagination and provides information about term properties, translations, and usage guidelines. Essential for maintaining translation consistency.",
		},
		async (uri: URL) => {
			try {
				const pathParts = uri.pathname.split("/").filter(Boolean);

				if (pathParts.length !== 2 || pathParts[0] !== "glossary-terms") {
					throw new Error(
						"Invalid resource URI. Expected lokalise://glossary-terms/<project-id>",
					);
				}

				return await handleCollectionResource(pathParts[1], uri.searchParams);
			} catch (error) {
				logger.error("Failed to handle glossary terms collection resource", {
					error,
					uri: uri.toString(),
				});
				return formatErrorForMcpResource(error, uri.toString());
			}
		},
	);

	// Detail resource
	server.resource(
		"lokalise-glossary-term-details",
		new ResourceTemplate("lokalise://glossary-terms/{projectId}/{termId}", {
			list: undefined,
		}),
		{
			description:
				"Get comprehensive details about a specific glossary term including all translations, properties (case-sensitive, translatable, forbidden), tags, and usage context. Use this to understand how a term should be handled across different languages.",
		},
		async (uri: URL) => {
			try {
				const pathParts = uri.pathname.split("/").filter(Boolean);

				if (pathParts.length !== 3 || pathParts[0] !== "glossary-terms") {
					throw new Error(
						"Invalid resource URI. Expected lokalise://glossary-terms/<project-id>/<term-id>",
					);
				}

				return await handleDetailResource(pathParts[1], pathParts[2]);
			} catch (error) {
				logger.error("Failed to handle glossary term detail resource", {
					error,
					uri: uri.toString(),
				});
				return formatErrorForMcpResource(error, uri.toString());
			}
		},
	);

	registerLogger.debug("Glossary domain resources registered successfully");
}

/**
 * Get metadata about the glossary domain resources
 */
function getMeta(): DomainMeta {
	return {
		name: "glossary",
		description:
			"Glossary terms management for consistent translations MCP resources",
		version: "1.0.0",
		resourcesCount: 2,
	};
}

const glossaryResource: DomainResource = {
	registerResources,
	getMeta,
};

export default glossaryResource;
