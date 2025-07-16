import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type {
	DomainMeta,
	DomainTool,
} from "../../shared/types/domain.types.js";
import { formatErrorForMcpTool } from "../../shared/utils/error.util.js";
import { Logger } from "../../shared/utils/logger.util.js";
import translationsController from "./translations.controller.js";
import type {
	BulkUpdateTranslationsToolArgsType,
	GetTranslationToolArgsType,
	ListTranslationsToolArgsType,
	UpdateTranslationToolArgsType,
} from "./translations.types.js";
import {
	BulkUpdateTranslationsToolArgs,
	GetTranslationToolArgs,
	ListTranslationsToolArgs,
	UpdateTranslationToolArgs,
} from "./translations.types.js";

/**
 * @function handleListTranslations
 * @description MCP Tool handler to retrieve a list of translations from a Lokalise project.
 *              It calls the translationsController to fetch the data and formats the response for the MCP.
 *
 * @param {ListTranslationsToolArgsType} args - Arguments provided to the tool.
 * @returns {Promise<{ content: Array<{ type: 'text', text: string }> }>} Formatted response for the MCP.
 * @throws {McpError} Formatted error if the controller or service layer encounters an issue.
 */
async function handleListTranslations(args: ListTranslationsToolArgsType) {
	const methodLogger = Logger.forContext(
		"translations.tool.ts",
		"handleListTranslations",
	);
	methodLogger.debug(
		`Getting Lokalise translations list (limit: ${args.limit || "default"}, cursor: ${args.cursor || "none"})...`,
		args,
	);

	try {
		const result = await translationsController.listTranslations(args);
		methodLogger.debug("Got the response from the controller", result);

		return {
			content: [
				{
					type: "text" as const,
					text: result.content,
				},
			],
		};
	} catch (error) {
		methodLogger.error("Tool failed", {
			error: (error as Error).message,
			args,
		});
		return formatErrorForMcpTool(error);
	}
}

/**
 * @function handleGetTranslation
 * @description MCP Tool handler to retrieve details of a specific translation.
 *
 * @param {GetTranslationToolArgsType} args - Arguments provided to the tool.
 * @returns {Promise<{ content: Array<{ type: 'text', text: string }> }>} Formatted response for the MCP.
 * @throws {McpError} Formatted error if the controller or service layer encounters an issue.
 */
async function handleGetTranslation(args: GetTranslationToolArgsType) {
	const methodLogger = Logger.forContext(
		"translations.tool.ts",
		"handleGetTranslation",
	);
	methodLogger.debug("Getting translation details...", args);

	try {
		const result = await translationsController.getTranslation(args);
		methodLogger.debug("Got the response from the controller", result);

		return {
			content: [
				{
					type: "text" as const,
					text: result.content,
				},
			],
		};
	} catch (error) {
		methodLogger.error("Tool failed", {
			error: (error as Error).message,
			args,
		});
		return formatErrorForMcpTool(error);
	}
}

/**
 * @function handleUpdateTranslation
 * @description MCP Tool handler to update a translation's properties.
 *
 * @param {UpdateTranslationToolArgsType} args - Arguments provided to the tool.
 * @returns {Promise<{ content: Array<{ type: 'text', text: string }> }>} Formatted response for the MCP.
 * @throws {McpError} Formatted error if the controller or service layer encounters an issue.
 */
async function handleUpdateTranslation(args: UpdateTranslationToolArgsType) {
	const methodLogger = Logger.forContext(
		"translations.tool.ts",
		"handleUpdateTranslation",
	);
	methodLogger.debug("Updating translation...", args);

	try {
		const result = await translationsController.updateTranslation(args);
		methodLogger.debug("Got the response from the controller", result);

		return {
			content: [
				{
					type: "text" as const,
					text: result.content,
				},
			],
		};
	} catch (error) {
		methodLogger.error("Tool failed", {
			error: (error as Error).message,
			args,
		});
		return formatErrorForMcpTool(error);
	}
}

/**
 * @function handleBulkUpdateTranslations
 * @description MCP Tool handler to update multiple translations in bulk.
 *
 * @param {BulkUpdateTranslationsToolArgsType} args - Arguments provided to the tool.
 * @returns {Promise<{ content: Array<{ type: 'text', text: string }> }>} Formatted response for the MCP.
 * @throws {McpError} Formatted error if the controller or service layer encounters an issue.
 */
async function handleBulkUpdateTranslations(
	args: BulkUpdateTranslationsToolArgsType,
) {
	const methodLogger = Logger.forContext(
		"translations.tool.ts",
		"handleBulkUpdateTranslations",
	);
	methodLogger.debug("Bulk updating translations...", {
		projectId: args.projectId,
		updateCount: args.updates.length,
	});

	try {
		const result = await translationsController.bulkUpdateTranslations(args);
		methodLogger.debug("Got the response from the controller", result);

		return {
			content: [
				{
					type: "text" as const,
					text: result.content,
				},
			],
		};
	} catch (error) {
		methodLogger.error("Tool failed", {
			error: (error as Error).message,
			args,
		});
		return formatErrorForMcpTool(error);
	}
}

/**
 * @function registerTools
 * @description Registers all translations-related tools with the MCP server.
 *              This function binds the tool names to their handler functions and schemas.
 *
 * @param {McpServer} server - The MCP server instance where tools will be registered.
 */
function registerTools(server: McpServer) {
	const methodLogger = Logger.forContext(
		"translations.tool.ts",
		"registerTools",
	);
	methodLogger.info("Registering translations MCP tools");

	server.tool(
		"lokalise_list_translations",
		"Low-level inspection of actual translated text across languages. Required: projectId. Optional: limit (100), cursor, filterLangId, filterIsReviewed, filterQaIssues. Use for quality audits, finding untranslated content, or checking specific language progress. Returns: Translation entries with content, status, QA flags. Note: Different from keys - this shows actual text.",
		ListTranslationsToolArgs.shape,
		handleListTranslations,
	);

	server.tool(
		"lokalise_get_translation",
		"Examines a single piece of translated text in detail. Required: projectId, translationId. Use to check exact wording, review status, modification history, or investigate QA issues. Returns: Complete translation data including content, reviewer info, timestamps, and quality flags. Essential for translation debugging.",
		GetTranslationToolArgs.shape,
		handleGetTranslation,
	);

	server.tool(
		"lokalise_update_translation",
		"Modifies actual translated text or its review status. Required: projectId, translationId. Optional: translation (new text), is_reviewed, is_unverified. Use to fix typos, approve translations, or mark problematic content. Returns: Updated translation. Note: Changes visible immediately to all users.",
		UpdateTranslationToolArgs.shape,
		handleUpdateTranslation,
	);

	server.tool(
		"lokalise_bulk_update_translations",
		"Efficiently processes batch translation corrections or approvals. Required: projectId, updates array (up to 100). Each update needs translation_id plus changes. Use for mass approvals, systematic corrections, or importing reviewed content. Returns: Success/error per translation. Performance: ~5 updates/second with automatic rate limiting and retries.",
		BulkUpdateTranslationsToolArgs.shape,
		handleBulkUpdateTranslations,
	);

	methodLogger.info("Translations MCP tools registered successfully");
}

// Export the domain tool implementation
const translationsTool: DomainTool = {
	registerTools,
	getMeta(): DomainMeta {
		return {
			name: "translations",
			description: "Translation content management",
			version: "1.0.0",
			toolsCount: 4,
		};
	},
};

export default translationsTool;
