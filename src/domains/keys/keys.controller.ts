import type { ControllerResponse } from "../../shared/types/common.types.js";
import {
	buildErrorContext,
	handleControllerError,
} from "../../shared/utils/error-handler.util.js";
import { Logger } from "../../shared/utils/logger.util.js";
import {
	formatBulkDeleteKeysResult,
	formatBulkUpdateKeysResult,
	formatCreateKeysResult,
	formatDeleteKeyResult,
	formatKeyDetails,
	formatKeysList,
	formatUpdateKeyResult,
} from "./keys.formatter.js";
import * as keysService from "./keys.service.js";
import type {
	BulkDeleteKeysToolArgsType,
	BulkUpdateKeysToolArgsType,
	CreateKeysToolArgsType,
	DeleteKeyToolArgsType,
	GetKeyToolArgsType,
	ListKeysToolArgsType,
	UpdateKeyToolArgsType,
} from "./keys.types.js";

/**
 * @namespace KeysController
 * @description Controller responsible for handling Lokalise Keys API operations.
 *              It orchestrates calls to the keys service, applies defaults,
 *              maps options, and formats the response using the formatter.
 */

/**
 * @function listKeys
 * @description Fetches a list of keys from a Lokalise project with optional filtering and pagination.
 * @memberof KeysController
 * @param {ListKeysToolArgsType} args - Arguments containing project ID, filters, and pagination options
 * @returns {Promise<ControllerResponse>} A promise that resolves to the standard controller response containing the formatted keys list in Markdown.
 * @throws {McpError} Throws an McpError (handled by `handleControllerError`) if the service call fails or returns an error.
 */
async function listKeys(
	args: ListKeysToolArgsType,
): Promise<ControllerResponse> {
	const methodLogger = Logger.forContext(
		"controllers/keys.controller.ts",
		"listKeys",
	);

	try {
		methodLogger.debug("Starting listKeys operation", {
			projectId: args.projectId,
			limit: args.limit,
			page: args.page,
			includeTranslations: args.includeTranslations,
		});

		// Map arguments to service parameters
		const serviceParams: keysService.KeyListParams = {
			project_id: args.projectId,
			limit: args.limit || 100,
			page: args.page || 1,
			include_translations: args.includeTranslations,
			filter_keys: args.filterKeys,
			filter_platforms: args.filterPlatforms,
			pagination: "cursor", // Use cursor pagination for better performance
		};

		const result = await keysService.getKeys(serviceParams);

		methodLogger.debug("Keys service call successful", {
			projectId: args.projectId,
			keysCount: result.items?.length || 0,
			hasNextCursor: !!result.nextCursor,
		});

		const formatted = formatKeysList(result, args.projectId);

		return { content: formatted };
	} catch (error) {
		throw handleControllerError(
			error,
			buildErrorContext(
				"Lokalise Key",
				"listKeys",
				"controllers/keys.controller.ts@listKeys",
				args.projectId,
				{ args },
			),
		);
	}
}

/**
 * @function createKeys
 * @description Creates multiple keys in a Lokalise project
 * @memberof KeysController
 * @param {CreateKeysToolArgsType} args - Arguments containing project ID and keys data
 * @returns {Promise<ControllerResponse>} A promise that resolves to the standard controller response containing the creation results.
 */
async function createKeys(
	args: CreateKeysToolArgsType,
): Promise<ControllerResponse> {
	const methodLogger = Logger.forContext(
		"controllers/keys.controller.ts",
		"createKeys",
	);

	try {
		methodLogger.debug("Starting createKeys operation", {
			projectId: args.projectId,
			keysCount: args.keys.length,
		});

		// Map arguments to service parameters
		const serviceParams: keysService.CreateKeysParams = {
			project_id: args.projectId,
			keys: args.keys.map((key) => ({
				key_name: key.key_name,
				description: key.description,
				platforms: key.platforms,
				translations: key.translations,
				tags: key.tags,
			})),
		};

		const result = await keysService.createKeys(serviceParams);

		methodLogger.debug("Keys creation successful", {
			projectId: args.projectId,
			createdCount: result.items?.length || 0,
			errorsCount: result.errors?.length || 0,
		});

		const formatted = formatCreateKeysResult(result, args.projectId);

		return { content: formatted };
	} catch (error) {
		throw handleControllerError(
			error,
			buildErrorContext(
				"Lokalise Key",
				"createKeys",
				"controllers/keys.controller.ts@createKeys",
				args.projectId,
				{ args, keysCount: args.keys.length },
			),
		);
	}
}

/**
 * @function getKey
 * @description Fetches a single key from a Lokalise project
 * @memberof KeysController
 * @param {GetKeyToolArgsType} args - Arguments containing project ID and key ID
 * @returns {Promise<ControllerResponse>} A promise that resolves to the standard controller response containing the key details.
 */
async function getKey(args: GetKeyToolArgsType): Promise<ControllerResponse> {
	const methodLogger = Logger.forContext(
		"controllers/keys.controller.ts",
		"getKey",
	);

	try {
		methodLogger.debug("Starting getKey operation", {
			projectId: args.projectId,
			keyId: args.keyId,
		});

		// Map arguments to service parameters
		const serviceParams: keysService.GetKeyParams = {
			project_id: args.projectId,
			key_id: args.keyId,
		};

		const result = await keysService.getKey(serviceParams);

		methodLogger.debug("Key retrieval successful", {
			projectId: args.projectId,
			keyId: args.keyId,
			keyName: result.key_name,
		});

		const formatted = formatKeyDetails(result, args.projectId);

		return { content: formatted };
	} catch (error) {
		throw handleControllerError(
			error,
			buildErrorContext(
				"Lokalise Key",
				"getKey",
				"controllers/keys.controller.ts@getKey",
				`${args.projectId}:${args.keyId}`,
				{ args },
			),
		);
	}
}

/**
 * @function updateKey
 * @description Updates a single key in a Lokalise project
 * @memberof KeysController
 * @param {UpdateKeyToolArgsType} args - Arguments containing project ID, key ID and update data
 * @returns {Promise<ControllerResponse>} A promise that resolves to the standard controller response containing the updated key details.
 */
async function updateKey(
	args: UpdateKeyToolArgsType,
): Promise<ControllerResponse> {
	const methodLogger = Logger.forContext(
		"controllers/keys.controller.ts",
		"updateKey",
	);

	try {
		methodLogger.debug("Starting updateKey operation", {
			projectId: args.projectId,
			keyId: args.keyId,
		});

		// Map arguments to service parameters
		const serviceParams: keysService.UpdateKeyParams = {
			project_id: args.projectId,
			key_id: args.keyId,
			description: args.keyData.description,
			platforms: args.keyData.platforms, // Type conversion for platforms
			tags: args.keyData.tags,
		};

		const result = await keysService.updateKey(serviceParams);

		methodLogger.debug("Key update successful", {
			projectId: args.projectId,
			keyId: args.keyId,
			keyName: result.key_name,
		});

		const formatted = formatUpdateKeyResult(result, args.projectId);

		return { content: formatted };
	} catch (error) {
		throw handleControllerError(
			error,
			buildErrorContext(
				"Lokalise Key",
				"updateKey",
				"controllers/keys.controller.ts@updateKey",
				`${args.projectId}:${args.keyId}`,
				{ args },
			),
		);
	}
}

/**
 * @function deleteKey
 * @description Deletes a single key from a Lokalise project
 * @memberof KeysController
 * @param {DeleteKeyToolArgsType} args - Arguments containing project ID and key ID
 * @returns {Promise<ControllerResponse>} A promise that resolves to the standard controller response containing the deletion confirmation.
 */
async function deleteKey(
	args: DeleteKeyToolArgsType,
): Promise<ControllerResponse> {
	const methodLogger = Logger.forContext(
		"controllers/keys.controller.ts",
		"deleteKey",
	);

	try {
		methodLogger.debug("Starting deleteKey operation", {
			projectId: args.projectId,
			keyId: args.keyId,
		});

		// Map arguments to service parameters
		const serviceParams: keysService.DeleteKeyParams = {
			project_id: args.projectId,
			key_id: args.keyId,
		};

		const result = await keysService.deleteKey(serviceParams);

		methodLogger.debug("Key deletion successful", {
			projectId: args.projectId,
			keyId: args.keyId,
		});

		const formatted = formatDeleteKeyResult(result, args.projectId, args.keyId);

		return { content: formatted };
	} catch (error) {
		throw handleControllerError(
			error,
			buildErrorContext(
				"Lokalise Key",
				"deleteKey",
				"controllers/keys.controller.ts@deleteKey",
				`${args.projectId}:${args.keyId}`,
				{ args },
			),
		);
	}
}

/**
 * @function bulkUpdateKeys
 * @description Updates multiple keys in a Lokalise project
 * @memberof KeysController
 * @param {BulkUpdateKeysToolArgsType} args - Arguments containing project ID and keys update data
 * @returns {Promise<ControllerResponse>} A promise that resolves to the standard controller response containing the bulk update results.
 */
async function bulkUpdateKeys(
	args: BulkUpdateKeysToolArgsType,
): Promise<ControllerResponse> {
	const methodLogger = Logger.forContext(
		"controllers/keys.controller.ts",
		"bulkUpdateKeys",
	);

	try {
		methodLogger.debug("Starting bulkUpdateKeys operation", {
			projectId: args.projectId,
			keysCount: args.keys.length,
		});

		// Map arguments to service parameters
		const serviceParams: keysService.BulkUpdateKeysParams = {
			project_id: args.projectId,
			keys: args.keys.map((key) => ({
				key_id: key.keyId,
				description: key.description,
				platforms: key.platforms, // Type conversion for platforms
				tags: key.tags,
			})),
		};

		const result = await keysService.bulkUpdateKeys(serviceParams);

		methodLogger.debug("Bulk keys update successful", {
			projectId: args.projectId,
			updatedCount: result.items?.length || 0,
			errorsCount: result.errors?.length || 0,
		});

		const formatted = formatBulkUpdateKeysResult(result, args.projectId);

		return { content: formatted };
	} catch (error) {
		throw handleControllerError(
			error,
			buildErrorContext(
				"Lokalise Key",
				"bulkUpdateKeys",
				"controllers/keys.controller.ts@bulkUpdateKeys",
				args.projectId,
				{ args, keysCount: args.keys.length },
			),
		);
	}
}

/**
 * @function bulkDeleteKeys
 * @description Deletes multiple keys from a Lokalise project
 * @memberof KeysController
 * @param {BulkDeleteKeysToolArgsType} args - Arguments containing project ID and key IDs
 * @returns {Promise<ControllerResponse>} A promise that resolves to the standard controller response containing the bulk deletion results.
 */
async function bulkDeleteKeys(
	args: BulkDeleteKeysToolArgsType,
): Promise<ControllerResponse> {
	const methodLogger = Logger.forContext(
		"controllers/keys.controller.ts",
		"bulkDeleteKeys",
	);

	try {
		methodLogger.debug("Starting bulkDeleteKeys operation", {
			projectId: args.projectId,
			keysCount: args.keyIds.length,
		});

		// Map arguments to service parameters
		const serviceParams: keysService.BulkDeleteKeysParams = {
			project_id: args.projectId,
			key_ids: args.keyIds,
		};

		const result = await keysService.bulkDeleteKeys(serviceParams);

		methodLogger.debug("Bulk keys deletion successful", {
			projectId: args.projectId,
			deletedCount: args.keyIds.length,
		});

		const formatted = formatBulkDeleteKeysResult(
			result,
			args.projectId,
			args.keyIds.length,
		);

		return { content: formatted };
	} catch (error) {
		throw handleControllerError(
			error,
			buildErrorContext(
				"Lokalise Key",
				"bulkDeleteKeys",
				"controllers/keys.controller.ts@bulkDeleteKeys",
				args.projectId,
				{ args, keysCount: args.keyIds.length },
			),
		);
	}
}

/**
 * Export the controller functions
 */
const keysController = {
	listKeys,
	createKeys,
	getKey,
	updateKey,
	deleteKey,
	bulkUpdateKeys,
	bulkDeleteKeys,
};

export default keysController;
