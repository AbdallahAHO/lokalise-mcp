import {
	createApiError,
	createAuthInvalidError,
	createAuthMissingError,
	createUnexpectedError,
	ErrorType,
	ensureMcpError,
	formatErrorForMcpResource,
	formatErrorForMcpTool,
	McpError,
} from "./error.util.js";

describe("Error Utility", () => {
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

	describe("formatErrorForMcpTool", () => {
		it("should format an error for MCP tool response", () => {
			const error = createApiError("API error");
			const response = formatErrorForMcpTool(error);

			expect(response).toHaveProperty("content");
			expect(response.content).toHaveLength(1);
			expect(response.content[0]).toHaveProperty("type", "text");
			expect(response.content[0]).toHaveProperty("text", "Error: API error");
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
