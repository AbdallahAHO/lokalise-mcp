import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { ResourceTemplate } from "@modelcontextprotocol/sdk/server/mcp.js";
import type {
	DomainMeta,
	DomainResource,
} from "../../shared/types/domain.types.js";
import { formatErrorForMcpResource } from "../../shared/utils/error.util.js";
import { Logger } from "../../shared/utils/logger.util.js";
import translationsController from "./translations.controller.js";

/**
 * Translations MCP resources implementation.
 * Generated on 2025-07-08 for Translation content management.
 */

const logger = Logger.forContext(
	"domains/translations/translations.resource.ts",
);

/**
 * Handle translations collection resource requests
 */
async function handleTranslationsCollectionResource(uri: URL): Promise<{
	contents: Array<{
		uri: string;
		mimeType: string;
		text: string;
	}>;
}> {
	const methodLogger = logger.forMethod("handleTranslationsCollectionResource");
	methodLogger.debug("Handling translations collection resource request", {
		uri: uri.toString(),
	});

	try {
		// Extract project ID from path (after 'translations/')
		const pathParts = uri.pathname.split("/").filter(Boolean);
		if (pathParts.length < 2) {
			throw new Error(
				"Invalid resource URI format. Expected: lokalise://translations/{projectId}",
			);
		}
		const projectId = pathParts[1]; // Second part is the project ID after 'translations'

		// Extract query parameters
		const limit = uri.searchParams.get("limit");
		const cursor = uri.searchParams.get("cursor");
		const filterLangId = uri.searchParams.get("filterLangId");
		const filterIsReviewed = uri.searchParams.get("filterIsReviewed");
		const filterIsUnverified = uri.searchParams.get("filterIsUnverified");
		const filterQaIssues = uri.searchParams.get("filterQaIssues");

		// Build arguments
		const args = {
			projectId,
			limit: limit ? Number.parseInt(limit, 10) : undefined,
			cursor: cursor || undefined,
			filterLangId: filterLangId
				? Number.parseInt(filterLangId, 10)
				: undefined,
			filterIsReviewed: filterIsReviewed as "0" | "1" | undefined,
			filterIsUnverified: filterIsUnverified as "0" | "1" | undefined,
			filterQaIssues: filterQaIssues || undefined,
		};

		// Call controller
		const result = await translationsController.listTranslations(args);

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
 * Handle translations detail resource requests
 */
async function handleTranslationsDetailResource(uri: URL): Promise<{
	contents: Array<{
		uri: string;
		mimeType: string;
		text: string;
	}>;
}> {
	const methodLogger = logger.forMethod("handleTranslationsDetailResource");
	methodLogger.debug("Handling translations detail resource request", {
		uri: uri.toString(),
	});

	try {
		// Extract project ID and translations ID from path (after 'translations/')
		const pathParts = uri.pathname.split("/").filter(Boolean);
		if (pathParts.length < 3) {
			throw new Error(
				"Invalid resource URI format. Expected: lokalise://translations/{projectId}/{translationId}",
			);
		}
		const projectId = pathParts[1]; // Second part is the project ID after 'translations'
		const translationsId = pathParts[2]; // Third part is the translation ID

		// Build arguments
		const args = {
			projectId,
			translationId: Number.parseInt(translationsId, 10),
		};

		// Call controller
		const result = await translationsController.getTranslation(args);

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
 * Main resource request handler
 */
async function handleResourceRequest(uri: URL): Promise<{
	contents: Array<{
		uri: string;
		mimeType: string;
		text: string;
	}>;
}> {
	const methodLogger = logger.forMethod("handleResourceRequest");
	methodLogger.debug("Processing translations resource request", {
		uri: uri.toString(),
	});

	try {
		// Route to appropriate handler based on URI structure
		const pathParts = uri.pathname.split("/").filter(Boolean);

		if (pathParts.length === 0) {
			throw new Error(
				"Invalid resource URI. Expected lokalise://translations/{projectId} or lokalise://translations/{projectId}/{translationId}",
			);
		}

		// Check if this is a detail request (has translations ID)
		if (pathParts.length >= 3) {
			return await handleTranslationsDetailResource(uri);
		}

		// Otherwise, it's a collection request
		return await handleTranslationsCollectionResource(uri);
	} catch (error) {
		methodLogger.error("Failed to handle resource request", {
			error: (error as Error).message,
			uri: uri.toString(),
		});
		return formatErrorForMcpResource(error, uri.toString());
	}
}

/**
 * Register all MCP resources for the translations domain
 * @param server The MCP server instance to register resources with
 */
function registerResources(server: McpServer): void {
	const registerLogger = Logger.forContext(
		"translations.resource.ts",
		"registerResources",
	);
	registerLogger.debug("Registering translations domain resources...");

	// Register collection resource
	server.resource(
		"lokalise-translations",
		new ResourceTemplate("lokalise://translations/{projectId}", {
			list: undefined,
		}),
		async (uri: URL) => {
			return await handleResourceRequest(uri);
		},
	);

	// Register detail resource
	server.resource(
		"lokalise-translation-details",
		new ResourceTemplate(
			"lokalise://translations/{projectId}/{translationId}",
			{ list: undefined },
		),
		async (uri: URL) => {
			return await handleResourceRequest(uri);
		},
	);

	registerLogger.debug("Translations domain resources registered successfully");
}

/**
 * Get metadata about the translations domain resources
 */
function getMeta(): DomainMeta {
	return {
		name: "translations",
		description: "Translation content management MCP resources",
		version: "1.0.0",
		resourcesCount: 2,
	};
}

const translationsResource: DomainResource = {
	registerResources,
	getMeta,
};

export default translationsResource;
