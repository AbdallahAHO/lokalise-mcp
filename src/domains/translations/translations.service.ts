/**
 * Translations Service
 *
 * Service layer for interacting with Lokalise Translations API.
 * Handles all API communication and data transformation.
 */

import type {
	CursorPaginatedResult,
	GetTranslationParams,
	ListTranslationParams,
	Translation,
	UpdateTranslationParams,
} from "@lokalise/node-api";
import { createUnexpectedError } from "../../shared/utils/error.util.js";
import { Logger } from "../../shared/utils/logger.util.js";
import { getLokaliseApi } from "../../shared/utils/lokalise-api.util.js";
import type {
	BulkUpdateTranslationResult,
	BulkUpdateTranslationsSummary,
	BulkUpdateTranslationsToolArgsType,
	GetTranslationToolArgsType,
	ListTranslationsToolArgsType,
	UpdateTranslationToolArgsType,
} from "./translations.types.js";

const logger = Logger.forContext("translations.service.ts");

// ============================================================================
// Service Implementation
// ============================================================================

/**
 * Translations service for Lokalise API operations
 */
export const translationsService = {
	/**
	 * List translations for a project
	 * Note: Translations use cursor pagination, not standard pagination
	 */
	async list(
		args: ListTranslationsToolArgsType,
	): Promise<CursorPaginatedResult<Translation>> {
		const methodLogger = logger.forMethod("list");
		methodLogger.info("Listing translations", {
			projectId: args.projectId,
			cursor: args.cursor,
			limit: args.limit,
			filters: {
				langId: args.filterLangId,
				isReviewed: args.filterIsReviewed,
				unverified: args.filterUnverified,
			},
		});

		try {
			const api = getLokaliseApi();

			// Build params with proper types
			const params: ListTranslationParams = {
				project_id: args.projectId,
				limit: args.limit,
				cursor: args.cursor,
				pagination: "cursor", // Force cursor pagination
			};

			// Add optional filters
			if (args.filterLangId !== undefined) {
				params.filter_lang_id = args.filterLangId;
			}
			if (args.filterIsReviewed !== undefined) {
				params.filter_is_reviewed = args.filterIsReviewed;
			}
			if (args.filterUnverified !== undefined) {
				params.filter_unverified = args.filterUnverified;
			}
			if (args.filterUntranslated !== undefined) {
				params.filter_untranslated = args.filterUntranslated;
			}
			if (args.filterQaIssues !== undefined) {
				params.filter_qa_issues = args.filterQaIssues;
			}
			if (args.filterActiveTaskId !== undefined) {
				params.filter_active_task_id = args.filterActiveTaskId;
			}
			if (args.disableReferences !== undefined) {
				params.disable_references = args.disableReferences;
			}

			const result = await api.translations().list(params);

			methodLogger.info("Listed translations successfully", {
				projectId: args.projectId,
				count: result.items.length,
				hasNextCursor: result.hasNextCursor(),
				nextCursor: result.nextCursor,
			});

			return result;
		} catch (error) {
			methodLogger.error("Failed to list translations", { error, args });
			throw createUnexpectedError(
				`Failed to list translations for project ${args.projectId}`,
				error,
			);
		}
	},

	/**
	 * Get a specific translation
	 */
	async get(args: GetTranslationToolArgsType): Promise<Translation> {
		const methodLogger = logger.forMethod("get");
		methodLogger.info("Getting translation", {
			projectId: args.projectId,
			translationId: args.translationId,
		});

		try {
			const api = getLokaliseApi();

			// Build params
			const params: GetTranslationParams = {
				project_id: args.projectId,
			};

			if (args.disableReferences !== undefined) {
				params.disable_references = args.disableReferences;
			}

			const result = await api.translations().get(args.translationId, params);

			methodLogger.info("Retrieved translation successfully", {
				projectId: args.projectId,
				translationId: args.translationId,
				keyId: result.key_id,
				languageIso: result.language_iso,
			});

			return result;
		} catch (error) {
			methodLogger.error("Failed to get translation", { error, args });
			throw createUnexpectedError(
				`Failed to get translation ${args.translationId} from project ${args.projectId}`,
				error,
			);
		}
	},

	/**
	 * Update a translation
	 */
	async update(args: UpdateTranslationToolArgsType): Promise<Translation> {
		const methodLogger = logger.forMethod("update");
		methodLogger.info("Updating translation", {
			projectId: args.projectId,
			translationId: args.translationId,
			data: args.translationData,
		});

		try {
			const api = getLokaliseApi();

			// Build update data with SDK types
			const updateData: UpdateTranslationParams = {
				translation: args.translationData.translation,
			};

			// Map optional fields
			if (args.translationData.isReviewed !== undefined) {
				updateData.is_reviewed = args.translationData.isReviewed;
			}
			if (args.translationData.isUnverified !== undefined) {
				updateData.is_unverified = args.translationData.isUnverified;
			}
			if (args.translationData.customTranslationStatusIds !== undefined) {
				updateData.custom_translation_status_ids =
					args.translationData.customTranslationStatusIds;
			}

			const result = await api
				.translations()
				.update(args.translationId, updateData, { project_id: args.projectId });

			methodLogger.info("Updated translation successfully", {
				projectId: args.projectId,
				translationId: args.translationId,
				isReviewed: result.is_reviewed,
				isUnverified: result.is_unverified,
			});

			return result;
		} catch (error) {
			methodLogger.error("Failed to update translation", { error, args });
			throw createUnexpectedError(
				`Failed to update translation ${args.translationId} in project ${args.projectId}`,
				error,
			);
		}
	},

	/**
	 * Bulk update multiple translations with rate limiting and retry logic
	 */
	async bulkUpdate(
		args: BulkUpdateTranslationsToolArgsType,
	): Promise<BulkUpdateTranslationsSummary> {
		const methodLogger = logger.forMethod("bulkUpdate");
		methodLogger.info("Starting bulk translation update", {
			projectId: args.projectId,
			updateCount: args.updates.length,
		});

		const startTime = Date.now();
		const results: BulkUpdateTranslationResult[] = [];
		const RATE_LIMIT_DELAY = 200; // 200ms delay = max 5 requests/second
		const MAX_RETRY_ATTEMPTS = 3;
		const RETRY_DELAY = 1000; // 1 second delay between retries

		// Helper function to update a single translation with retry logic
		const updateWithRetry = async (
			update: (typeof args.updates)[0],
			attemptNumber = 1,
		): Promise<BulkUpdateTranslationResult> => {
			try {
				const updateArgs: UpdateTranslationToolArgsType = {
					projectId: args.projectId,
					translationId: update.translationId,
					translationData: update.translationData,
				};

				const translation = await this.update(updateArgs);

				return {
					translationId: update.translationId,
					success: true,
					translation,
					attempts: attemptNumber,
				};
			} catch (error) {
				const errorMessage =
					error instanceof Error ? error.message : String(error);

				if (attemptNumber < MAX_RETRY_ATTEMPTS) {
					methodLogger.warn(
						`Translation update failed, retrying (attempt ${attemptNumber}/${MAX_RETRY_ATTEMPTS})`,
						{
							translationId: update.translationId,
							error: errorMessage,
							attemptNumber,
						},
					);

					// Wait before retry
					await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY));

					// Retry
					return updateWithRetry(update, attemptNumber + 1);
				}

				// Max retries reached, record as failure
				methodLogger.error("Translation update failed after max retries", {
					translationId: update.translationId,
					error: errorMessage,
					attempts: attemptNumber,
				});

				return {
					translationId: update.translationId,
					success: false,
					error: errorMessage,
					attempts: attemptNumber,
				};
			}
		};

		// Process updates sequentially with rate limiting
		for (let i = 0; i < args.updates.length; i++) {
			const update = args.updates[i];

			methodLogger.info(
				`Processing translation ${i + 1}/${args.updates.length}`,
				{
					translationId: update.translationId,
				},
			);

			// Perform the update
			const result = await updateWithRetry(update);
			results.push(result);

			// Rate limiting: delay before next request (except for the last one)
			if (i < args.updates.length - 1) {
				await new Promise((resolve) => setTimeout(resolve, RATE_LIMIT_DELAY));
			}
		}

		// Calculate summary
		const duration = Date.now() - startTime;
		const successCount = results.filter((r) => r.success).length;
		const failureCount = results.filter((r) => !r.success).length;

		const summary: BulkUpdateTranslationsSummary = {
			totalRequested: args.updates.length,
			successCount,
			failureCount,
			results,
			duration,
		};

		methodLogger.info("Bulk translation update completed", {
			projectId: args.projectId,
			totalRequested: summary.totalRequested,
			successCount: summary.successCount,
			failureCount: summary.failureCount,
			durationMs: summary.duration,
		});

		return summary;
	},
};

/**
 * Implementation Notes:
 *
 * 1. Translations use CURSOR PAGINATION, not standard page/limit pagination
 * 2. Filter by language ID requires numeric ID, not ISO code
 * 3. Review and verification statuses are important for translation workflow
 * 4. Translation content can be string or object (for plural forms)
 * 5. Custom translation statuses allow for custom workflow states
 */
