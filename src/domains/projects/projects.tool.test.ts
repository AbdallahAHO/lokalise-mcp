import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import type {
	McpServer,
	RegisteredTool,
} from "@modelcontextprotocol/sdk/server/mcp.js";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ErrorType, McpError } from "../../shared/utils/error.util.js";
import type {
	CreateProjectToolArgsType,
	DeleteProjectToolArgsType,
	EmptyProjectToolArgsType,
	GetProjectDetailsToolArgsType,
	ListProjectsToolArgsType,
	UpdateProjectToolArgsType,
} from "./projects.types.js";

// Mock the controller
vi.mock("./projects.controller.js");

import projectsController from "./projects.controller.js";
import projectsTool from "./projects.tool.js";

describe("ProjectsTool", () => {
	let server: McpServer;
	const mockedController = vi.mocked(projectsController);
	const mockToolHandlers = new Map<
		string,
		(args: unknown) => Promise<unknown>
	>();

	beforeEach(() => {
		vi.clearAllMocks();

		// Create a mock server
		server = new Server(
			{
				name: "test-server",
				version: "1.0.0",
			},
			{
				capabilities: {
					tools: {},
				},
			},
		) as unknown as McpServer;

		// Mock the server.tool method to capture handlers
		server.tool = vi.fn(
			(
				name: string,
				_description: string,
				_schema: unknown,
				handler: (args: unknown) => Promise<unknown>,
			) => {
				mockToolHandlers.set(name, handler);
				return {} as unknown as RegisteredTool;
			},
		) as unknown as typeof server.tool;
	});

	afterEach(() => {
		vi.clearAllMocks();
		mockToolHandlers.clear();
	});

	describe("Tool Registration", () => {
		it("should register all 6 project tools", () => {
			// Act
			projectsTool.registerTools(server);

			// Assert
			expect(server.tool).toHaveBeenCalledTimes(6);
			expect(server.tool).toHaveBeenCalledWith(
				"lokalise_list_projects",
				expect.any(String),
				expect.any(Object),
				expect.any(Function),
			);
			expect(server.tool).toHaveBeenCalledWith(
				"lokalise_get_project",
				expect.any(String),
				expect.any(Object),
				expect.any(Function),
			);
			expect(server.tool).toHaveBeenCalledWith(
				"lokalise_create_project",
				expect.any(String),
				expect.any(Object),
				expect.any(Function),
			);
			expect(server.tool).toHaveBeenCalledWith(
				"lokalise_update_project",
				expect.any(String),
				expect.any(Object),
				expect.any(Function),
			);
			expect(server.tool).toHaveBeenCalledWith(
				"lokalise_delete_project",
				expect.any(String),
				expect.any(Object),
				expect.any(Function),
			);
			expect(server.tool).toHaveBeenCalledWith(
				"lokalise_empty_project",
				expect.any(String),
				expect.any(Object),
				expect.any(Function),
			);
		});

		it("should provide metadata about the domain", () => {
			// Act
			const meta = projectsTool.getMeta?.();

			// Assert
			expect(meta).toBeDefined();
			expect(meta?.name).toBe("projects");
			expect(meta?.description).toContain("Projects");
			expect(meta?.toolsCount).toBe(6);
		});
	});

	describe("lokalise_list_projects", () => {
		beforeEach(() => {
			projectsTool.registerTools(server);
		});

		it("should handle list projects with default args", async () => {
			// Arrange
			const mockResponse = {
				content: "# Projects List\n- Project 1\n- Project 2",
				data: [],
				metadata: { total: 2 },
			};
			mockedController.listProjects.mockResolvedValue(mockResponse);

			const handler = mockToolHandlers.get("lokalise_list_projects");
			const args: ListProjectsToolArgsType = {
				includeStats: false,
			};

			// Act
			const result = await handler?.(args);

			// Assert
			expect(result).toEqual({
				content: [{ type: "text", text: mockResponse.content }],
			});
			expect(mockedController.listProjects).toHaveBeenCalledWith(args);
		});

		it("should handle pagination parameters", async () => {
			// Arrange
			const mockResponse = {
				content: "# Projects Page 2",
				data: [],
				metadata: { page: 2, limit: 50 },
			};
			mockedController.listProjects.mockResolvedValue(mockResponse);

			const handler = mockToolHandlers.get("lokalise_list_projects");
			const args: ListProjectsToolArgsType = {
				page: 2,
				limit: 50,
				includeStats: true,
			};

			// Act
			const result = await handler?.(args);

			// Assert
			expect(mockedController.listProjects).toHaveBeenCalledWith(args);
			expect(result).toBeDefined();
		});

		it("should handle controller errors", async () => {
			// Arrange
			mockedController.listProjects.mockRejectedValue(
				new McpError("Service unavailable", ErrorType.API_ERROR),
			);

			const handler = mockToolHandlers.get("lokalise_list_projects");

			// Act
			const result = await handler?.({ includeStats: false });

			// Assert
			expect(result).toHaveProperty("content");
			expect(
				(result as unknown as { content: { type: string; text: string }[] })
					.content[0],
			).toEqual({
				type: "text",
				text: expect.stringContaining("Error"),
			});
			expect(result).toHaveProperty("metadata");
		});
	});

	describe("lokalise_get_project", () => {
		beforeEach(() => {
			projectsTool.registerTools(server);
		});

		it("should get project details", async () => {
			// Arrange
			const mockResponse = {
				content: "# Project Details\nName: Test Project",
				data: { project_id: "test-123", name: "Test Project" },
				metadata: {},
			};
			mockedController.getProjectDetails.mockResolvedValue(mockResponse);

			const handler = mockToolHandlers.get("lokalise_get_project");
			const args: GetProjectDetailsToolArgsType = {
				projectId: "test-123",
				includeLanguages: true,
				includeKeysSummary: false,
			};

			// Act
			const result = await handler?.(args);

			// Assert
			expect(result).toEqual({
				content: [{ type: "text", text: mockResponse.content }],
			});
			expect(mockedController.getProjectDetails).toHaveBeenCalledWith(args);
		});
	});

	describe("lokalise_create_project", () => {
		beforeEach(() => {
			projectsTool.registerTools(server);
		});

		it("should create project", async () => {
			// Arrange
			const mockResponse = {
				content: "# Project Created\nSuccessfully created: New Project",
				data: { project_id: "new-123", name: "New Project" },
				metadata: { created: true },
			};
			mockedController.createProject.mockResolvedValue(mockResponse);

			const handler = mockToolHandlers.get("lokalise_create_project");
			const args: CreateProjectToolArgsType = {
				name: "New Project",
				description: "Test description",
				base_lang_iso: "en",
			};

			// Act
			const result = await handler?.(args);

			// Assert
			expect(result).toEqual({
				content: [{ type: "text", text: mockResponse.content }],
			});
			expect(mockedController.createProject).toHaveBeenCalledWith(args);
		});

		it("should handle validation errors", async () => {
			// Arrange
			mockedController.createProject.mockRejectedValue(
				new McpError("Name is required", ErrorType.VALIDATION_ERROR),
			);

			const handler = mockToolHandlers.get("lokalise_create_project");
			const args: CreateProjectToolArgsType = {
				name: "",
				base_lang_iso: "en",
			};

			// Act
			const result = await handler?.(args);

			// Assert
			expect(result).toHaveProperty("content");
			expect(
				(result as unknown as { content: { type: string; text: string }[] })
					.content[0],
			).toEqual({
				type: "text",
				text: expect.stringContaining("Error"),
			});
			expect(result).toHaveProperty("metadata");
		});
	});

	describe("lokalise_update_project", () => {
		beforeEach(() => {
			projectsTool.registerTools(server);
		});

		it("should update project", async () => {
			// Arrange
			const mockResponse = {
				content: "# Project Updated\nSuccessfully updated project",
				data: { project_id: "test-123", name: "Updated Name" },
				metadata: { updated: true },
			};
			mockedController.updateProject.mockResolvedValue(mockResponse);

			const handler = mockToolHandlers.get("lokalise_update_project");
			const args: UpdateProjectToolArgsType = {
				projectId: "test-123",
				projectData: {
					name: "Updated Name",
				},
			};

			// Act
			const result = await handler?.(args);

			// Assert
			expect(result).toEqual({
				content: [{ type: "text", text: mockResponse.content }],
			});
			expect(mockedController.updateProject).toHaveBeenCalledWith(args);
		});
	});

	describe("lokalise_delete_project", () => {
		beforeEach(() => {
			projectsTool.registerTools(server);
		});

		it("should delete project", async () => {
			// Arrange
			const mockResponse = {
				content: "# Project Deleted\nSuccessfully deleted project",
				data: { project_deleted: true, project_id: "test-123" },
				metadata: { deleted: true },
			};
			mockedController.deleteProject.mockResolvedValue(mockResponse);

			const handler = mockToolHandlers.get("lokalise_delete_project");
			const args: DeleteProjectToolArgsType = {
				projectId: "test-123",
			};

			// Act
			const result = await handler?.(args);

			// Assert
			expect(result).toEqual({
				content: [{ type: "text", text: mockResponse.content }],
			});
			expect(mockedController.deleteProject).toHaveBeenCalledWith(args);
		});
	});

	describe("lokalise_empty_project", () => {
		beforeEach(() => {
			projectsTool.registerTools(server);
		});

		it("should empty project", async () => {
			// Arrange
			const mockResponse = {
				content: "# Project Emptied\n150 keys deleted",
				data: { project_emptied: true, keys_deleted: 150 },
				metadata: { keysDeleted: 150 },
			};
			mockedController.emptyProject.mockResolvedValue(mockResponse);

			const handler = mockToolHandlers.get("lokalise_empty_project");
			const args: EmptyProjectToolArgsType = {
				projectId: "test-123",
			};

			// Act
			const result = await handler?.(args);

			// Assert
			expect(result).toEqual({
				content: [{ type: "text", text: mockResponse.content }],
			});
			expect(mockedController.emptyProject).toHaveBeenCalledWith(args);
		});
	});

	describe("Schema Validation", () => {
		it("should validate input schemas", () => {
			// Arrange
			projectsTool.registerTools(server);

			// Act
			const calls = (server.tool as unknown as { mock: { calls: unknown[][] } })
				.mock.calls;

			// Assert
			calls.forEach(([_name, _desc, schema]) => {
				expect(schema).toBeDefined();
				// The shape object contains the field definitions
				expect(typeof schema).toBe("object");
				// Check for at least one property in the shape
				expect(
					Object.keys(schema as Record<string, unknown>).length,
				).toBeGreaterThan(0);
			});
		});
	});

	describe("Auto-Discovery", () => {
		it("should be discoverable via DomainTool interface", () => {
			// Assert
			expect(projectsTool).toHaveProperty("registerTools");
			expect(typeof projectsTool.registerTools).toBe("function");
			expect(projectsTool).toHaveProperty("getMeta");
			expect(typeof projectsTool.getMeta).toBe("function");
		});

		it("should register without errors", () => {
			// Act & Assert
			expect(() => projectsTool.registerTools(server)).not.toThrow();
		});
	});

	describe("Error Propagation", () => {
		beforeEach(() => {
			projectsTool.registerTools(server);
		});

		it("should propagate errors from controller", async () => {
			// Arrange
			const error = new McpError(
				"Controller failed",
				ErrorType.UNEXPECTED_ERROR,
			);
			mockedController.listProjects.mockRejectedValue(error);

			const handler = mockToolHandlers.get("lokalise_list_projects");

			// Act
			const result = await handler?.({ includeStats: false });

			// Assert
			expect(result).toHaveProperty("content");
			expect(result).toHaveProperty("metadata");
			const content = (result as { content: Array<{ text: string }> })
				.content[0].text;
			expect(content).toContain("Error");
		});

		it("should handle unexpected errors", async () => {
			// Arrange
			mockedController.listProjects.mockRejectedValue(new Error("Unexpected"));

			const handler = mockToolHandlers.get("lokalise_list_projects");

			// Act
			const result = await handler?.({ includeStats: false });

			// Assert
			expect(result).toHaveProperty("content");
			expect(result).toHaveProperty("metadata");
		});
	});
});
