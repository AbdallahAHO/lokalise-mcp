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
import { ProjectsMockBuilder } from "../../test-utils/mock-builders/projects.mock.js";
import projectsController from "./projects.controller.js";
import projectsTool from "./projects.tool.js";
import type {
	CreateProjectToolArgsType,
	DeleteProjectToolArgsType,
	EmptyProjectToolArgsType,
	GetProjectDetailsToolArgsType,
	ListProjectsToolArgsType,
	UpdateProjectToolArgsType,
} from "./projects.types.js";

// Mock the controller
// TODO: Fix Jest ESM mock configuration issue
// jest.mock("./projects.controller.js");

describe.skip("ProjectsTool", () => {
	let server: McpServer;
	const mockedController = jest.mocked(projectsController);
	const mockToolHandlers = new Map<
		string,
		(args: unknown) => Promise<unknown>
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
					tools: {},
				},
			},
		);

		// Mock the server.tool method to capture handlers
		server.tool = jest.fn(
			(
				name: string,
				_description: string,
				_schema: unknown,
				handler: (args: unknown) => Promise<unknown>,
			) => {
				mockToolHandlers.set(name, handler);
			},
		) as unknown;
	});

	afterEach(() => {
		jest.clearAllMocks();
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
			const args: ListProjectsToolArgsType = {};

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
				new McpError("API_ERROR", "Service unavailable"),
			);

			const handler = mockToolHandlers.get("lokalise_list_projects");

			// Act
			const result = await handler?.({});

			// Assert
			expect(result).toEqual({
				content: [{ type: "text", text: expect.stringContaining("Error") }],
				isError: true,
			});
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
				baseLangIso: "en",
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
				new McpError("VALIDATION_ERROR", "Name is required"),
			);

			const handler = mockToolHandlers.get("lokalise_create_project");
			const args: CreateProjectToolArgsType = {
				name: "",
			};

			// Act
			const result = await handler?.(args);

			// Assert
			expect(result).toEqual({
				content: [{ type: "text", text: expect.stringContaining("Error") }],
				isError: true,
			});
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
				name: "Updated Name",
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
			const calls = (server.tool as jest.Mock).mock.calls;

			// Assert
			calls.forEach(([_name, _desc, schema]) => {
				expect(schema).toBeDefined();
				expect(schema).toHaveProperty("type", "object");
				expect(schema).toHaveProperty("properties");
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
			const error = new McpError("CONTROLLER_ERROR", "Controller failed");
			mockedController.listProjects.mockRejectedValue(error);

			const handler = mockToolHandlers.get("lokalise_list_projects");

			// Act
			const result = await handler?.({});

			// Assert
			expect(result).toHaveProperty("isError", true);
			expect(result).toHaveProperty("content");
			const content = (result as unknown).content[0].text;
			expect(content).toContain("Error");
		});

		it("should handle unexpected errors", async () => {
			// Arrange
			mockedController.listProjects.mockRejectedValue(new Error("Unexpected"));

			const handler = mockToolHandlers.get("lokalise_list_projects");

			// Act
			const result = await handler?.({});

			// Assert
			expect(result).toHaveProperty("isError", true);
		});
	});
});
