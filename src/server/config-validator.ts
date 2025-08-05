/**
 * Configuration Validator
 * Validates required configuration for the MCP server
 */

import { config } from "../shared/utils/config.util.js";
import { Logger } from "../shared/utils/logger.util.js";

const logger = Logger.forContext("server/config-validator.ts");

export interface ValidationResult {
	valid: boolean;
	missingKeys?: string[];
	error?: string;
}

/**
 * Validate required configuration keys
 */
export async function validateConfiguration(
	requiredKeys: string[] = ["LOKALISE_API_KEY"],
): Promise<ValidationResult> {
	logger.debug("Validating configuration");

	const missingKeys: string[] = [];

	for (const key of requiredKeys) {
		if (!config.get(key)) {
			missingKeys.push(key);
		}
	}

	if (missingKeys.length > 0) {
		logger.error("Required configuration missing", { missingKeys });
		return {
			valid: false,
			missingKeys,
			error: `Required configuration missing: ${missingKeys.join(", ")}. Please set these environment variables or add them to your .env file.`,
		};
	}

	logger.debug("Configuration validation successful");
	return { valid: true };
}
