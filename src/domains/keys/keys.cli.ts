import type { SupportedPlatforms } from "@lokalise/node-api";
import type { Command } from "commander";
import type { DomainCli, DomainMeta } from "../../shared/types/domain.types.js";
import { handleCliError } from "../../shared/utils/error.util.js";
import { Logger } from "../../shared/utils/logger.util.js";
import keysController from "./keys.controller.js";

const logger = Logger.forContext("cli/keys.cli.ts");

/**
 * Register Keys CLI commands
 * @param program The Commander program instance
 */
function register(program: Command) {
	const methodLogger = logger.forMethod("register");
	methodLogger.debug("Registering Keys CLI commands...");

	// List Keys Command
	program
		.command("list-keys")
		.description(
			"Lists translation keys from a Lokalise project with optional filtering and pagination support.",
		)
		.requiredOption("-p, --project-id <projectId>", "Lokalise project ID")
		.option(
			"-l, --limit <number>",
			"Number of keys to return (1-5000, default: 100)",
			(value) => {
				const parsed = Number.parseInt(value, 10);
				if (Number.isNaN(parsed) || parsed < 1 || parsed > 5000) {
					throw new Error("Limit must be a number between 1 and 5000");
				}
				return parsed;
			},
		)
		.option(
			"--page <number>",
			"Page number for pagination (default: 1)",
			(value) => {
				const parsed = Number.parseInt(value, 10);
				if (Number.isNaN(parsed) || parsed < 1) {
					throw new Error("Page must be a number greater than 0");
				}
				return parsed;
			},
		)
		.option("--include-translations", "Include translation data for each key")
		.option(
			"--filter-keys <keys>",
			"Filter by specific key names (comma-separated)",
			(value) => value.split(",").map((k) => k.trim()),
		)
		.option(
			"--filter-platforms <platforms>",
			"Filter by platforms: ios, android, web, other (comma-separated)",
			(value) => {
				const platforms = value.split(",").map((p) => p.trim());
				const validPlatforms = ["ios", "android", "web", "other"];
				for (const platform of platforms) {
					if (!validPlatforms.includes(platform)) {
						throw new Error(
							`Invalid platform: ${platform}. Valid platforms: ${validPlatforms.join(", ")}`,
						);
					}
				}
				return platforms;
			},
		)
		.action(async (options) => {
			const actionLogger = logger.forMethod("action:list-keys");
			actionLogger.debug("Executing list-keys command", options);

			try {
				const result = await keysController.listKeys({
					projectId: options.projectId,
					limit: options.limit,
					page: options.page,
					includeTranslations: options.includeTranslations || false,
					filterKeys: options.filterKeys,
					filterPlatforms: options.filterPlatforms,
				});

				console.log(result.content);
			} catch (error) {
				handleCliError({
					message: "Failed to list keys",
					error,
					command: "list-keys",
					projectId: options.projectId,
					limit: options.limit,
				});
			}
		});

	// Create Keys Command
	program
		.command("create-keys")
		.description(
			"Creates multiple translation keys in a Lokalise project with optional initial translations.",
		)
		.requiredOption("-p, --project-id <projectId>", "Lokalise project ID")
		.requiredOption(
			"-k, --keys <keys>",
			"JSON string or file path containing keys data (array of key objects)",
		)
		.action(async (options) => {
			const actionLogger = logger.forMethod("action:create-keys");
			actionLogger.debug("Executing create-keys command", options);

			try {
				let keysData: unknown;

				// Try to parse as JSON first, then check if it's a file path
				try {
					keysData = JSON.parse(options.keys);
				} catch {
					// If JSON parsing fails, treat as file path
					const fs = await import("node:fs");

					if (fs.existsSync(options.keys)) {
						const fileContent = fs.readFileSync(options.keys, "utf-8");
						keysData = JSON.parse(fileContent);
					} else {
						throw new Error("Invalid JSON and file does not exist");
					}
				}

				if (!Array.isArray(keysData)) {
					throw new Error("Keys data must be an array of key objects");
				}

				const result = await keysController.createKeys({
					projectId: options.projectId,
					keys: keysData,
				});

				console.log(result.content);
			} catch (error) {
				handleCliError({
					message: "Failed to create keys",
					error,
					command: "create-keys",
					projectId: options.projectId,
					keys: options.keys,
				});
			}
		});

	// Get Key Command
	program
		.command("get-key")
		.description(
			"Retrieves detailed information about a specific translation key from a Lokalise project.",
		)
		.requiredOption("-p, --project-id <projectId>", "Lokalise project ID")
		.requiredOption("-k, --key-id <keyId>", "Key ID to retrieve", (value) => {
			const parsed = Number.parseInt(value, 10);
			if (Number.isNaN(parsed)) {
				throw new Error("Key ID must be a number");
			}
			return parsed;
		})
		.action(async (options) => {
			const actionLogger = logger.forMethod("action:get-key");
			actionLogger.debug("Executing get-key command", options);

			try {
				const result = await keysController.getKey({
					projectId: options.projectId,
					keyId: options.keyId,
				});

				console.log(result.content);
			} catch (error) {
				handleCliError({
					message: "Failed to get key",
					error,
					command: "get-key",
					projectId: options.projectId,
					keyId: options.keyId,
				});
			}
		});

	// Update Key Command
	program
		.command("update-key")
		.description(
			"Updates the metadata (description, platforms, tags) of a translation key in a Lokalise project.",
		)
		.requiredOption("-p, --project-id <projectId>", "Lokalise project ID")
		.requiredOption("-k, --key-id <keyId>", "Key ID to update", (value) => {
			const parsed = Number.parseInt(value, 10);
			if (Number.isNaN(parsed)) {
				throw new Error("Key ID must be a number");
			}
			return parsed;
		})
		.option("-d, --description <description>", "New description for the key")
		.option(
			"--platforms <platforms>",
			"New platforms for the key: ios, android, web, other (comma-separated)",
			(value) => {
				const platforms = value.split(",").map((p) => p.trim());
				const validPlatforms = ["ios", "android", "web", "other"];
				for (const platform of platforms) {
					if (!validPlatforms.includes(platform)) {
						throw new Error(
							`Invalid platform: ${platform}. Valid platforms: ${validPlatforms.join(", ")}`,
						);
					}
				}
				return platforms;
			},
		)
		.option(
			"-t, --tags <tags>",
			"New tags for the key (comma-separated)",
			(value) => value.split(",").map((t) => t.trim()),
		)
		.action(async (options) => {
			const actionLogger = logger.forMethod("action:update-key");
			actionLogger.debug("Executing update-key command", options);

			try {
				const keyData: {
					description?: string;
					platforms?: SupportedPlatforms[];
					tags?: string[];
				} = {};

				if (options.description !== undefined) {
					keyData.description = options.description;
				}
				if (options.platforms !== undefined) {
					keyData.platforms = options.platforms;
				}
				if (options.tags !== undefined) {
					keyData.tags = options.tags;
				}

				const result = await keysController.updateKey({
					projectId: options.projectId,
					keyId: options.keyId,
					keyData,
				});

				console.log(result.content);
			} catch (error) {
				handleCliError({
					message: "Failed to update key",
					error,
					command: "update-key",
					projectId: options.projectId,
					keyId: options.keyId,
				});
			}
		});

	// Delete Key Command
	program
		.command("delete-key")
		.description(
			"Deletes a translation key and all its translations from a Lokalise project permanently.",
		)
		.requiredOption("-p, --project-id <projectId>", "Lokalise project ID")
		.requiredOption("-k, --key-id <keyId>", "Key ID to delete", (value) => {
			const parsed = Number.parseInt(value, 10);
			if (Number.isNaN(parsed)) {
				throw new Error("Key ID must be a number");
			}
			return parsed;
		})
		.option("--confirm", "Confirm deletion (required for safety)")
		.action(async (options) => {
			const actionLogger = logger.forMethod("action:delete-key");
			actionLogger.debug("Executing delete-key command", options);

			try {
				if (!options.confirm) {
					console.error("Error: Deletion requires --confirm flag for safety");
					process.exit(1);
				}

				const result = await keysController.deleteKey({
					projectId: options.projectId,
					keyId: options.keyId,
				});

				console.log(result.content);
			} catch (error) {
				handleCliError({
					message: "Failed to delete key",
					error,
					command: "delete-key",
					projectId: options.projectId,
					keyId: options.keyId,
				});
			}
		});

	// Bulk Update Keys Command
	program
		.command("bulk-update-keys")
		.description(
			"Updates multiple translation keys in a Lokalise project in a single operation.",
		)
		.requiredOption("-p, --project-id <projectId>", "Lokalise project ID")
		.requiredOption(
			"-k, --keys <keys>",
			"JSON string or file path containing keys update data (array of key update objects)",
		)
		.action(async (options) => {
			const actionLogger = logger.forMethod("action:bulk-update-keys");
			actionLogger.debug("Executing bulk-update-keys command", options);

			try {
				let keysData: unknown;

				// Try to parse as JSON first, then check if it's a file path
				try {
					keysData = JSON.parse(options.keys);
				} catch {
					// If JSON parsing fails, treat as file path
					const fs = await import("node:fs");

					if (fs.existsSync(options.keys)) {
						const fileContent = fs.readFileSync(options.keys, "utf-8");
						keysData = JSON.parse(fileContent);
					} else {
						throw new Error("Invalid JSON and file does not exist");
					}
				}

				if (!Array.isArray(keysData)) {
					throw new Error("Keys data must be an array of key update objects");
				}

				const result = await keysController.bulkUpdateKeys({
					projectId: options.projectId,
					keys: keysData,
				});

				console.log(result.content);
			} catch (error) {
				handleCliError({
					message: "Failed to bulk update keys",
					error,
					command: "bulk-update-keys",
					projectId: options.projectId,
					keys: options.keys,
				});
			}
		});

	// Bulk Delete Keys Command
	program
		.command("bulk-delete-keys")
		.description(
			"Deletes multiple translation keys and all their translations from a Lokalise project permanently.",
		)
		.requiredOption("-p, --project-id <projectId>", "Lokalise project ID")
		.requiredOption(
			"-k, --key-ids <keyIds>",
			"Comma-separated list of key IDs to delete",
			(value) => {
				const keyIds = value.split(",").map((id) => {
					const parsed = Number.parseInt(id.trim(), 10);
					if (Number.isNaN(parsed)) {
						throw new Error(`Invalid key ID: ${id.trim()}`);
					}
					return parsed;
				});
				if (keyIds.length === 0) {
					throw new Error("At least one key ID is required");
				}
				return keyIds;
			},
		)
		.option("--confirm", "Confirm deletion (required for safety)")
		.action(async (options) => {
			const actionLogger = logger.forMethod("action:bulk-delete-keys");
			actionLogger.debug("Executing bulk-delete-keys command", options);

			try {
				if (!options.confirm) {
					console.error(
						"Error: Bulk deletion requires --confirm flag for safety",
					);
					process.exit(1);
				}

				const result = await keysController.bulkDeleteKeys({
					projectId: options.projectId,
					keyIds: options.keyIds,
				});

				console.log(result.content);
			} catch (error) {
				handleCliError({
					message: "Failed to bulk delete keys",
					error,
					command: "bulk-delete-keys",
					projectId: options.projectId,
					keyIds: options.keyIds,
				});
			}
		});

	methodLogger.debug("Keys CLI commands registered successfully");
}

const keysCli: DomainCli = {
	register,
	getMeta(): DomainMeta {
		return {
			name: "keys",
			description: "Translation keys management CLI commands",
			version: "1.0.0",
			cliCommandsCount: 7,
		};
	},
};

export default keysCli;
