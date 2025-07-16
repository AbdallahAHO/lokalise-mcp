import type {
	ApiError,
	BulkResult,
	BulkUpdateKeyParams,
	CursorPaginatedResult,
	Key,
	KeyDeleted,
	KeyParamsWithPagination,
	KeysBulkDeleted,
	SupportedPlatforms,
	UpdateKeyData,
	UpdateKeyDataWithId,
} from "@lokalise/node-api";
import type { ApiRequestOptions } from "../../shared/types/common.types.js";
import {
	createApiError,
	createUnexpectedError,
} from "../../shared/utils/error.util.js";
import { Logger } from "../../shared/utils/logger.util.js";
import { getLokaliseApi } from "../../shared/utils/lokalise-api.util.js";

// Create a contextualized logger for this file
const serviceLogger = Logger.forContext(
	"services/vendor.lokalise.com.keys.service.ts",
);

// Log service initialization
serviceLogger.debug("Lokalise Keys API service initialized");

/**
 * @namespace VendorLokaliseKeysService
 * @description Service layer for interacting with Lokalise Keys API endpoints.
 *              Uses the official Lokalise SDK for reliable API communication.
 */

/**
 * Parameters for listing keys in a project
 */
export interface KeyListParams extends ApiRequestOptions {
	project_id: string;
	include_translations?: boolean;
	filter_keys?: string[];
	filter_platforms?: string[];
	filter_tags?: string[];
	pagination?: "offset" | "cursor";
	cursor?: string;
}

/**
 * Parameters for creating keys in a project
 */
export interface CreateKeysParams {
	project_id: string;
	keys: Array<{
		key_name: string;
		description?: string;
		platforms: SupportedPlatforms[];
		translations?: Array<{
			language_iso: string;
			translation: string;
		}>;
		tags?: string[];
	}>;
}

/**
 * Parameters for getting a single key
 */
export interface GetKeyParams {
	project_id: string;
	key_id: number;
}

/**
 * Parameters for updating a key
 */
export interface UpdateKeyParams {
	project_id: string;
	key_id: number;
	description?: string;
	platforms?: SupportedPlatforms[];
	tags?: string[];
}

/**
 * Parameters for deleting a key
 */
export interface DeleteKeyParams {
	project_id: string;
	key_id: number;
}

/**
 * Parameters for bulk updating keys
 */
export interface BulkUpdateKeysParams {
	project_id: string;
	keys: Array<{
		key_id: number;
		description?: string;
		platforms?: SupportedPlatforms[];
		tags?: string[];
	}>;
}

/**
 * Parameters for bulk deleting keys
 */
export interface BulkDeleteKeysParams {
	project_id: string;
	key_ids: number[];
}

/**
 * @function getKeys
 * @description Fetches a list of keys from a Lokalise project with optional filtering and pagination.
 * @memberof VendorLokaliseKeysService
 * @param {CursorPaginatedResult} options - Parameters including project ID, filters, and pagination options
 * @returns {Promise<CursorPaginatedResult<Key>>} A promise that resolves to the API response containing the keys list
 * @throws {McpError} Throws an McpError with details if the API call fails
 */
export async function getKeys(
	options: KeyListParams,
): Promise<CursorPaginatedResult<Key>> {
	const methodLogger = serviceLogger.forMethod("getKeys");

	try {
		methodLogger.debug("Calling Lokalise Keys API - list", {
			projectId: options.project_id,
			limit: options.limit,
			page: options.page,
			includeTranslations: options.include_translations,
			pagination: options.pagination,
			cursor: options.cursor ? "present" : "none",
		});

		const api = getLokaliseApi();

		// Prepare API parameters
		const apiParams: KeyParamsWithPagination = {
			project_id: options.project_id,
			limit: options.limit || 100,
			pagination: options.pagination || "cursor",
		};

		if (options.page) {
			apiParams.page = options.page;
		}
		if (options.cursor) {
			apiParams.cursor = options.cursor;
		}
		if (options.include_translations) {
			apiParams.include_translations = 1;
		}
		if (options.filter_keys && options.filter_keys.length > 0) {
			apiParams.filter_keys = options.filter_keys.join(",");
		}
		if (options.filter_platforms && options.filter_platforms.length > 0) {
			apiParams.filter_platforms = options.filter_platforms.join(",");
		}
		if (options.filter_tags && options.filter_tags.length > 0) {
			apiParams.filter_tags = options.filter_tags.join(",");
		}

		const result = await api.keys().list(apiParams);

		methodLogger.debug("Lokalise Keys API call successful", {
			projectId: options.project_id,
			keysCount: result.items?.length || 0,
			hasNextCursor: !!result.nextCursor,
		});

		return result;
	} catch (error: unknown) {
		methodLogger.error("Lokalise Keys API call failed - list", {
			error: (error as Error).message,
			projectId: options.project_id,
		});

		if ((error as ApiError).code === 404) {
			throw createApiError(`Project not found: ${options.project_id}`, 404);
		}
		if ((error as ApiError).code === 403) {
			throw createApiError("Access denied to this project", 403);
		}
		if ((error as ApiError).code === 401) {
			throw createApiError("Invalid API key", 401);
		}

		throw createUnexpectedError(
			`Failed to fetch keys from project ${options.project_id}: ${(error as Error).message}`,
		);
	}
}

/**
 * @function createKeys
 * @description Creates multiple keys in a Lokalise project
 * @memberof VendorLokaliseKeysService
 * @param {CreateKeysParams} options - Parameters including project ID and keys data
 * @returns {Promise<BulkResult<Key>>} A promise that resolves to the API response containing created keys
 * @throws {McpError} Throws an McpError with details if the API call fails
 */
export async function createKeys(
	options: CreateKeysParams,
): Promise<BulkResult<Key>> {
	const methodLogger = serviceLogger.forMethod("createKeys");

	try {
		methodLogger.debug("Calling Lokalise Keys API - create", {
			projectId: options.project_id,
			keysCount: options.keys.length,
		});

		const api = getLokaliseApi();

		// Prepare API parameters
		const apiParams = {
			keys: options.keys.map((key) => ({
				key_name: key.key_name,
				description: key.description,
				platforms: key.platforms,
				translations: key.translations || [],
				tags: key.tags || [],
			})),
		};

		const result = await api
			.keys()
			.create(apiParams, { project_id: options.project_id });

		methodLogger.debug("Lokalise Keys API call successful - create", {
			projectId: options.project_id,
			createdCount: result.items?.length || 0,
			errorsCount: result.errors?.length || 0,
		});

		return result;
	} catch (error: unknown) {
		methodLogger.error("Lokalise Keys API call failed - create", {
			error: (error as Error).message,
			projectId: options.project_id,
		});

		if ((error as ApiError).code === 404) {
			throw createApiError(`Project not found: ${options.project_id}`, 404);
		}
		if ((error as ApiError).code === 403) {
			throw createApiError("Access denied to this project", 403);
		}
		if ((error as ApiError).code === 401) {
			throw createApiError("Invalid API key", 401);
		}

		throw createUnexpectedError(
			`Failed to create keys in project ${options.project_id}: ${(error as Error).message}`,
		);
	}
}

/**
 * @function getKey
 * @description Fetches a single key from a Lokalise project
 * @memberof VendorLokaliseKeysService
 * @param {GetKeyParams} options - Parameters including project ID and key ID
 * @returns {Promise<LokaliseKey>} A promise that resolves to the key data
 * @throws {McpError} Throws an McpError with details if the API call fails
 */
export async function getKey(options: GetKeyParams): Promise<Key> {
	const methodLogger = serviceLogger.forMethod("getKey");

	try {
		methodLogger.debug("Calling Lokalise Keys API - get", {
			projectId: options.project_id,
			keyId: options.key_id,
		});

		const api = getLokaliseApi();
		const result = await api
			.keys()
			.get(options.key_id, { project_id: options.project_id });

		methodLogger.debug("Lokalise Keys API call successful - get", {
			projectId: options.project_id,
			keyId: options.key_id,
			keyName: result.key_name,
		});

		return result;
	} catch (error: unknown) {
		methodLogger.error("Lokalise Keys API call failed - get", {
			error: (error as Error).message,
			projectId: options.project_id,
			keyId: options.key_id,
		});

		if ((error as ApiError).code === 404) {
			throw createApiError(
				`Key not found: ${options.key_id} in project ${options.project_id}`,
				404,
			);
		}
		if ((error as ApiError).code === 403) {
			throw createApiError("Access denied to this project", 403);
		}
		if ((error as ApiError).code === 401) {
			throw createApiError("Invalid API key", 401);
		}

		throw createUnexpectedError(
			`Failed to fetch key ${options.key_id} from project ${options.project_id}: ${(error as Error).message}`,
		);
	}
}

/**
 * @function updateKey
 * @description Updates a single key in a Lokalise project
 * @memberof VendorLokaliseKeysService
 * @param {UpdateKeyParams} options - Parameters including project ID, key ID and update data
 * @returns {Promise<LokaliseKey>} A promise that resolves to the updated key data
 * @throws {McpError} Throws an McpError with details if the API call fails
 */
export async function updateKey(options: UpdateKeyParams): Promise<Key> {
	const methodLogger = serviceLogger.forMethod("updateKey");

	try {
		methodLogger.debug("Calling Lokalise Keys API - update", {
			projectId: options.project_id,
			keyId: options.key_id,
		});

		const api = getLokaliseApi();

		// Prepare update data
		const updateData: UpdateKeyData = {};
		if (options.description !== undefined) {
			updateData.description = options.description;
		}
		if (options.platforms !== undefined) {
			updateData.platforms = options.platforms;
		}
		if (options.tags !== undefined) {
			updateData.tags = options.tags;
		}

		const result = await api
			.keys()
			.update(options.key_id, updateData, { project_id: options.project_id });

		methodLogger.debug("Lokalise Keys API call successful - update", {
			projectId: options.project_id,
			keyId: options.key_id,
			keyName: result.key_name,
		});

		return result;
	} catch (error: unknown) {
		methodLogger.error("Lokalise Keys API call failed - update", {
			error: (error as Error).message,
			projectId: options.project_id,
			keyId: options.key_id,
		});

		if ((error as ApiError).code === 404) {
			throw createApiError(
				`Key not found: ${options.key_id} in project ${options.project_id}`,
				404,
			);
		}
		if ((error as ApiError).code === 403) {
			throw createApiError("Access denied to this project", 403);
		}
		if ((error as ApiError).code === 401) {
			throw createApiError("Invalid API key", 401);
		}

		throw createUnexpectedError(
			`Failed to update key ${options.key_id} in project ${options.project_id}: ${(error as Error).message}`,
		);
	}
}

/**
 * @function deleteKey
 * @description Deletes a single key from a Lokalise project
 * @memberof VendorLokaliseKeysService
 * @param {DeleteKeyParams} options - Parameters including project ID and key ID
 * @returns {Promise<KeysBulkDeleted>} A promise that resolves to the deletion confirmation
 * @throws {McpError} Throws an McpError with details if the API call fails
 */
export async function deleteKey(options: DeleteKeyParams): Promise<KeyDeleted> {
	const methodLogger = serviceLogger.forMethod("deleteKey");

	try {
		methodLogger.debug("Calling Lokalise Keys API - delete", {
			projectId: options.project_id,
			keyId: options.key_id,
		});

		const api = getLokaliseApi();
		const result = await api
			.keys()
			.delete(options.key_id, { project_id: options.project_id });

		methodLogger.debug("Lokalise Keys API call successful - delete", {
			projectId: options.project_id,
			keyId: options.key_id,
		});

		return result;
	} catch (error: unknown) {
		methodLogger.error("Lokalise Keys API call failed - delete", {
			error: (error as Error).message,
			projectId: options.project_id,
			keyId: options.key_id,
		});

		if ((error as ApiError).code === 404) {
			throw createApiError(
				`Key not found: ${options.key_id} in project ${options.project_id}`,
				404,
			);
		}
		if ((error as ApiError).code === 403) {
			throw createApiError("Access denied to this project", 403);
		}
		if ((error as ApiError).code === 401) {
			throw createApiError("Invalid API key", 401);
		}

		throw createUnexpectedError(
			`Failed to delete key ${options.key_id} from project ${options.project_id}: ${(error as Error).message}`,
		);
	}
}

/**
 * @function bulkUpdateKeys
 * @description Updates multiple keys in a Lokalise project
 * @memberof VendorLokaliseKeysService
 * @param {BulkUpdateKeysParams} options - Parameters including project ID and keys update data
 * @returns {Promise<any>} A promise that resolves to the bulk update results
 * @throws {McpError} Throws an McpError with details if the API call fails
 */
export async function bulkUpdateKeys(
	options: BulkUpdateKeysParams,
): Promise<BulkResult<Key>> {
	const methodLogger = serviceLogger.forMethod("bulkUpdateKeys");

	try {
		methodLogger.debug("Calling Lokalise Keys API - bulk update", {
			projectId: options.project_id,
			keysCount: options.keys.length,
		});

		const api = getLokaliseApi();

		// Prepare API parameters
		const apiParams: BulkUpdateKeyParams = {
			keys: options.keys.map((key) => {
				const updateData: UpdateKeyDataWithId = { key_id: key.key_id };
				if (key.description !== undefined) {
					updateData.description = key.description;
				}
				if (key.platforms !== undefined) {
					updateData.platforms = key.platforms;
				}
				if (key.tags !== undefined) {
					updateData.tags = key.tags;
				}
				return updateData;
			}),
		};

		const result = await api
			.keys()
			.bulk_update(apiParams, { project_id: options.project_id });

		methodLogger.debug("Lokalise Keys API call successful - bulk update", {
			projectId: options.project_id,
			updatedCount: result.items?.length || 0,
			errorsCount: result.errors?.length || 0,
		});

		return result;
	} catch (error: unknown) {
		methodLogger.error("Lokalise Keys API call failed - bulk update", {
			error: (error as Error).message,
			projectId: options.project_id,
		});

		if ((error as ApiError).code === 404) {
			throw createApiError(`Project not found: ${options.project_id}`, 404);
		}
		if ((error as ApiError).code === 403) {
			throw createApiError("Access denied to this project", 403);
		}
		if ((error as ApiError).code === 401) {
			throw createApiError("Invalid API key", 401);
		}

		throw createUnexpectedError(
			`Failed to bulk update keys in project ${options.project_id}: ${(error as Error).message}`,
		);
	}
}

/**
 * @function bulkDeleteKeys
 * @description Deletes multiple keys from a Lokalise project
 * @memberof VendorLokaliseKeysService
 * @param {BulkDeleteKeysParams} options - Parameters including project ID and key IDs
 * @returns {Promise<any>} A promise that resolves to the bulk deletion results
 * @throws {McpError} Throws an McpError with details if the API call fails
 */
export async function bulkDeleteKeys(
	options: BulkDeleteKeysParams,
): Promise<KeysBulkDeleted> {
	const methodLogger = serviceLogger.forMethod("bulkDeleteKeys");

	try {
		methodLogger.debug("Calling Lokalise Keys API - bulk delete", {
			projectId: options.project_id,
			keysCount: options.key_ids.length,
		});

		const api = getLokaliseApi();
		const result = await api
			.keys()
			.bulk_delete(options.key_ids, { project_id: options.project_id });

		methodLogger.debug("Lokalise Keys API call successful - bulk delete", {
			projectId: options.project_id,
			deletedCount: options.key_ids.length,
		});

		return result;
	} catch (error: unknown) {
		methodLogger.error("Lokalise Keys API call failed - bulk delete", {
			error: (error as Error).message,
			projectId: options.project_id,
		});

		if ((error as ApiError).code === 404) {
			throw createApiError(`Project not found: ${options.project_id}`, 404);
		}
		if ((error as ApiError).code === 403) {
			throw createApiError("Access denied to this project", 403);
		}
		if ((error as ApiError).code === 401) {
			throw createApiError("Invalid API key", 401);
		}

		throw createUnexpectedError(
			`Failed to bulk delete keys in project ${options.project_id}: ${(error as Error).message}`,
		);
	}
}
