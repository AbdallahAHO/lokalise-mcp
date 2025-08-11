/**
 * Teamusers Service
 *
 * Service layer for interacting with Lokalise Team Users API.
 * Handles all API communication and data transformation.
 */

import type {
	PaginatedResult,
	TeamUser,
	TeamUserDeleted,
	TeamUserParams,
} from "@lokalise/node-api";
import { createUnexpectedError } from "../../shared/utils/error.util.js";
import { Logger } from "../../shared/utils/logger.util.js";
import { getLokaliseApi } from "../../shared/utils/lokalise-api.util.js";
import type {
	DeleteTeamusersToolArgsType,
	GetTeamusersToolArgsType,
	ListTeamusersToolArgsType,
	UpdateTeamusersToolArgsType,
} from "./teamusers.types.js";

const logger = Logger.forContext("teamusers.service.ts");

// ============================================================================
// Service Implementation
// ============================================================================

/**
 * Teamusers service for Lokalise API operations
 */
export const teamusersService = {
	/**
	 * List team users
	 */
	async list(
		args: ListTeamusersToolArgsType,
	): Promise<PaginatedResult<TeamUser>> {
		const methodLogger = logger.forMethod("list");
		methodLogger.info("Listing team users", {
			teamId: args.teamId,
			page: args.page,
			limit: args.limit,
		});

		try {
			const api = getLokaliseApi();
			const result = await api.teamUsers().list({
				team_id: args.teamId,
				page: args.page,
				limit: args.limit,
			});

			methodLogger.info("Listed team users successfully", {
				teamId: args.teamId,
				count: result.items.length,
				totalResults: result.totalResults,
			});

			return result;
		} catch (error) {
			methodLogger.error("Failed to list team users", { error, args });
			throw createUnexpectedError(
				`Failed to list team users for team ${args.teamId}`,
				error,
			);
		}
	},

	/**
	 * Get a specific team user
	 */
	async get(args: GetTeamusersToolArgsType): Promise<TeamUser> {
		const methodLogger = logger.forMethod("get");
		methodLogger.info("Getting team user", {
			teamId: args.teamId,
			userId: args.userId,
		});

		try {
			const api = getLokaliseApi();
			const result = await api.teamUsers().get(args.userId, {
				team_id: args.teamId,
			});

			methodLogger.info("Retrieved team user successfully", {
				teamId: args.teamId,
				userId: args.userId,
			});

			return result;
		} catch (error) {
			methodLogger.error("Failed to get team user", { error, args });
			throw createUnexpectedError(
				`Failed to get team user ${args.userId} from team ${args.teamId}`,
				error,
			);
		}
	},

	/**
	 * Update a team user's role
	 */
	async update(args: UpdateTeamusersToolArgsType): Promise<TeamUser> {
		const methodLogger = logger.forMethod("update");
		methodLogger.info("Updating team user", {
			teamId: args.teamId,
			userId: args.userId,
			role: args.role,
		});

		try {
			const api = getLokaliseApi();
			const updateParams: TeamUserParams = {
				role: args.role,
			};

			const result = await api
				.teamUsers()
				.update(args.userId, updateParams, { team_id: args.teamId });

			methodLogger.info("Updated team user successfully", {
				teamId: args.teamId,
				userId: args.userId,
				newRole: args.role,
			});

			return result;
		} catch (error) {
			methodLogger.error("Failed to update team user", { error, args });
			throw createUnexpectedError(
				`Failed to update team user ${args.userId} in team ${args.teamId}`,
				error,
			);
		}
	},

	/**
	 * Delete a team user
	 */
	async delete(args: DeleteTeamusersToolArgsType): Promise<TeamUserDeleted> {
		const methodLogger = logger.forMethod("delete");
		methodLogger.info("Deleting team user", {
			teamId: args.teamId,
			userId: args.userId,
		});

		try {
			const api = getLokaliseApi();
			const result = await api.teamUsers().delete(args.userId, {
				team_id: args.teamId,
			});

			methodLogger.info("Deleted team user successfully", {
				teamId: args.teamId,
				userId: args.userId,
			});

			return result;
		} catch (error) {
			methodLogger.error("Failed to delete team user", { error, args });
			throw createUnexpectedError(
				`Failed to delete team user ${args.userId} from team ${args.teamId}`,
				error,
			);
		}
	},
};
