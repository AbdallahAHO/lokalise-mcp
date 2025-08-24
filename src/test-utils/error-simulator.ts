// Error simulation functions for testing

export function createUnauthorizedError(): Error {
	const error = new Error("Unauthorized");
	(error as unknown as { response: unknown }).response = {
		status: 401,
		data: { error: { message: "Invalid API token" } },
	};
	return error;
}

export function createForbiddenError(): Error {
	const error = new Error("Forbidden");
	(error as unknown as { response: unknown }).response = {
		status: 403,
		data: { error: { message: "Access denied" } },
	};
	return error;
}

export function createNotFoundError(resource: string): Error {
	const error = new Error("Not Found");
	(error as unknown as { response: unknown }).response = {
		status: 404,
		data: { error: { message: `${resource} not found` } },
	};
	return error;
}

export function createRateLimitedError(): Error {
	const error = new Error("Too Many Requests");
	(error as unknown as { response: unknown }).response = {
		status: 429,
		data: { error: { message: "Rate limit exceeded" } },
		headers: {
			"x-rate-limit-limit": "6000",
			"x-rate-limit-remaining": "0",
			"x-rate-limit-reset": String(Date.now() + 3600000),
		},
	};
	return error;
}

export function createServerError(): Error {
	const error = new Error("Internal Server Error");
	(error as unknown as { response: unknown }).response = {
		status: 500,
		data: { error: { message: "An unexpected error occurred" } },
	};
	return error;
}

export function createValidationError(
	errors: Array<{ field: string; message: string }>,
): Error {
	const error = new Error("Validation Error");
	(error as unknown as { response: unknown }).response = {
		status: 400,
		data: {
			error: {
				message: "Validation failed",
				code: 400,
				errors,
			},
		},
	};
	return error;
}

// Backward compatibility wrapper - use the functions above directly
export const ApiErrorSimulator = {
	unauthorized: createUnauthorizedError,
	forbidden: createForbiddenError,
	notFound: createNotFoundError,
	rateLimited: createRateLimitedError,
	serverError: createServerError,
	validationError: createValidationError,
};
