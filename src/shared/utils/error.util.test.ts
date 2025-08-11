import {
	createApiError,
	createAuthInvalidError,
	createAuthMissingError,
	createUnexpectedError,
	ErrorType,
	ensureMcpError,
	formatErrorForMcpResource,
	formatErrorForMcpTool,
	getDeepOriginalError,
	McpError,
} from "./error.util.js";

describe("error.util", () => {
	describe("getDeepOriginalError", () => {
		it("should return the deepest original error in a chain", () => {
			// Create a nested chain of errors
			const deepestError = new Error("Root cause");
			const middleError = createApiError("Middle error", 500, deepestError);
			const topError = createUnexpectedError("Top error", middleError);

			// Should extract the deepest error
			const result = getDeepOriginalError(topError);
			expect(result).toBe(deepestError);
		});

		it("should handle null/undefined input", () => {
			expect(getDeepOriginalError(null)).toBeNull();
			expect(getDeepOriginalError(undefined)).toBeUndefined();
		});

		it("should return the input if it has no originalError", () => {
			const error = new Error("Simple error");
			expect(getDeepOriginalError(error)).toBe(error);
		});

		it("should handle non-Error objects", () => {
			const nonError = { message: "Not an error" };
			expect(getDeepOriginalError(nonError)).toBe(nonError);
		});

		it("should prevent infinite recursion with circular references", () => {
			const error1 = new McpError("Error 1", ErrorType.UNEXPECTED_ERROR);
			const error2 = new McpError(
				"Error 2",
				ErrorType.UNEXPECTED_ERROR,
				undefined,
				error1,
			);
			// Create circular reference
			error1.originalError = error2;

			// Should not cause stack overflow, should return one of the errors
			const result = getDeepOriginalError(error1);
			expect(result).toBeTruthy();
			expect(result instanceof Error).toBe(true);
		});
	});

	describe("formatErrorForMcpTool", () => {
		it("should format McpError with metadata", () => {
			const error = createApiError("Test error", 404, {
				detail: "Not found",
			});
			const result = formatErrorForMcpTool(error);

			// Check the content
			expect(result.content).toEqual([
				{
					type: "text",
					text: "Error: Test error",
				},
			]);

			// Check the metadata
			expect(result.metadata).toBeDefined();
			expect(result.metadata?.errorType).toBe(ErrorType.API_ERROR);
			expect(result.metadata?.statusCode).toBe(404);
			expect(result.metadata?.errorDetails).toEqual({
				detail: "Not found",
			});
		});

		it("should wrap non-McpError with metadata", () => {
			const error = new Error("Regular error");
			const result = formatErrorForMcpTool(error);

			// Check content
			expect(result.content[0].text).toBe("Error: Regular error");

			// Check metadata
			expect(result.metadata?.errorType).toBe(ErrorType.UNEXPECTED_ERROR);
			expect(result.metadata?.errorDetails).toHaveProperty(
				"message",
				"Regular error",
			);
		});

		it("should extract error message from non-Error objects", () => {
			const result = formatErrorForMcpTool("String error");
			expect(result.content[0].text).toBe("Error: String error");
			expect(result.metadata?.errorType).toBe(ErrorType.UNEXPECTED_ERROR);
		});

		it("should extract deep original error details", () => {
			const deepError = { code: "DEEP_ERROR", message: "Deep cause" };
			const middleError = createApiError("Middle layer", 500, deepError);
			const topError = createUnexpectedError("Top error", middleError);

			const result = formatErrorForMcpTool(topError);

			expect(result.metadata?.errorDetails).toEqual(deepError);
		});
	});

	describe("McpError", () => {
		it("should create an error with the correct properties", () => {
			const error = new McpError("Test error", ErrorType.API_ERROR, 404);

			expect(error).toBeInstanceOf(Error);
			expect(error).toBeInstanceOf(McpError);
			expect(error.message).toBe("Test error");
			expect(error.type).toBe(ErrorType.API_ERROR);
			expect(error.statusCode).toBe(404);
			expect(error.name).toBe("McpError");
		});
	});

	describe("Error Factory Functions", () => {
		it("should create auth missing error", () => {
			const error = createAuthMissingError();

			expect(error).toBeInstanceOf(McpError);
			expect(error.type).toBe(ErrorType.AUTH_MISSING);
			expect(error.message).toBe("Authentication credentials are missing");
		});

		it("should create auth invalid error", () => {
			const error = createAuthInvalidError("Invalid token");

			expect(error).toBeInstanceOf(McpError);
			expect(error.type).toBe(ErrorType.AUTH_INVALID);
			expect(error.statusCode).toBe(401);
			expect(error.message).toBe("Invalid token");
		});

		it("should create API error", () => {
			const originalError = new Error("Original error");
			const error = createApiError("API failed", 500, originalError);

			expect(error).toBeInstanceOf(McpError);
			expect(error.type).toBe(ErrorType.API_ERROR);
			expect(error.statusCode).toBe(500);
			expect(error.message).toBe("API failed");
			expect(error.originalError).toBe(originalError);
		});

		it("should create unexpected error", () => {
			const error = createUnexpectedError();

			expect(error).toBeInstanceOf(McpError);
			expect(error.type).toBe(ErrorType.UNEXPECTED_ERROR);
			expect(error.message).toBe("An unexpected error occurred");
		});
	});

	describe("ensureMcpError", () => {
		it("should return the same error if it is already an McpError", () => {
			const originalError = createApiError("Original error");
			const error = ensureMcpError(originalError);

			expect(error).toBe(originalError);
		});

		it("should wrap a standard Error", () => {
			const originalError = new Error("Standard error");
			const error = ensureMcpError(originalError);

			expect(error).toBeInstanceOf(McpError);
			expect(error.type).toBe(ErrorType.UNEXPECTED_ERROR);
			expect(error.message).toBe("Standard error");
			expect(error.originalError).toBe(originalError);
		});

		it("should handle non-Error objects", () => {
			const error = ensureMcpError("String error");

			expect(error).toBeInstanceOf(McpError);
			expect(error.type).toBe(ErrorType.UNEXPECTED_ERROR);
			expect(error.message).toBe("String error");
		});
	});

	describe("formatErrorForMcpResource", () => {
		it("should format an error for MCP resource response", () => {
			const error = createApiError("API error");
			const response = formatErrorForMcpResource(error, "test://uri");

			expect(response).toHaveProperty("contents");
			expect(response.contents).toHaveLength(1);
			expect(response.contents[0]).toHaveProperty("uri", "test://uri");
			expect(response.contents[0]).toHaveProperty("text", "Error: API error");
			expect(response.contents[0]).toHaveProperty("mimeType", "text/plain");
			expect(response.contents[0]).toHaveProperty(
				"description",
				"Error: API_ERROR",
			);
		});
	});
});
