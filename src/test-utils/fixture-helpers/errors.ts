export const errorFixtures = {
	unauthorized: {
		error: {
			message: "Invalid API token",
			code: 401,
		},
	},
	forbidden: {
		error: {
			message: "You do not have permission to access this resource",
			code: 403,
		},
	},
	notFound: {
		error: {
			message: "Resource not found",
			code: 404,
		},
	},
	rateLimited: {
		error: {
			message: "Too many requests",
			code: 429,
		},
		headers: {
			"x-rate-limit-limit": "6000",
			"x-rate-limit-remaining": "0",
			"x-rate-limit-reset": "1705940000",
		},
	},
	validationError: {
		error: {
			message: "Validation failed",
			code: 400,
			errors: [
				{
					field: "name",
					message: "Name is required",
				},
				{
					field: "base_language_iso",
					message: "Invalid language code",
				},
			],
		},
	},
	serverError: {
		error: {
			message: "Internal server error",
			code: 500,
		},
	},
};

export function createErrorResponse(
	code: number,
	message: string,
	details?: unknown,
): Error {
	const error = new Error(message);
	(error as unknown as { response: unknown }).response = {
		status: code,
		data: {
			error: {
				message,
				code,
				...(typeof details === "object" && details !== null ? details : {}),
			},
		},
	};
	return error;
}

export function createApiError(
	status: number,
	message: string,
	additionalData?: unknown,
): Error {
	const error = new Error(message);
	(error as unknown as { response: unknown }).response = {
		status,
		statusText: getStatusText(status),
		data: {
			error: Object.assign(
				{
					code: status,
					message,
				},
				typeof additionalData === "object" && additionalData !== null
					? additionalData
					: {},
			),
		},
	};
	return error;
}

function getStatusText(status: number): string {
	const statusTexts: Record<number, string> = {
		400: "Bad Request",
		401: "Unauthorized",
		403: "Forbidden",
		404: "Not Found",
		429: "Too Many Requests",
		500: "Internal Server Error",
		502: "Bad Gateway",
		503: "Service Unavailable",
	};
	return statusTexts[status] || "Unknown Error";
}

export class MockErrorBuilder {
	private status = 500;
	private message = "An error occurred";
	private details: unknown = {};

	withStatus(status: number): this {
		this.status = status;
		return this;
	}

	withMessage(message: string): this {
		this.message = message;
		return this;
	}

	withDetails(details: unknown): this {
		this.details = details;
		return this;
	}

	withValidationErrors(
		errors: Array<{ field: string; message: string }>,
	): this {
		this.status = 400;
		this.message = "Validation failed";
		this.details = { errors };
		return this;
	}

	withRateLimitHeaders(remaining = 0, reset?: number): this {
		this.status = 429;
		this.message = "Rate limit exceeded";
		this.details = {
			headers: {
				"x-rate-limit-limit": "6000",
				"x-rate-limit-remaining": String(remaining),
				"x-rate-limit-reset": String(reset || Date.now() + 3600000),
			},
		};
		return this;
	}

	build(): Error {
		return createApiError(this.status, this.message, this.details);
	}
}
