import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type {
	DomainMeta,
	DomainTool,
} from "../../shared/types/domain.types.js";
import { formatErrorForMcpTool } from "../../shared/utils/error.util.js";
import { Logger } from "../../shared/utils/logger.util.js";
import keysController from "./keys.controller.js";
import type {
	BulkDeleteKeysToolArgsType,
	BulkUpdateKeysToolArgsType,
	CreateKeysToolArgsType,
	DeleteKeyToolArgsType,
	GetKeyToolArgsType,
	ListKeysToolArgsType,
	UpdateKeyToolArgsType,
} from "./keys.types.js";
import {
	BulkDeleteKeysToolArgs,
	BulkUpdateKeysToolArgs,
	CreateKeysToolArgs,
	DeleteKeyToolArgs,
	GetKeyToolArgs,
	ListKeysToolArgs,
	UpdateKeyToolArgs,
} from "./keys.types.js";

/**
 * @function handleListKeys
 * @description MCP Tool handler to retrieve a list of keys from a Lokalise project.
 *              It calls the keysController to fetch the data and formats the response for the MCP.
 *
 * @param {ListKeysToolArgsType} args - Arguments provided to the tool.
 * @returns {Promise<{ content: Array<{ type: 'text', text: string }> }>} Formatted response for the MCP.
 * @throws {McpError} Formatted error if the controller or service layer encounters an issue.
 */
async function handleListKeys(args: ListKeysToolArgsType) {
	const methodLogger = Logger.forContext(
		"tools/keys.tool.ts",
		"handleListKeys",
	);
	methodLogger.debug(
		`Getting Lokalise keys list (limit: ${args.limit || "default"}, page: ${args.page || "1"})...`,
		args,
	);

	try {
		// Pass args directly to the controller
		const result = await keysController.listKeys(args);
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
		methodLogger.error("Error in handleListKeys", { error, args });
		throw formatErrorForMcpTool({
			error,
			message: "Failed to list keys",
		});
	}
}

/**
 * @function handleCreateKeys
 * @description MCP Tool handler to create multiple keys in a Lokalise project.
 *
 * @param {CreateKeysToolArgsType} args - Arguments provided to the tool.
 * @returns {Promise<{ content: Array<{ type: 'text', text: string }> }>} Formatted response for the MCP.
 * @throws {McpError} Formatted error if the controller or service layer encounters an issue.
 */
async function handleCreateKeys(args: CreateKeysToolArgsType) {
	const methodLogger = Logger.forContext(
		"tools/keys.tool.ts",
		"handleCreateKeys",
	);
	methodLogger.debug(
		`Creating ${args.keys.length} keys in project ${args.projectId}...`,
		args,
	);

	try {
		const result = await keysController.createKeys(args);
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
		methodLogger.error("Error in handleCreateKeys", { error, args });
		throw formatErrorForMcpTool({
			error,
			message: "Failed to create keys",
		});
	}
}

/**
 * @function handleGetKey
 * @description MCP Tool handler to retrieve a single key from a Lokalise project.
 *
 * @param {GetKeyToolArgsType} args - Arguments provided to the tool.
 * @returns {Promise<{ content: Array<{ type: 'text', text: string }> }>} Formatted response for the MCP.
 * @throws {McpError} Formatted error if the controller or service layer encounters an issue.
 */
async function handleGetKey(args: GetKeyToolArgsType) {
	const methodLogger = Logger.forContext("tools/keys.tool.ts", "handleGetKey");
	methodLogger.debug(
		`Getting key ${args.keyId} from project ${args.projectId}...`,
		args,
	);

	try {
		const result = await keysController.getKey(args);
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
		methodLogger.error("Error in handleGetKey", { error, args });
		throw formatErrorForMcpTool({
			error,
			message: "Failed to get key",
		});
	}
}

/**
 * @function handleUpdateKey
 * @description MCP Tool handler to update a single key in a Lokalise project.
 *
 * @param {UpdateKeyToolArgsType} args - Arguments provided to the tool.
 * @returns {Promise<{ content: Array<{ type: 'text', text: string }> }>} Formatted response for the MCP.
 * @throws {McpError} Formatted error if the controller or service layer encounters an issue.
 */
async function handleUpdateKey(args: UpdateKeyToolArgsType) {
	const methodLogger = Logger.forContext(
		"tools/keys.tool.ts",
		"handleUpdateKey",
	);
	methodLogger.debug(
		`Updating key ${args.keyId} in project ${args.projectId}...`,
		args,
	);

	try {
		const result = await keysController.updateKey(args);
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
		methodLogger.error("Error in handleUpdateKey", { error, args });
		throw formatErrorForMcpTool({
			error,
			message: "Failed to update key",
		});
	}
}

/**
 * @function handleDeleteKey
 * @description MCP Tool handler to delete a single key from a Lokalise project.
 *
 * @param {DeleteKeyToolArgsType} args - Arguments provided to the tool.
 * @returns {Promise<{ content: Array<{ type: 'text', text: string }> }>} Formatted response for the MCP.
 * @throws {McpError} Formatted error if the controller or service layer encounters an issue.
 */
async function handleDeleteKey(args: DeleteKeyToolArgsType) {
	const methodLogger = Logger.forContext(
		"tools/keys.tool.ts",
		"handleDeleteKey",
	);
	methodLogger.debug(
		`Deleting key ${args.keyId} from project ${args.projectId}...`,
		args,
	);

	try {
		const result = await keysController.deleteKey(args);
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
		methodLogger.error("Error in handleDeleteKey", { error, args });
		throw formatErrorForMcpTool({
			error,
			message: "Failed to delete key",
		});
	}
}

/**
 * @function handleBulkUpdateKeys
 * @description MCP Tool handler to update multiple keys in a Lokalise project.
 *
 * @param {BulkUpdateKeysToolArgsType} args - Arguments provided to the tool.
 * @returns {Promise<{ content: Array<{ type: 'text', text: string }> }>} Formatted response for the MCP.
 * @throws {McpError} Formatted error if the controller or service layer encounters an issue.
 */
async function handleBulkUpdateKeys(args: BulkUpdateKeysToolArgsType) {
	const methodLogger = Logger.forContext(
		"tools/keys.tool.ts",
		"handleBulkUpdateKeys",
	);
	methodLogger.debug(
		`Bulk updating ${args.keys.length} keys in project ${args.projectId}...`,
		args,
	);

	try {
		const result = await keysController.bulkUpdateKeys(args);
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
		methodLogger.error("Error in handleBulkUpdateKeys", { error, args });
		throw formatErrorForMcpTool({
			error,
			message: "Failed to bulk update keys",
		});
	}
}

/**
 * @function handleBulkDeleteKeys
 * @description MCP Tool handler to delete multiple keys from a Lokalise project.
 *
 * @param {BulkDeleteKeysToolArgsType} args - Arguments provided to the tool.
 * @returns {Promise<{ content: Array<{ type: 'text', text: string }> }>} Formatted response for the MCP.
 * @throws {McpError} Formatted error if the controller or service layer encounters an issue.
 */
async function handleBulkDeleteKeys(args: BulkDeleteKeysToolArgsType) {
	const methodLogger = Logger.forContext(
		"tools/keys.tool.ts",
		"handleBulkDeleteKeys",
	);
	methodLogger.debug(
		`Bulk deleting ${args.keyIds.length} keys from project ${args.projectId}...`,
		args,
	);

	try {
		const result = await keysController.bulkDeleteKeys(args);
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
		methodLogger.error("Error in handleBulkDeleteKeys", { error, args });
		throw formatErrorForMcpTool({
			error,
			message: "Failed to bulk delete keys",
		});
	}
}

/**
 * Register all MCP tools for the Keys collection with the server
 */
function registerTools(server: McpServer) {
	const logger = Logger.forContext("tools/keys.tool.ts", "registerTools");
	logger.debug("Registering Keys MCP tools...");

	// List Keys Tool
	server.tool(
		"lokalise_list_keys",
		"Explores the project's content structure by listing translation keys. Required: projectId. Optional: limit (100), cursor, filterKeys array, filterPlatforms array, includeTranslations. Use to browse content organization, find specific keys, or audit platform coverage. Returns: Keys with metadata and optional translations. Supports cursor pagination for large projects. Start here to understand project content.",
		ListKeysToolArgs.shape,
		handleListKeys,
	);

	// Create Keys Tool
	server.tool(
		"lokalise_create_keys",
		"Adds new UI text or content to be translated (up to 1000 keys per request). Required: projectId, keys array with {key_name, platforms}. Optional per key: description, tags, translations. Use for new features, initial setup, or content expansion. Returns: Created keys with IDs and any errors. Tip: Include base language translations to speed up workflow. Pairs with: lokalise_list_keys to verify.",
		CreateKeysToolArgs.shape,
		handleCreateKeys,
	);

	// Get Key Tool
	server.tool(
		"lokalise_get_key",
		"Deep-dives into a single content item to understand its complete state. Required: projectId, keyId. Use to investigate translation status, view all language versions, check metadata, or debug issues. Returns: Full key data including all translations, platforms, tags, comments, and history. Essential for detailed analysis or before making targeted updates.",
		GetKeyToolArgs.shape,
		handleGetKey,
	);

	// Update Key Tool
	server.tool(
		"lokalise_update_key",
		"Modifies key metadata to improve organization and translator context. Required: projectId, keyId. Optional: key_name, description, platforms, tags. Use to clarify meaning for translators, fix platform assignments, or reorganize content. Returns: Updated key. Note: This updates metadata only - use translation tools to modify actual text. Changes apply immediately.",
		UpdateKeyToolArgs.shape,
		handleUpdateKey,
	);

	// Delete Key Tool
	server.tool(
		"lokalise_delete_key",
		"Permanently removes obsolete content and all its translations. Required: projectId, keyId. Use for removing deprecated features, cleaning typos in key names, or content no longer needed. Returns: Deletion confirmation. Warning: Irreversible - all translations lost. Consider archiving important content first. For multiple keys, use bulk delete.",
		DeleteKeyToolArgs.shape,
		handleDeleteKey,
	);

	// Bulk Update Keys Tool
	server.tool(
		"lokalise_bulk_update_keys",
		"Efficiently modifies metadata for multiple keys in one operation. Required: projectId, keys array with {key_id} plus changes. Use for large-scale reorganization, batch platform updates, or systematic tagging. Returns: Updated keys and any errors. Performance: Processes up to 1000 keys per request. More efficient than individual updates for 3+ keys.",
		BulkUpdateKeysToolArgs.shape,
		handleBulkUpdateKeys,
	);

	// Bulk Delete Keys Tool
	server.tool(
		"lokalise_bulk_delete_keys",
		"Large-scale cleanup removing multiple obsolete keys permanently. Required: projectId, keyIds array. Use for removing deprecated feature sets, post-refactoring cleanup, or major content pruning. Returns: Deletion results. Critical Warning: Irreversible batch operation - all selected keys and translations permanently deleted. Always verify key list before execution.",
		BulkDeleteKeysToolArgs.shape,
		handleBulkDeleteKeys,
	);

	logger.debug("All Keys MCP tools registered successfully");
}

// Export the tools registry
const keysTools: DomainTool = {
	registerTools,
	getMeta(): DomainMeta {
		return {
			name: "keys",
			description: "Translation keys management domain",
			version: "1.0.0",
			toolsCount: 7,
		};
	},
};

export default keysTools;
