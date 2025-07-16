/**
 * Glossary Service
 *
 * Service layer for interacting with Lokalise Glossary API.
 * Handles all API communication and data transformation.
 */

import type {
	BulkResult,
	CursorPaginatedResult,
	GlossaryTerm,
} from "@lokalise/node-api";
import { createUnexpectedError } from "../../shared/utils/error.util.js";
import { Logger } from "../../shared/utils/logger.util.js";
import { getLokaliseApi } from "../../shared/utils/lokalise-api.util.js";
import type {
	CreateGlossaryToolArgsType,
	CreateTermsParams,
	DeleteGlossaryToolArgsType,
	GetGlossaryToolArgsType,
	ListGlossaryToolArgsType,
	TermsDeleted,
	UpdateGlossaryToolArgsType,
	UpdateTermsParams,
} from "./glossary.types.js";

const logger = Logger.forContext("glossary.service.ts");

// ============================================================================
// Service Implementation
// ============================================================================

/**
 * Glossary service for Lokalise API operations
 */
export const glossaryService = {
	/**
	 * List glossary terms for a project with cursor pagination
	 */
	async list(
		args: ListGlossaryToolArgsType,
	): Promise<CursorPaginatedResult<GlossaryTerm>> {
		const methodLogger = logger.forMethod("list");
		methodLogger.info("Listing glossary terms", {
			projectId: args.projectId,
			cursor: args.cursor,
			limit: args.limit,
		});

		try {
			const api = getLokaliseApi();
			const result = await api.glossaryTerms().list({
				project_id: args.projectId,
				cursor: args.cursor,
				limit: args.limit,
			});

			methodLogger.info("Listed glossary terms successfully", {
				projectId: args.projectId,
				count: result.items.length,
				hasNextCursor: result.hasNextCursor(),
			});

			return result;
		} catch (error) {
			methodLogger.error("Failed to list glossary terms", { error, args });
			throw createUnexpectedError(
				`Failed to list glossary terms for project ${args.projectId}`,
				error,
			);
		}
	},

	/**
	 * Get a specific glossary term
	 */
	async get(args: GetGlossaryToolArgsType): Promise<GlossaryTerm> {
		const methodLogger = logger.forMethod("get");
		methodLogger.info("Getting glossary term", {
			projectId: args.projectId,
			termId: args.termId,
		});

		try {
			const api = getLokaliseApi();
			const result = await api.glossaryTerms().get(args.termId, {
				project_id: args.projectId,
			});

			methodLogger.info("Retrieved glossary term successfully", {
				projectId: args.projectId,
				termId: args.termId,
				term: result.term,
			});

			return result;
		} catch (error) {
			methodLogger.error("Failed to get glossary term", { error, args });
			throw createUnexpectedError(
				`Failed to get glossary term ${args.termId} from project ${args.projectId}`,
				error,
			);
		}
	},

	/**
	 * Create glossary terms (bulk operation)
	 */
	async create(
		args: CreateGlossaryToolArgsType,
	): Promise<BulkResult<GlossaryTerm>> {
		const methodLogger = logger.forMethod("create");
		methodLogger.info("Creating glossary terms", {
			projectId: args.projectId,
			count: args.terms.length,
		});

		try {
			const api = getLokaliseApi();

			// Map our schema to SDK types
			const createParams: CreateTermsParams = {
				terms: args.terms.map((term) => ({
					term: term.term,
					description: term.description,
					caseSensitive: term.caseSensitive,
					translatable: term.translatable,
					forbidden: term.forbidden,
					translations: term.translations?.map((t) => ({
						langId: t.langId,
						translation: t.translation,
						description: t.description,
					})),
					tags: term.tags,
				})),
			};

			const result = await api.glossaryTerms().create(createParams, {
				project_id: args.projectId,
			});

			methodLogger.info("Created glossary terms successfully", {
				projectId: args.projectId,
				created: result.items.length,
				errors: result.errors?.length || 0,
			});

			return result;
		} catch (error) {
			methodLogger.error("Failed to create glossary terms", { error, args });
			throw createUnexpectedError(
				`Failed to create glossary terms in project ${args.projectId}`,
				error,
			);
		}
	},

	/**
	 * Update glossary terms (bulk operation)
	 */
	async update(
		args: UpdateGlossaryToolArgsType,
	): Promise<BulkResult<GlossaryTerm>> {
		const methodLogger = logger.forMethod("update");
		methodLogger.info("Updating glossary terms", {
			projectId: args.projectId,
			count: args.terms.length,
		});

		try {
			const api = getLokaliseApi();

			// Build update data
			const updateParams: UpdateTermsParams = {
				terms: args.terms.map((term) => ({
					id: term.id,
					term: term.term,
					description: term.description,
					caseSensitive: term.caseSensitive,
					translatable: term.translatable,
					forbidden: term.forbidden,
					translations: term.translations?.map((t) => ({
						langId: t.langId,
						translation: t.translation,
						description: t.description,
					})),
					tags: term.tags,
				})),
			};

			const result = await api.glossaryTerms().update(updateParams, {
				project_id: args.projectId,
			});

			methodLogger.info("Updated glossary terms successfully", {
				projectId: args.projectId,
				updated: result.items.length,
				errors: result.errors?.length || 0,
			});

			return result;
		} catch (error) {
			methodLogger.error("Failed to update glossary terms", { error, args });
			throw createUnexpectedError(
				`Failed to update glossary terms in project ${args.projectId}`,
				error,
			);
		}
	},

	/**
	 * Delete glossary terms (bulk operation)
	 */
	async delete(args: DeleteGlossaryToolArgsType): Promise<TermsDeleted> {
		const methodLogger = logger.forMethod("delete");
		methodLogger.info("Deleting glossary terms", {
			projectId: args.projectId,
			termIds: args.termIds,
		});

		try {
			const api = getLokaliseApi();
			const result = await api.glossaryTerms().delete(args.termIds, {
				project_id: args.projectId,
			});

			methodLogger.info("Deleted glossary terms", {
				projectId: args.projectId,
				deleted: result.deleted.count,
				failed: result.failed?.length || 0,
			});

			return result;
		} catch (error) {
			methodLogger.error("Failed to delete glossary terms", { error, args });
			throw createUnexpectedError(
				`Failed to delete glossary terms from project ${args.projectId}`,
				error,
			);
		}
	},
};

/**
 * Glossary Service Implementation
 *
 * This service implements all glossary term operations using the Lokalise API.
 * Glossary terms help maintain consistency by defining key terminology with
 * specific translation guidelines.
 *
 * Key features:
 * - Cursor-based pagination for efficient large dataset handling
 * - Bulk operations for create, update, and delete
 * - Support for term translations in multiple languages
 * - Configurable term properties (case sensitivity, translatable, forbidden)
 */
