import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type {
	DomainMeta,
	DomainTool,
} from "../../shared/types/domain.types.js";
import { formatErrorForMcpTool } from "../../shared/utils/error.util.js";
import { Logger } from "../../shared/utils/logger.util.js";
import glossaryController from "./glossary.controller.js";
import type {
	CreateGlossaryToolArgsType,
	DeleteGlossaryToolArgsType,
	GetGlossaryToolArgsType,
	ListGlossaryToolArgsType,
	UpdateGlossaryToolArgsType,
} from "./glossary.types.js";
import {
	CreateGlossaryToolArgs,
	DeleteGlossaryToolArgs,
	GetGlossaryToolArgs,
	ListGlossaryToolArgs,
	UpdateGlossaryToolArgs,
} from "./glossary.types.js";

/**
 * @function handleListGlossaryTerms
 * @description MCP Tool handler to retrieve a list of glossary terms with cursor pagination.
 *
 * @param {ListGlossaryToolArgsType} args - Arguments provided to the tool.
 * @returns {Promise<{ content: Array<{ type: 'text', text: string }> }>} Formatted response for the MCP.
 * @throws {McpError} Formatted error if the controller or service layer encounters an issue.
 */
async function handleListGlossaryTerms(args: ListGlossaryToolArgsType) {
	const methodLogger = Logger.forContext(
		"glossary.tool.ts",
		"handleListGlossaryTerms",
	);
	methodLogger.debug(
		`Getting Lokalise glossary terms list (limit: ${args.limit || "default"}, cursor: ${args.cursor || "none"})...`,
		args,
	);

	try {
		const result = await glossaryController.listGlossaryTerms(args);
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
 * @function handleGetGlossaryTerm
 * @description MCP Tool handler to retrieve details of a specific glossary term.
 *
 * @param {GetGlossaryToolArgsType} args - Arguments provided to the tool.
 * @returns {Promise<{ content: Array<{ type: 'text', text: string }> }>} Formatted response for the MCP.
 * @throws {McpError} Formatted error if the controller or service layer encounters an issue.
 */
async function handleGetGlossaryTerm(args: GetGlossaryToolArgsType) {
	const methodLogger = Logger.forContext(
		"glossary.tool.ts",
		"handleGetGlossaryTerm",
	);
	methodLogger.debug("Getting glossary term details...", args);

	try {
		const result = await glossaryController.getGlossaryTerm(args);
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
 * @function handleCreateGlossaryTerms
 * @description MCP Tool handler to create new glossary terms (bulk operation).
 *
 * @param {CreateGlossaryToolArgsType} args - Arguments provided to the tool.
 * @returns {Promise<{ content: Array<{ type: 'text', text: string }> }>} Formatted response for the MCP.
 * @throws {McpError} Formatted error if the controller or service layer encounters an issue.
 */
async function handleCreateGlossaryTerms(args: CreateGlossaryToolArgsType) {
	const methodLogger = Logger.forContext(
		"glossary.tool.ts",
		"handleCreateGlossaryTerms",
	);
	methodLogger.debug("Creating glossary terms...", {
		projectId: args.projectId,
		termsCount: args.terms.length,
	});

	try {
		const result = await glossaryController.createGlossaryTerms(args);
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
 * @function handleUpdateGlossaryTerms
 * @description MCP Tool handler to update glossary terms (bulk operation).
 *
 * @param {UpdateGlossaryToolArgsType} args - Arguments provided to the tool.
 * @returns {Promise<{ content: Array<{ type: 'text', text: string }> }>} Formatted response for the MCP.
 * @throws {McpError} Formatted error if the controller or service layer encounters an issue.
 */
async function handleUpdateGlossaryTerms(args: UpdateGlossaryToolArgsType) {
	const methodLogger = Logger.forContext(
		"glossary.tool.ts",
		"handleUpdateGlossaryTerms",
	);
	methodLogger.debug("Updating glossary terms...", {
		projectId: args.projectId,
		termsCount: args.terms.length,
	});

	try {
		const result = await glossaryController.updateGlossaryTerms(args);
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
 * @function handleDeleteGlossaryTerms
 * @description MCP Tool handler to delete glossary terms (bulk operation).
 *
 * @param {DeleteGlossaryToolArgsType} args - Arguments provided to the tool.
 * @returns {Promise<{ content: Array<{ type: 'text', text: string }> }>} Formatted response for the MCP.
 * @throws {McpError} Formatted error if the controller or service layer encounters an issue.
 */
async function handleDeleteGlossaryTerms(args: DeleteGlossaryToolArgsType) {
	const methodLogger = Logger.forContext(
		"glossary.tool.ts",
		"handleDeleteGlossaryTerms",
	);
	methodLogger.debug("Deleting glossary terms...", {
		projectId: args.projectId,
		termIds: args.termIds,
	});

	try {
		const result = await glossaryController.deleteGlossaryTerms(args);
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
 * @description Registers all glossary-related tools with the MCP server.
 *              This function binds the tool names to their handler functions and schemas.
 *
 * @param {McpServer} server - The MCP server instance where tools will be registered.
 */
function registerTools(server: McpServer) {
	const methodLogger = Logger.forContext("glossary.tool.ts", "registerTools");
	methodLogger.info("Registering glossary MCP tools");

	server.tool(
		"lokalise_list_glossary_terms",
		"Retrieves paginated glossary terms that define translation rules for consistency. Required: projectId. Optional: limit (100), cursor for pagination. Use to discover defined terminology including brand names, technical terms, and forbidden words. Returns: Terms with properties (case-sensitive, translatable, forbidden) and translations. Essential before translating to prevent terminology errors.",
		ListGlossaryToolArgs.shape,
		handleListGlossaryTerms,
	);

	server.tool(
		"lokalise_get_glossary_term",
		"Fetches complete details for a single glossary term by ID. Required: projectId, termId. Use to understand precise translation rules, check case-sensitivity requirements, or view all language translations for a term. Returns: Full term data including definition, properties, and language-specific translations. Critical for translator guidance.",
		GetGlossaryToolArgs.shape,
		handleGetGlossaryTerm,
	);

	server.tool(
		"lokalise_create_glossary_terms",
		"Adds new terminology rules to maintain translation consistency. Required: projectId, terms array with {term, definition}. Optional per term: case_sensitive, translatable, forbidden, translations by language. Use for brand names, technical jargon, or untranslatable terms. Returns: Created terms with IDs. Supports bulk creation up to 1000 terms.",
		CreateGlossaryToolArgs.shape,
		handleCreateGlossaryTerms,
	);

	server.tool(
		"lokalise_update_glossary_terms",
		"Modifies existing glossary definitions and properties. Required: projectId, terms array with {term_id} plus changes. Use to refine definitions, add language translations, or adjust rules (case-sensitivity, forbidden status). Returns: Updated terms. Supports bulk updates. Changes apply immediately to all future translations.",
		UpdateGlossaryToolArgs.shape,
		handleUpdateGlossaryTerms,
	);

	server.tool(
		"lokalise_delete_glossary_terms",
		"Removes obsolete or incorrect glossary entries. Required: projectId, termIds array. Use to clean up outdated terminology, remove duplicates, or fix mistakes. Returns: Deletion confirmation. Warning: Removes all term translations and rules. Supports bulk deletion. Consider updating instead of deleting for audit trail.",
		DeleteGlossaryToolArgs.shape,
		handleDeleteGlossaryTerms,
	);

	methodLogger.info("Glossary MCP tools registered successfully");
}

// Export the domain tool implementation
const glossaryTool: DomainTool = {
	registerTools,
	getMeta(): DomainMeta {
		return {
			name: "glossary",
			description: "Glossary terms management for consistent translations",
			version: "1.0.0",
			toolsCount: 5,
		};
	},
};

export default glossaryTool;
