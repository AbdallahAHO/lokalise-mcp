import {
	afterEach,
	beforeEach,
	describe,
	expect,
	it,
	jest,
} from "@jest/globals";
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { McpError } from "../../shared/utils/error.util.js";
import projectsController from "./projects.controller.js";
import projectsResource from "./projects.resource.js";

// Mock the controller
// TODO: Fix Jest ESM mock configuration issue
// jest.mock("./projects.controller.js");

describe.skip("ProjectsResource", () => {
	let server: McpServer;
	const mockedController = jest.mocked(projectsController);
	const mockResourceHandlers = new Map<
		string,
		(uri: URL) => Promise<unknown>
	>();

	beforeEach(() => {
		jest.clearAllMocks();

		// Create a mock server
		const transport = new StdioServerTransport();
		server = new Server(
			{
				name: "test-server",
				version: "1.0.0",
			},
			{
				capabilities: {
					resources: {},
				},
			},
		) as unknown as McpServer;

		// Mock the server.resource method to capture handlers
		server.resource = jest.fn(
			(
				name: string,
				_template: unknown,
				handler: (uri: URL) => Promise<unknown>,
			) => {
				mockResourceHandlers.set(name, handler);
			},
		) as unknown;
	});

	afterEach(() => {
		jest.clearAllMocks();
		mockResourceHandlers.clear();
	});

	describe("Resource Registration", () => {
		it("should register both project resources", () => {
			// Act
			projectsResource.registerResources(server);

			// Assert
			expect(server.resource).toHaveBeenCalledTimes(2);
			expect(server.resource).toHaveBeenCalledWith(
				"lokalise-projects",
				expect.any(Object),
				expect.any(Function),
			);
			expect(server.resource).toHaveBeenCalledWith(
				"lokalise-project-details",
				expect.any(Object),
				expect.any(Function),
			);
		});

		it("should provide metadata about the resources", () => {
			// Act
			const meta = projectsResource.getMeta?.();

			// Assert
			expect(meta).toBeDefined();
			expect(meta?.name).toBe("projects");
			expect(meta?.description).toContain("resource");
			expect(meta?.resourcesCount).toBe(2);
		});
	});

	describe("lokalise-projects resource", () => {
		beforeEach(() => {
			projectsResource.registerResources(server);
		});

		it("should handle projects list URI without parameters", async () => {
			// Arrange
			const mockResponse = {
				content: "# Projects List",
				data: [],
				metadata: {},
			};
			mockedController.listProjects.mockResolvedValue(mockResponse);

			const handler = mockResourceHandlers.get("lokalise-projects");
			const uri = new URL("lokalise://projects");

			// Act
			const result = await handler?.(uri);

			// Assert
			expect(result).toEqual({
				contents: [{ text: mockResponse.content, mimeType: "text/markdown" }],
			});
			expect(mockedController.listProjects).toHaveBeenCalledWith({
				limit: undefined,
				page: undefined,
				includeStats: false,
			});
		});

		it("should parse query parameters from URI", async () => {
			// Arrange
			const mockResponse = {
				content: "# Projects with params",
				data: [],
				metadata: {},
			};
			mockedController.listProjects.mockResolvedValue(mockResponse);

			const handler = mockResourceHandlers.get("lokalise-projects");
			const uri = new URL(
				"lokalise://projects?limit=50&page=2&includeStats=true",
			);

			// Act
			const result = await handler?.(uri);

			// Assert
			expect(mockedController.listProjects).toHaveBeenCalledWith({
				limit: 50,
				page: 2,
				includeStats: true,
			});
		});

		it("should handle invalid limit parameter", async () => {
			// Arrange
			const handler = mockResourceHandlers.get("lokalise-projects");
			const uri = new URL("lokalise://projects?limit=invalid");

			// Act
			const result = await handler?.(uri);

			// Assert
			expect(mockedController.listProjects).toHaveBeenCalledWith({
				limit: undefined, // Invalid number becomes undefined
				page: undefined,
				includeStats: false,
			});
		});

		it("should handle controller errors", async () => {
			// Arrange
			mockedController.listProjects.mockRejectedValue(
				new McpError("API_ERROR", "Service unavailable"),
			);

			const handler = mockResourceHandlers.get("lokalise-projects");
			const uri = new URL("lokalise://projects");

			// Act
			const result = await handler?.(uri);

			// Assert
			expect(result).toEqual({
				contents: [
					{
						text: expect.stringContaining("Error"),
						mimeType: "text/markdown",
					},
				],
			});
		});
	});

	describe("lokalise-project-details resource", () => {
		beforeEach(() => {
			projectsResource.registerResources(server);
		});

		it("should extract project ID from URI path", async () => {
			// Arrange
			const mockResponse = {
				content: "# Project Details",
				data: { project_id: "test-123" },
				metadata: {},
			};
			mockedController.getProjectDetails.mockResolvedValue(mockResponse);

			const handler = mockResourceHandlers.get("lokalise-project-details");
			const uri = new URL("lokalise://projects/test-123");

			// Act
			const result = await handler?.(uri);

			// Assert
			expect(result).toEqual({
				contents: [{ text: mockResponse.content, mimeType: "text/markdown" }],
			});
			expect(mockedController.getProjectDetails).toHaveBeenCalledWith({
				projectId: "test-123",
				includeLanguages: false,
				includeKeysSummary: false,
			});
		});

		it("should parse optional parameters", async () => {
			// Arrange
			const mockResponse = {
				content: "# Project with options",
				data: {},
				metadata: {},
			};
			mockedController.getProjectDetails.mockResolvedValue(mockResponse);

			const handler = mockResourceHandlers.get("lokalise-project-details");
			const uri = new URL(
				"lokalise://projects/test-123?includeLanguages=true&includeKeysSummary=true",
			);

			// Act
			await handler?.(uri);

			// Assert
			expect(mockedController.getProjectDetails).toHaveBeenCalledWith({
				projectId: "test-123",
				includeLanguages: true,
				includeKeysSummary: true,
			});
		});

		it("should handle missing project ID", async () => {
			// Arrange
			const handler = mockResourceHandlers.get("lokalise-project-details");
			const uri = new URL("lokalise://projects/"); // Missing ID

			// Act
			const result = await handler?.(uri);

			// Assert
			expect(result).toEqual({
				contents: [
					{
						text: expect.stringContaining("Error"),
						mimeType: "text/markdown",
					},
				],
			});
		});

		it("should handle invalid boolean parameters", async () => {
			// Arrange
			const mockResponse = {
				content: "# Project",
				data: {},
				metadata: {},
			};
			mockedController.getProjectDetails.mockResolvedValue(mockResponse);

			const handler = mockResourceHandlers.get("lokalise-project-details");
			const uri = new URL(
				"lokalise://projects/test-123?includeLanguages=invalid",
			);

			// Act
			await handler?.(uri);

			// Assert
			expect(mockedController.getProjectDetails).toHaveBeenCalledWith({
				projectId: "test-123",
				includeLanguages: false, // Invalid boolean becomes false
				includeKeysSummary: false,
			});
		});
	});

	describe("URI Parsing", () => {
		beforeEach(() => {
			projectsResource.registerResources(server);
		});

		it("should handle URI with special characters in project ID", async () => {
			// Arrange
			const mockResponse = {
				content: "# Project",
				data: {},
				metadata: {},
			};
			mockedController.getProjectDetails.mockResolvedValue(mockResponse);

			const handler = mockResourceHandlers.get("lokalise-project-details");
			const uri = new URL("lokalise://projects/123.abc%20def"); // URL encoded

			// Act
			await handler?.(uri);

			// Assert
			expect(mockedController.getProjectDetails).toHaveBeenCalledWith({
				projectId: "123.abc def", // Should be decoded
				includeLanguages: false,
				includeKeysSummary: false,
			});
		});

		it("should handle URI with multiple query parameters", async () => {
			// Arrange
			const mockResponse = {
				content: "# Projects",
				data: [],
				metadata: {},
			};
			mockedController.listProjects.mockResolvedValue(mockResponse);

			const handler = mockResourceHandlers.get("lokalise-projects");
			const uri = new URL(
				"lokalise://projects?limit=25&page=3&includeStats=true&extra=ignored",
			);

			// Act
			await handler?.(uri);

			// Assert
			expect(mockedController.listProjects).toHaveBeenCalledWith({
				limit: 25,
				page: 3,
				includeStats: true,
				// Extra parameter should be ignored
			});
		});
	});

	describe("Error Handling", () => {
		beforeEach(() => {
			projectsResource.registerResources(server);
		});

		it("should handle controller exceptions gracefully", async () => {
			// Arrange
			mockedController.listProjects.mockRejectedValue(
				new Error("Unexpected error"),
			);

			const handler = mockResourceHandlers.get("lokalise-projects");
			const uri = new URL("lokalise://projects");

			// Act
			const result = await handler?.(uri);

			// Assert
			expect(result).toEqual({
				contents: [
					{
						text: expect.stringContaining("Error"),
						mimeType: "text/markdown",
					},
				],
			});
		});

		it("should handle malformed URIs", async () => {
			// Arrange
			const handler = mockResourceHandlers.get("lokalise-projects");
			const uri = new URL("lokalise://invalid/path/structure");

			// Act & Assert
			// Handler should not be found for invalid URI pattern
			expect(handler).toBeUndefined();
		});
	});

	describe("Auto-Discovery", () => {
		it("should be discoverable via DomainResource interface", () => {
			// Assert
			expect(projectsResource).toHaveProperty("registerResources");
			expect(typeof projectsResource.registerResources).toBe("function");
			expect(projectsResource).toHaveProperty("getMeta");
			expect(typeof projectsResource.getMeta).toBe("function");
		});

		it("should register without errors", () => {
			// Act & Assert
			expect(() => projectsResource.registerResources(server)).not.toThrow();
		});
	});
});
