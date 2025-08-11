/**
 * Queuedprocesses Service
 *
 * Service layer for interacting with Lokalise Queued Processes API.
 * Handles all API communication and data transformation.
 */

import type { PaginatedResult, QueuedProcess } from "@lokalise/node-api";
import { createUnexpectedError } from "../../shared/utils/error.util.js";
import { Logger } from "../../shared/utils/logger.util.js";
import { getLokaliseApi } from "../../shared/utils/lokalise-api.util.js";
import type {
	GetQueuedprocessesToolArgsType,
	ListQueuedprocessesToolArgsType,
} from "./queuedprocesses.types.js";

const logger = Logger.forContext("queuedprocesses.service.ts");

// ============================================================================
// Service Implementation
// ============================================================================

/**
 * Queuedprocesses service for Lokalise API operations
 */
export const queuedprocessesService = {
	/**
	 * List queued processes for a project
	 */
	async list(
		args: ListQueuedprocessesToolArgsType,
	): Promise<PaginatedResult<QueuedProcess>> {
		const methodLogger = logger.forMethod("list");
		methodLogger.info("Listing queued processes", {
			projectId: args.projectId,
			page: args.page,
			limit: args.limit,
		});

		try {
			const api = getLokaliseApi();
			const result = await api.queuedProcesses().list({
				project_id: args.projectId,
				page: args.page,
				limit: args.limit,
			});

			methodLogger.info("Listed queued processes successfully", {
				projectId: args.projectId,
				count: result.items.length,
				totalResults: result.totalResults,
			});

			return result;
		} catch (error) {
			methodLogger.error("Failed to list queued processes", { error, args });
			throw createUnexpectedError(
				`Failed to list queued processes for project ${args.projectId}`,
				error,
			);
		}
	},

	/**
	 * Get a specific queued process
	 */
	async get(args: GetQueuedprocessesToolArgsType): Promise<QueuedProcess> {
		const methodLogger = logger.forMethod("get");
		methodLogger.info("Getting queued process", {
			projectId: args.projectId,
			processId: args.processId,
		});

		try {
			const api = getLokaliseApi();
			const result = await api.queuedProcesses().get(args.processId, {
				project_id: args.projectId,
			});

			methodLogger.info("Retrieved queued process successfully", {
				projectId: args.projectId,
				processId: args.processId,
			});

			return result;
		} catch (error) {
			methodLogger.error("Failed to get queued process", { error, args });
			throw createUnexpectedError(
				`Failed to get queued process ${args.processId} from project ${args.projectId}`,
				error,
			);
		}
	},
};
