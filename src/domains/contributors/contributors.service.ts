/**
 * Contributors Service
 *
 * Service layer for interacting with Lokalise Contributors API.
 * Handles all API communication and data transformation.
 */

import type {
	Contributor,
	ContributorCreateData,
	ContributorDeleted,
	ContributorRights,
	ContributorUpdateData,
	PaginatedResult,
} from "@lokalise/node-api";
import { createUnexpectedError } from "../../shared/utils/error.util.js";
import { getLokaliseApi } from "../../shared/utils/lokalise-api.util.js";
import { Logger } from "../../shared/utils/logger.util.js";
import type {
	AddContributorsToolArgsType,
	GetContributorToolArgsType,
	GetCurrentUserToolArgsType,
	ListContributorsToolArgsType,
	RemoveContributorToolArgsType,
	UpdateContributorToolArgsType,
} from "./contributors.types.js";

const logger = Logger.forContext("contributors.service.ts");

// ============================================================================
// Service Implementation
// ============================================================================

/**
 * Contributors service for Lokalise API operations
 */
export const contributorsService = {
	/**
	 * List contributors for a project
	 */
	async list(
		args: ListContributorsToolArgsType,
	): Promise<PaginatedResult<Contributor>> {
		const methodLogger = logger.forMethod("list");
		methodLogger.info("Listing contributors", {
			projectId: args.projectId,
			page: args.page,
			limit: args.limit,
		});

		try {
			const api = getLokaliseApi();
			const result = await api.contributors().list({
				project_id: args.projectId,
				page: args.page,
				limit: args.limit,
			});

			methodLogger.info("Listed contributors successfully", {
				projectId: args.projectId,
				count: result.items.length,
				totalResults: result.totalResults,
			});

			return result;
		} catch (error) {
			methodLogger.error("Failed to list contributors", { error, args });
			throw createUnexpectedError(
				`Failed to list contributors for project ${args.projectId}`,
				error,
			);
		}
	},

	/**
	 * Add contributors to a project
	 */
	async create(args: AddContributorsToolArgsType): Promise<Contributor[]> {
		const methodLogger = logger.forMethod("create");
		methodLogger.info("Adding contributors", {
			projectId: args.projectId,
			count: args.contributors.length,
		});

		try {
			const api = getLokaliseApi();

			// Map our schema to SDK types
			const contributorData: ContributorCreateData[] = args.contributors.map(
				(c) => ({
					email: c.email,
					fullname: c.fullname,
					is_admin: c.is_admin,
					is_reviewer: c.is_reviewer,
					languages: c.languages,
					admin_rights: c.admin_rights as ContributorRights[], // SDK typing issue with enum array
				}),
			);

			const result = await api.contributors().create(contributorData, {
				project_id: args.projectId,
			});

			methodLogger.info("Added contributors successfully", {
				projectId: args.projectId,
				added: result.length,
			});

			return result;
		} catch (error) {
			methodLogger.error("Failed to add contributors", { error, args });
			throw createUnexpectedError(
				`Failed to add contributors to project ${args.projectId}`,
				error,
			);
		}
	},

	/**
	 * Get a specific contributor
	 */
	async get(args: GetContributorToolArgsType): Promise<Contributor> {
		const methodLogger = logger.forMethod("get");
		methodLogger.info("Getting contributor", {
			projectId: args.projectId,
			contributorId: args.contributorId,
		});

		try {
			const api = getLokaliseApi();
			const result = await api.contributors().get(args.contributorId, {
				project_id: args.projectId,
			});

			methodLogger.info("Retrieved contributor successfully", {
				projectId: args.projectId,
				contributorId: args.contributorId,
				email: result.email,
			});

			return result;
		} catch (error) {
			methodLogger.error("Failed to get contributor", { error, args });
			throw createUnexpectedError(
				`Failed to get contributor ${args.contributorId} from project ${args.projectId}`,
				error,
			);
		}
	},

	/**
	 * Get current user's contributor profile
	 */
	async me(args: GetCurrentUserToolArgsType): Promise<Contributor> {
		const methodLogger = logger.forMethod("me");
		methodLogger.info("Getting current user contributor profile", {
			projectId: args.projectId,
		});

		try {
			const api = getLokaliseApi();
			const result = await api.contributors().me({
				project_id: args.projectId,
			});

			methodLogger.info("Retrieved current user profile successfully", {
				projectId: args.projectId,
				userId: result.user_id,
				email: result.email,
			});

			return result;
		} catch (error) {
			methodLogger.error("Failed to get current user profile", { error, args });
			throw createUnexpectedError(
				`Failed to get current user profile for project ${args.projectId}`,
				error,
			);
		}
	},

	/**
	 * Update a contributor
	 */
	async update(args: UpdateContributorToolArgsType): Promise<Contributor> {
		const methodLogger = logger.forMethod("update");
		methodLogger.info("Updating contributor", {
			projectId: args.projectId,
			contributorId: args.contributorId,
		});

		try {
			const api = getLokaliseApi();

			// Build update data
			const updateData: ContributorUpdateData = {};
			if (args.is_admin !== undefined) updateData.is_admin = args.is_admin;
			if (args.is_reviewer !== undefined)
				updateData.is_reviewer = args.is_reviewer;
			if (args.languages) updateData.languages = args.languages;
			if (args.admin_rights)
				updateData.admin_rights = args.admin_rights as ContributorRights[];

			const result = await api
				.contributors()
				.update(args.contributorId, updateData, { project_id: args.projectId });

			methodLogger.info("Updated contributor successfully", {
				projectId: args.projectId,
				contributorId: args.contributorId,
			});

			return result;
		} catch (error) {
			methodLogger.error("Failed to update contributor", { error, args });
			throw createUnexpectedError(
				`Failed to update contributor ${args.contributorId} in project ${args.projectId}`,
				error,
			);
		}
	},

	/**
	 * Remove a contributor from a project
	 */
	async delete(
		args: RemoveContributorToolArgsType,
	): Promise<ContributorDeleted> {
		const methodLogger = logger.forMethod("delete");
		methodLogger.info("Removing contributor", {
			projectId: args.projectId,
			contributorId: args.contributorId,
		});

		try {
			const api = getLokaliseApi();
			const result = await api.contributors().delete(args.contributorId, {
				project_id: args.projectId,
			});

			methodLogger.info("Removed contributor successfully", {
				projectId: args.projectId,
				contributorId: args.contributorId,
			});

			return result;
		} catch (error) {
			methodLogger.error("Failed to remove contributor", { error, args });
			throw createUnexpectedError(
				`Failed to remove contributor ${args.contributorId} from project ${args.projectId}`,
				error,
			);
		}
	},
};
