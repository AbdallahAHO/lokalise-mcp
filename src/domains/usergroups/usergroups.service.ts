/**
 * Usergroups Service
 *
 * Service layer for interacting with Lokalise User Groups API.
 * Handles all API communication and data transformation.
 */

import type {
	ContributorRights,
	PaginatedResult,
	UserGroup,
	UserGroupDeleted,
	UserGroupParams,
} from "@lokalise/node-api";

// Define local type for GroupLanguages since it's not exported from SDK
type GroupLanguages = {
	reference: string[];
	contributable: string[];
};

import { createUnexpectedError } from "../../shared/utils/error.util.js";
import { Logger } from "../../shared/utils/logger.util.js";
import { getLokaliseApi } from "../../shared/utils/lokalise-api.util.js";
import type {
	AddMembersToolArgsType,
	AddProjectsToolArgsType,
	CreateUsergroupsToolArgsType,
	DeleteUsergroupsToolArgsType,
	GetUsergroupsToolArgsType,
	ListUsergroupsToolArgsType,
	RemoveMembersToolArgsType,
	RemoveProjectsToolArgsType,
	UpdateUsergroupsToolArgsType,
} from "./usergroups.types.js";

const logger = Logger.forContext("usergroups.service.ts");

// ============================================================================
// Service Implementation
// ============================================================================

/**
 * User Groups service for Lokalise API operations
 */
export const usergroupsService = {
	/**
	 * List user groups for a team
	 */
	async list(
		args: ListUsergroupsToolArgsType,
	): Promise<PaginatedResult<UserGroup>> {
		const methodLogger = logger.forMethod("list");
		methodLogger.info("Listing user groups", {
			teamId: args.teamId,
			page: args.page,
			limit: args.limit,
		});

		try {
			const api = getLokaliseApi();
			const result = await api.userGroups().list({
				team_id: args.teamId,
				page: args.page,
				limit: args.limit,
			});

			methodLogger.info("Listed user groups successfully", {
				teamId: args.teamId,
				count: result.items.length,
				totalResults: result.totalResults,
			});

			return result;
		} catch (error) {
			methodLogger.error("Failed to list user groups", { error, args });
			throw createUnexpectedError(
				`Failed to list user groups for team ${args.teamId}`,
				error,
			);
		}
	},

	/**
	 * Get a specific user group
	 */
	async get(args: GetUsergroupsToolArgsType): Promise<UserGroup> {
		const methodLogger = logger.forMethod("get");
		methodLogger.info("Getting user group", {
			teamId: args.teamId,
			groupId: args.groupId,
		});

		try {
			const api = getLokaliseApi();
			const result = await api.userGroups().get(args.groupId, {
				team_id: args.teamId,
			});

			methodLogger.info("Retrieved user group successfully", {
				teamId: args.teamId,
				groupId: args.groupId,
			});

			return result;
		} catch (error) {
			methodLogger.error("Failed to get user group", { error, args });
			throw createUnexpectedError(
				`Failed to get user group ${args.groupId} from team ${args.teamId}`,
				error,
			);
		}
	},

	/**
	 * Create a user group
	 */
	async create(args: CreateUsergroupsToolArgsType): Promise<UserGroup> {
		const methodLogger = logger.forMethod("create");
		methodLogger.info("Creating user group", {
			teamId: args.teamId,
			name: args.name,
		});

		try {
			const api = getLokaliseApi();

			// Map our schema to SDK types
			const groupParams: UserGroupParams = {
				name: args.name,
				is_reviewer: args.isReviewer,
				is_admin: args.isAdmin,
				admin_rights: args.adminRights as ContributorRights[] | undefined,
				// Note: SDK expects different structure for languages - using type assertion
				languages: args.languages as unknown as GroupLanguages | undefined,
			};

			const result = await api.userGroups().create(groupParams, {
				team_id: args.teamId,
			});

			// Add members if provided
			if (args.members && args.members.length > 0) {
				try {
					// Convert to proper array type for SDK
					const memberIds = args.members.map((id) =>
						typeof id === "string" ? id : id.toString(),
					);
					await api
						.userGroups()
						.add_members_to_group(args.teamId, result.group_id, memberIds);
				} catch (memberError) {
					methodLogger.warn("Failed to add initial members to group", {
						groupId: result.group_id,
						error: memberError,
					});
				}
			}

			// Add projects if provided
			if (args.projects && args.projects.length > 0) {
				try {
					// Convert to proper array type for SDK
					const projectIds = args.projects.map((id) =>
						typeof id === "string" ? id : id.toString(),
					);
					await api
						.userGroups()
						.add_projects_to_group(args.teamId, result.group_id, projectIds);
				} catch (projectError) {
					methodLogger.warn("Failed to add initial projects to group", {
						groupId: result.group_id,
						error: projectError,
					});
				}
			}

			methodLogger.info("Created user group successfully", {
				teamId: args.teamId,
				groupId: result.group_id,
			});

			return result;
		} catch (error) {
			methodLogger.error("Failed to create user group", { error, args });
			throw createUnexpectedError(
				`Failed to create user group in team ${args.teamId}`,
				error,
			);
		}
	},

	/**
	 * Update a user group
	 */
	async update(args: UpdateUsergroupsToolArgsType): Promise<UserGroup> {
		const methodLogger = logger.forMethod("update");
		methodLogger.info("Updating user group", {
			teamId: args.teamId,
			groupId: args.groupId,
		});

		try {
			const api = getLokaliseApi();

			// Build update data
			const updateParams: UserGroupParams = {
				name: args.name,
				is_reviewer: args.isReviewer,
				is_admin: args.isAdmin,
				admin_rights: args.adminRights as ContributorRights[] | undefined,
				// Note: SDK expects different structure for languages - using type assertion
				languages: args.languages as unknown as GroupLanguages | undefined,
			};

			const result = await api
				.userGroups()
				.update(args.groupId, updateParams, { team_id: args.teamId });

			methodLogger.info("Updated user group successfully", {
				teamId: args.teamId,
				groupId: args.groupId,
			});

			return result;
		} catch (error) {
			methodLogger.error("Failed to update user group", { error, args });
			throw createUnexpectedError(
				`Failed to update user group ${args.groupId} in team ${args.teamId}`,
				error,
			);
		}
	},

	/**
	 * Delete a user group
	 */
	async delete(args: DeleteUsergroupsToolArgsType): Promise<UserGroupDeleted> {
		const methodLogger = logger.forMethod("delete");
		methodLogger.info("Deleting user group", {
			teamId: args.teamId,
			groupId: args.groupId,
		});

		try {
			const api = getLokaliseApi();
			const result = await api.userGroups().delete(args.groupId, {
				team_id: args.teamId,
			});

			methodLogger.info("Deleted user group successfully", {
				teamId: args.teamId,
				groupId: args.groupId,
			});

			return result;
		} catch (error) {
			methodLogger.error("Failed to delete user group", { error, args });
			throw createUnexpectedError(
				`Failed to delete user group ${args.groupId} from team ${args.teamId}`,
				error,
			);
		}
	},

	/**
	 * Add members to a user group
	 */
	async addMembers(args: AddMembersToolArgsType): Promise<UserGroup> {
		const methodLogger = logger.forMethod("addMembers");
		methodLogger.info("Adding members to user group", {
			teamId: args.teamId,
			groupId: args.groupId,
			userCount: args.userIds.length,
		});

		try {
			const api = getLokaliseApi();
			// Convert user IDs to proper array type for SDK
			const userIds = args.userIds.map((id) =>
				typeof id === "string" ? id : id.toString(),
			);
			const result = await api
				.userGroups()
				.add_members_to_group(args.teamId, args.groupId, userIds);

			methodLogger.info("Added members to user group successfully", {
				teamId: args.teamId,
				groupId: args.groupId,
				addedCount: args.userIds.length,
			});

			return result;
		} catch (error) {
			methodLogger.error("Failed to add members to user group", {
				error,
				args,
			});
			throw createUnexpectedError(
				`Failed to add members to user group ${args.groupId}`,
				error,
			);
		}
	},

	/**
	 * Remove members from a user group
	 */
	async removeMembers(args: RemoveMembersToolArgsType): Promise<UserGroup> {
		const methodLogger = logger.forMethod("removeMembers");
		methodLogger.info("Removing members from user group", {
			teamId: args.teamId,
			groupId: args.groupId,
			userCount: args.userIds.length,
		});

		try {
			const api = getLokaliseApi();
			// Convert user IDs to proper array type for SDK
			const userIds = args.userIds.map((id) =>
				typeof id === "string" ? id : id.toString(),
			);
			const result = await api
				.userGroups()
				.remove_members_from_group(args.teamId, args.groupId, userIds);

			methodLogger.info("Removed members from user group successfully", {
				teamId: args.teamId,
				groupId: args.groupId,
				removedCount: args.userIds.length,
			});

			return result;
		} catch (error) {
			methodLogger.error("Failed to remove members from user group", {
				error,
				args,
			});
			throw createUnexpectedError(
				`Failed to remove members from user group ${args.groupId}`,
				error,
			);
		}
	},

	/**
	 * Add projects to a user group
	 */
	async addProjects(args: AddProjectsToolArgsType): Promise<UserGroup> {
		const methodLogger = logger.forMethod("addProjects");
		methodLogger.info("Adding projects to user group", {
			teamId: args.teamId,
			groupId: args.groupId,
			projectCount: args.projectIds.length,
		});

		try {
			const api = getLokaliseApi();
			// Convert project IDs to proper array type for SDK
			const projectIds = args.projectIds.map((id) =>
				typeof id === "string" ? id : id.toString(),
			);
			const result = await api
				.userGroups()
				.add_projects_to_group(args.teamId, args.groupId, projectIds);

			methodLogger.info("Added projects to user group successfully", {
				teamId: args.teamId,
				groupId: args.groupId,
				addedCount: args.projectIds.length,
			});

			return result;
		} catch (error) {
			methodLogger.error("Failed to add projects to user group", {
				error,
				args,
			});
			throw createUnexpectedError(
				`Failed to add projects to user group ${args.groupId}`,
				error,
			);
		}
	},

	/**
	 * Remove projects from a user group
	 */
	async removeProjects(args: RemoveProjectsToolArgsType): Promise<UserGroup> {
		const methodLogger = logger.forMethod("removeProjects");
		methodLogger.info("Removing projects from user group", {
			teamId: args.teamId,
			groupId: args.groupId,
			projectCount: args.projectIds.length,
		});

		try {
			const api = getLokaliseApi();
			// Convert project IDs to proper array type for SDK
			const projectIds = args.projectIds.map((id) =>
				typeof id === "string" ? id : id.toString(),
			);
			const result = await api
				.userGroups()
				.remove_projects_from_group(args.teamId, args.groupId, projectIds);

			methodLogger.info("Removed projects from user group successfully", {
				teamId: args.teamId,
				groupId: args.groupId,
				removedCount: args.projectIds.length,
			});

			return result;
		} catch (error) {
			methodLogger.error("Failed to remove projects from user group", {
				error,
				args,
			});
			throw createUnexpectedError(
				`Failed to remove projects from user group ${args.groupId}`,
				error,
			);
		}
	},
};
