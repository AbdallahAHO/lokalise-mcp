import { LokaliseApi } from "@lokalise/node-api";
import { config } from "./config.util.js";
import { createApiError } from "./error.util.js";
import { Logger } from "./logger.util.js";

const logger = Logger.forContext("shared/utils/lokalise-api.util.ts");

let lokaliseApi: LokaliseApi | null = null;

/**
 * Gets or creates the Lokalise API instance.
 * This is a singleton instance.
 * It will load configuration and check for the API key on first call.
 * @returns The initialized LokaliseApi instance.
 * @throws {McpError} if LOKALISE_API_KEY is not configured.
 */
export function getLokaliseApi(): LokaliseApi {
	if (!lokaliseApi) {
		config.load();
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
			config.get("LOKALISE_API_HOSTNAME") ||
			"https://api.stage.lokalise.cloud/api2/";

		lokaliseApi = new LokaliseApi({ apiKey, host: apiHost });
		logger.info("Lokalise API client initialized", { host: apiHost });
	}

	return lokaliseApi;
}
