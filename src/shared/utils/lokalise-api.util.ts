import { LokaliseApi } from "@lokalise/node-api";
import { config } from "./config.util.js";
import { createApiError } from "./error.util.js";
import { Logger } from "./logger.util.js";

const logger = Logger.forContext("shared/utils/lokalise-api.util.ts");

let lokaliseApi: LokaliseApi | null = null;

/**
 * Gets or creates the Lokalise API instance.
 * This is a singleton instance.
 * Configuration must be loaded before calling this function.
 * @returns The initialized LokaliseApi instance.
 * @throws {McpError} if LOKALISE_API_KEY is not configured.
 */
export function getLokaliseApi(): LokaliseApi {
	if (!lokaliseApi) {
		const apiKey = config.get("LOKALISE_API_KEY");
		if (!apiKey) {
			logger.error(
				"LOKALISE_API_KEY is required but not found in configuration.",
			);
			throw createApiError(
				"LOKALISE_API_KEY is required but not found in configuration",
				401,
			);
		}
		const apiHost =
			config.get("LOKALISE_API_HOSTNAME") || "https://api.lokalise.com/api2/";

		lokaliseApi = new LokaliseApi({ apiKey, host: apiHost });
		logger.info("Lokalise API client initialized", { host: apiHost });
	}

	return lokaliseApi;
}

/**
 * Resets the Lokalise API singleton instance.
 * This forces the API client to be recreated with new configuration
 * on the next call to getLokaliseApi().
 */
export function resetLokaliseApi(): void {
	if (lokaliseApi) {
		logger.info("Resetting Lokalise API client singleton");
		lokaliseApi = null;
	}
}
