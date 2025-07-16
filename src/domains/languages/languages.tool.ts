import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type {
	DomainMeta,
	DomainTool,
} from "../../shared/types/domain.types.js";
import { formatErrorForMcpTool } from "../../shared/utils/error.util.js";
import { Logger } from "../../shared/utils/logger.util.js";
import languagesController from "./languages.controller.js";
import type {
	AddProjectLanguagesToolArgsType,
	GetLanguageToolArgsType,
	ListProjectLanguagesToolArgsType,
	ListSystemLanguagesToolArgsType,
	RemoveLanguageToolArgsType,
	UpdateLanguageToolArgsType,
} from "./languages.types.js";
import {
	AddProjectLanguagesToolArgs,
	GetLanguageToolArgs,
	ListProjectLanguagesToolArgs,
	ListSystemLanguagesToolArgs,
	RemoveLanguageToolArgs,
	UpdateLanguageToolArgs,
} from "./languages.types.js";

/**
 * @function handleListSystemLanguages
 * @description MCP Tool handler to retrieve a list of system languages from Lokalise.
 *              It calls the languagesController to fetch the data and formats the response for the MCP.
 *
 * @param {ListSystemLanguagesToolArgsType} args - Arguments provided to the tool.
 * @returns {Promise<{ content: Array<{ type: 'text', text: string }> }>} Formatted response for the MCP.
 * @throws {McpError} Formatted error if the controller or service layer encounters an issue.
 */
async function handleListSystemLanguages(
	args: ListSystemLanguagesToolArgsType,
) {
	const methodLogger = Logger.forContext(
		"tools/languages.tool.ts",
		"handleListSystemLanguages",
	);
	methodLogger.debug(
		`Getting Lokalise system languages list (limit: ${args.limit || "default"}, page: ${args.page || "1"})...`,
		args,
	);

	try {
		// Pass args directly to the controller
		const result = await languagesController.listSystemLanguages(args);
		methodLogger.debug("Got the response from the controller", result);

		// Format the response for the MCP tool
		return {
			content: [
				{
					type: "text" as const,
					text: result.content,
				},
			],
		};
	} catch (error) {
		methodLogger.error("Error getting Lokalise system languages list", error);
		return formatErrorForMcpTool(error);
	}
}

/**
 * @function handleListProjectLanguages
 * @description MCP Tool handler to retrieve a list of languages for a specific Lokalise project.
 *              It calls the languagesController to fetch the data and formats the response for the MCP.
 *
 * @param {ListProjectLanguagesToolArgsType} args - Arguments provided to the tool.
 * @returns {Promise<{ content: Array<{ type: 'text', text: string }> }>} Formatted response for the MCP.
 * @throws {McpError} Formatted error if the controller or service layer encounters an issue.
 */
async function handleListProjectLanguages(
	args: ListProjectLanguagesToolArgsType,
) {
	const methodLogger = Logger.forContext(
		"tools/languages.tool.ts",
		"handleListProjectLanguages",
	);
	methodLogger.debug(
		`Getting Lokalise project languages for project ${args.projectId}...`,
		args,
	);

	try {
		// Pass args directly to the controller
		const result = await languagesController.listProjectLanguages(args);
		methodLogger.debug("Got the response from the controller", result);

		// Format the response for the MCP tool
		return {
			content: [
				{
					type: "text" as const,
					text: result.content,
				},
			],
		};
	} catch (error) {
		methodLogger.error(
			`Error getting languages for project: ${args.projectId}`,
			error,
		);
		return formatErrorForMcpTool(error);
	}
}

/**
 * @function handleAddProjectLanguages
 * @description MCP Tool handler to add languages to a Lokalise project.
 *
 * @param {AddProjectLanguagesToolArgsType} args - Arguments provided to the tool.
 * @returns {Promise<{ content: Array<{ type: 'text', text: string }> }>} Formatted response for the MCP.
 * @throws {McpError} Formatted error if the controller or service layer encounters an issue.
 */
async function handleAddProjectLanguages(
	args: AddProjectLanguagesToolArgsType,
) {
	const methodLogger = Logger.forContext(
		"tools/languages.tool.ts",
		"handleAddProjectLanguages",
	);
	methodLogger.debug(
		`Adding ${args.languages.length} languages to project ${args.projectId}...`,
		{ projectId: args.projectId, languageCount: args.languages.length },
	);

	try {
		const result = await languagesController.addProjectLanguages(args);
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
		methodLogger.error(
			`Error adding languages to project: ${args.projectId}`,
			error,
		);
		return formatErrorForMcpTool(error);
	}
}

/**
 * @function handleGetLanguage
 * @description MCP Tool handler to get detailed information about a specific language.
 *
 * @param {GetLanguageToolArgsType} args - Arguments provided to the tool.
 * @returns {Promise<{ content: Array<{ type: 'text', text: string }> }>} Formatted response for the MCP.
 * @throws {McpError} Formatted error if the controller or service layer encounters an issue.
 */
async function handleGetLanguage(args: GetLanguageToolArgsType) {
	const methodLogger = Logger.forContext(
		"tools/languages.tool.ts",
		"handleGetLanguage",
	);
	methodLogger.debug(
		`Getting language ${args.languageId} from project ${args.projectId}...`,
		args,
	);

	try {
		const result = await languagesController.getLanguage(args);
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
		methodLogger.error(
			`Error getting language ${args.languageId} from project: ${args.projectId}`,
			error,
		);
		return formatErrorForMcpTool(error);
	}
}

/**
 * @function handleUpdateLanguage
 * @description MCP Tool handler to update an existing language.
 *
 * @param {UpdateLanguageToolArgsType} args - Arguments provided to the tool.
 * @returns {Promise<{ content: Array<{ type: 'text', text: string }> }>} Formatted response for the MCP.
 * @throws {McpError} Formatted error if the controller or service layer encounters an issue.
 */
async function handleUpdateLanguage(args: UpdateLanguageToolArgsType) {
	const methodLogger = Logger.forContext(
		"tools/languages.tool.ts",
		"handleUpdateLanguage",
	);
	methodLogger.debug(
		`Updating language ${args.languageId} in project ${args.projectId}...`,
		{ projectId: args.projectId, languageId: args.languageId },
	);

	try {
		const result = await languagesController.updateLanguage(args);
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
		methodLogger.error(
			`Error updating language ${args.languageId} in project: ${args.projectId}`,
			error,
		);
		return formatErrorForMcpTool(error);
	}
}

/**
 * @function handleRemoveLanguage
 * @description MCP Tool handler to remove a language from a project.
 *
 * @param {RemoveLanguageToolArgsType} args - Arguments provided to the tool.
 * @returns {Promise<{ content: Array<{ type: 'text', text: string }> }>} Formatted response for the MCP.
 * @throws {McpError} Formatted error if the controller or service layer encounters an issue.
 */
async function handleRemoveLanguage(args: RemoveLanguageToolArgsType) {
	const methodLogger = Logger.forContext(
		"tools/languages.tool.ts",
		"handleRemoveLanguage",
	);
	methodLogger.debug(
		`Removing language ${args.languageId} from project ${args.projectId}...`,
		{ projectId: args.projectId, languageId: args.languageId },
	);

	try {
		const result = await languagesController.removeLanguage(args);
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
		methodLogger.error(
			`Error removing language ${args.languageId} from project: ${args.projectId}`,
			error,
		);
		return formatErrorForMcpTool(error);
	}
}

/**
 * @function registerTools
 * @description Registers all Languages tools with the MCP server.
 *
 * @param {McpServer} server - The MCP server instance.
 */
function registerTools(server: McpServer) {
	const methodLogger = Logger.forContext(
		"tools/languages.tool.ts",
		"registerTools",
	);
	methodLogger.debug("Registering Languages tools...");

	// Register system languages listing tool
	server.tool(
		"lokalise_list_system_languages",
		"Discovers all languages available in Lokalise platform that can be added to projects. Optional: limit (100), page. Use to find supported languages before project setup, verify language codes, or check RTL/plural form support. Returns: Languages with ISO codes, native names, RTL status, plural forms. Essential before adding new target languages.",
		ListSystemLanguagesToolArgs.shape,
		handleListSystemLanguages,
	);

	// Register project languages listing tool
	server.tool(
		"lokalise_list_project_languages",
		"Shows which languages are currently being translated in a project. Required: projectId. Optional: includeProgress (shows completion %), limit, page. Use to audit translation coverage, identify incomplete languages, or prepare reports. Returns: Active languages with progress stats. Start here to understand project's localization scope.",
		ListProjectLanguagesToolArgs.shape,
		handleListProjectLanguages,
	);

	// Register add project languages tool
	server.tool(
		"lokalise_add_project_languages",
		"Starts translating into new languages by adding them to the project. Required: projectId, languages array with {lang_iso}. Optional per language: custom_iso, custom_name, custom_plural_forms. Use when expanding to new markets or adding regional variants. Returns: Added languages with IDs. Tip: Check system languages first for valid ISO codes.",
		AddProjectLanguagesToolArgs.shape,
		handleAddProjectLanguages,
	);

	// Register get language tool
	server.tool(
		"lokalise_get_language",
		"Examines detailed settings for a specific project language. Required: projectId, languageId. Use to verify plural rules, check RTL configuration, or understand custom settings. Returns: Complete language configuration including ISO codes, plural forms, and writing direction. Important for languages with complex grammar rules.",
		GetLanguageToolArgs.shape,
		handleGetLanguage,
	);

	// Register update language tool
	server.tool(
		"lokalise_update_language",
		"Modifies language settings within a project. Required: projectId, languageId, languageData object. Optional in data: lang_iso, lang_name, plural_forms. Use to fix incorrect configurations, customize language names, or adjust plural rules. Returns: Updated language settings. Changes affect how translations are handled.",
		UpdateLanguageToolArgs.shape,
		handleUpdateLanguage,
	);

	// Register remove language tool
	server.tool(
		"lokalise_remove_language",
		"Drops support for a language by removing it from the project. Required: projectId, languageId. Use when discontinuing localization for a market or cleaning up test languages. Returns: Removal confirmation. Critical Warning: Permanently deletes ALL translations for this language. Export translations first if needed.",
		RemoveLanguageToolArgs.shape,
		handleRemoveLanguage,
	);

	methodLogger.debug("Successfully registered all Languages tools.");
}

const languagesTools: DomainTool = {
	registerTools,
	getMeta(): DomainMeta {
		return {
			name: "languages",
			description: "Languages management domain",
			version: "1.0.0",
			toolsCount: 6,
		};
	},
};

export default languagesTools;
