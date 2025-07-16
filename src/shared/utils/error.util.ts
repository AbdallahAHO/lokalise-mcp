import { Logger } from "./logger.util.js";

/**
 * Error types for classification
 */
export enum ErrorType {
	AUTH_MISSING = "AUTH_MISSING",
	AUTH_INVALID = "AUTH_INVALID",
	API_ERROR = "API_ERROR",
	NETWORK_ERROR = "NETWORK_ERROR",
	RATE_LIMIT_EXCEEDED = "RATE_LIMIT_EXCEEDED",
	NOT_FOUND = "NOT_FOUND",
	INVALID_PROJECT_ID = "INVALID_PROJECT_ID",
	INSUFFICIENT_PERMISSIONS = "INSUFFICIENT_PERMISSIONS",
	VALIDATION_ERROR = "VALIDATION_ERROR",
	TIMEOUT_ERROR = "TIMEOUT_ERROR",
	UNEXPECTED_ERROR = "UNEXPECTED_ERROR",
}

/**
 * Custom error class with type classification
 */
export class McpError extends Error {
	type: ErrorType;
	statusCode?: number;
	originalError?: unknown;

	constructor(
		message: string,
		type: ErrorType,
		statusCode?: number,
		originalError?: unknown,
	) {
		super(message);
		this.name = "McpError";
		this.type = type;
		this.statusCode = statusCode;
		this.originalError = originalError;
	}
}

/**
 * Create an authentication missing error
 */
export function createAuthMissingError(
	message = "Authentication credentials are missing",
): McpError {
	return new McpError(message, ErrorType.AUTH_MISSING);
}

/**
 * Create an authentication invalid error
 */
export function createAuthInvalidError(
	message = "Authentication credentials are invalid",
): McpError {
	return new McpError(message, ErrorType.AUTH_INVALID, 401);
}

/**
 * Create an API error
 */
export function createApiError(
	message: string,
	statusCode?: number,
	originalError?: unknown,
): McpError {
	return new McpError(message, ErrorType.API_ERROR, statusCode, originalError);
}

/**
 * Create a network error
 */
export function createNetworkError(
	message = "Network error occurred",
	originalError?: unknown,
): McpError {
	return new McpError(
		message,
		ErrorType.NETWORK_ERROR,
		undefined,
		originalError,
	);
}

/**
 * Create a rate limit exceeded error
 */
export function createRateLimitError(
	message = "Rate limit exceeded. Please try again later.",
	retryAfter?: number,
): McpError {
	return new McpError(message, ErrorType.RATE_LIMIT_EXCEEDED, 429, {
		retryAfter,
	});
}

/**
 * Create a not found error
 */
export function createNotFoundError(
	message = "Resource not found",
	originalError?: unknown,
): McpError {
	return new McpError(message, ErrorType.NOT_FOUND, 404, originalError);
}

/**
 * Create an invalid project ID error
 */
export function createInvalidProjectIdError(
	projectId: string,
	originalError?: unknown,
): McpError {
	return new McpError(
		`Invalid project ID: ${projectId}`,
		ErrorType.INVALID_PROJECT_ID,
		400,
		originalError,
	);
}

/**
 * Create an insufficient permissions error
 */
export function createInsufficientPermissionsError(
	message = "Insufficient permissions for this operation",
	originalError?: unknown,
): McpError {
	return new McpError(
		message,
		ErrorType.INSUFFICIENT_PERMISSIONS,
		403,
		originalError,
	);
}

/**
 * Create a validation error
 */
export function createValidationError(
	message = "Validation failed",
	originalError?: unknown,
): McpError {
	return new McpError(message, ErrorType.VALIDATION_ERROR, 400, originalError);
}

/**
 * Create a timeout error
 */
export function createTimeoutError(
	message = "Request timed out",
	originalError?: unknown,
): McpError {
	return new McpError(message, ErrorType.TIMEOUT_ERROR, 408, originalError);
}

/**
 * Create an unexpected error
 */
export function createUnexpectedError(
	message = "An unexpected error occurred",
	originalError?: unknown,
): McpError {
	return new McpError(
		message,
		ErrorType.UNEXPECTED_ERROR,
		undefined,
		originalError,
	);
}

/**
 * Ensure an error is an McpError
 */
export function ensureMcpError(error: unknown): McpError {
	if (error instanceof McpError) {
		return error;
	}

	if (error instanceof Error) {
		return createUnexpectedError(error.message, error);
	}

	return createUnexpectedError(String(error));
}

/**
 * Classify an error based on status code and message content
 * @param error The error to classify
 * @param statusCode HTTP status code if available
 * @param message Error message
 * @returns Appropriate McpError with correct type
 */
export function classifyApiError(
	error: unknown,
	statusCode?: number,
	message?: string,
): McpError {
	const errorMessage =
		message || (error instanceof Error ? error.message : String(error));

	// Classify by status code first
	switch (statusCode) {
		case 401:
			return createAuthInvalidError(
				"Authentication failed. Check your API token.",
			);
		case 403:
			return createInsufficientPermissionsError(
				"Access denied. Insufficient permissions.",
			);
		case 404:
			return createNotFoundError("Resource not found.");
		case 408:
			return createTimeoutError("Request timed out.");
		case 429:
			return createRateLimitError(
				"Rate limit exceeded. Please try again later.",
			);
		case 500:
		case 502:
		case 503:
		case 504:
			return createApiError(`Server error: ${errorMessage}`, statusCode, error);
	}

	// Classify by message content
	const lowerMessage = errorMessage.toLowerCase();

	if (lowerMessage.includes("network") || lowerMessage.includes("connection")) {
		return createNetworkError(errorMessage, error);
	}

	if (lowerMessage.includes("timeout")) {
		return createTimeoutError(errorMessage, error);
	}

	if (
		lowerMessage.includes("rate limit") ||
		lowerMessage.includes("too many requests")
	) {
		return createRateLimitError(errorMessage);
	}

	if (
		lowerMessage.includes("not found") ||
		lowerMessage.includes("does not exist")
	) {
		return createNotFoundError(errorMessage, error);
	}

	if (lowerMessage.includes("invalid") && lowerMessage.includes("project")) {
		return createInvalidProjectIdError("Unknown", error);
	}

	if (lowerMessage.includes("validation") || lowerMessage.includes("invalid")) {
		return createValidationError(errorMessage, error);
	}

	if (
		lowerMessage.includes("permission") ||
		lowerMessage.includes("access denied")
	) {
		return createInsufficientPermissionsError(errorMessage, error);
	}

	// Default to API error
	return createApiError(errorMessage, statusCode, error);
}

/**
 * Get the deepest original error from an error chain
 * @param error The error to extract the original cause from
 * @returns The deepest original error or the error itself
 */
export function getDeepOriginalError(error: unknown): unknown {
	if (!error) {
		return error;
	}

	let current = error;
	let depth = 0;
	const maxDepth = 10; // Prevent infinite recursion

	while (
		depth < maxDepth &&
		current instanceof Error &&
		"originalError" in current &&
		current.originalError
	) {
		current = current.originalError;
		depth++;
	}

	return current;
}

/**
 * Format error for MCP tool response
 */
export function formatErrorForMcpTool(error: unknown): {
	content: Array<{ type: "text"; text: string }>;
	metadata?: {
		errorType: ErrorType;
		statusCode?: number;
		errorDetails?: unknown;
	};
} {
	const methodLogger = Logger.forContext(
		"utils/error.util.ts",
		"formatErrorForMcpTool",
	);
	const mcpError = ensureMcpError(error);
	methodLogger.error(`${mcpError.type} error`, mcpError);

	// Get the deep original error for additional context
	const originalError = getDeepOriginalError(mcpError.originalError);

	// Safely extract details from the original error
	const errorDetails =
		originalError instanceof Error
			? { message: originalError.message }
			: originalError;

	return {
		content: [
			{
				type: "text" as const,
				text: `Error: ${mcpError.message}`,
			},
		],
		metadata: {
			errorType: mcpError.type,
			statusCode: mcpError.statusCode,
			errorDetails,
		},
	};
}

/**
 * Format error for MCP resource response
 */
export function formatErrorForMcpResource(
	error: unknown,
	uri: string,
): {
	contents: Array<{
		uri: string;
		text: string;
		mimeType: string;
		description?: string;
	}>;
} {
	const methodLogger = Logger.forContext(
		"utils/error.util.ts",
		"formatErrorForMcpResource",
	);
	const mcpError = ensureMcpError(error);
	methodLogger.error(`${mcpError.type} error`, mcpError);

	return {
		contents: [
			{
				uri,
				text: `Error: ${mcpError.message}`,
				mimeType: "text/plain",
				description: `Error: ${mcpError.type}`,
			},
		],
	};
}

/**
 * Handle error in CLI context with improved user feedback
 */
export function handleCliError(error: unknown): never {
	const methodLogger = Logger.forContext(
		"utils/error.util.ts",
		"handleCliError",
	);
	const mcpError = ensureMcpError(error);
	methodLogger.error(`${mcpError.type} error`, mcpError);

	// Get the deep original error for more context
	const originalError = getDeepOriginalError(mcpError.originalError);

	// Print the error message
	console.error(`Error: ${mcpError.message}`);

	// Provide helpful context based on error type
	if (mcpError.type === ErrorType.AUTH_MISSING) {
		console.error(
			"\nTip: Make sure to set up your API token in the configuration file or environment variables.",
		);
	} else if (mcpError.type === ErrorType.AUTH_INVALID) {
		console.error(
			"\nTip: Check that your API token is correct and has not expired.",
		);
	} else if (mcpError.type === ErrorType.API_ERROR) {
		if (mcpError.statusCode === 429) {
			console.error(
				"\nTip: You may have exceeded your API rate limits. Try again later or upgrade your API plan.",
			);
		}

		// Add ip-api.com specific context if available
		if (originalError && typeof originalError === "object") {
			const origErr = originalError as Record<string, unknown>;
			if (origErr.status === "fail" && origErr.message) {
				console.error(`\nAPI returned failure: ${String(origErr.message)}`);
			}
		}
	}

	// Display DEBUG tip
	if (process.env.DEBUG !== "mcp:*") {
		console.error(
			"\nFor more detailed error information, run with DEBUG=mcp:* environment variable.",
		);
	}

	process.exit(1);
}
