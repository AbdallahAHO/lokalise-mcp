import { Command } from "commander";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ErrorType, McpError } from "../../shared/utils/error.util.js";

// Mock the controller with explicit implementation
vi.mock("./projects.controller.js", () => ({
	default: {
		listProjects: vi.fn(),
		getProjectDetails: vi.fn(),
		createProject: vi.fn(),
		updateProject: vi.fn(),
		deleteProject: vi.fn(),
		emptyProject: vi.fn(),
	},
}));

import projectsCli from "./projects.cli.js";
import projectsController from "./projects.controller.js";

describe("ProjectsCLI", () => {
	let program: Command;
	const mockedController = vi.mocked(projectsController);

	beforeEach(() => {
		vi.clearAllMocks();
		program = new Command();
		program.exitOverride(); // Prevent process.exit during tests
		program.configureOutput({
			writeOut: vi.fn(),
			writeErr: vi.fn(),
		});
		// Mock process.exit locally when needed
		vi.spyOn(process, "exit").mockImplementation(() => undefined as never);
	});

	afterEach(() => {
		vi.clearAllMocks();
	});

	describe("CLI Registration", () => {
		it("should register all 6 project commands", () => {
			// Act
			projectsCli.register(program);

			// Assert
			const commands = program.commands.map((cmd) => cmd.name());
			expect(commands).toContain("list-projects");
			expect(commands).toContain("get-project-details");
			expect(commands).toContain("create-project");
			expect(commands).toContain("update-project");
			expect(commands).toContain("delete-project");
			expect(commands).toContain("empty-project");
			expect(commands).toHaveLength(6);
		});

		it("should provide metadata about the CLI", () => {
			// Act
			const meta = projectsCli.getMeta?.();

			// Assert
			expect(meta).toBeDefined();
			expect(meta?.name).toBe("projects");
			expect(meta?.description).toContain("CLI");
			expect(meta?.cliCommandsCount).toBe(6);
		});
	});

	describe("list-projects command", () => {
		beforeEach(() => {
			projectsCli.register(program);
		});

		it("should list projects with default options", async () => {
			// Arrange
			const mockResponse = {
				content: "# Projects List\n- Project 1\n- Project 2",
				data: [],
				metadata: { total: 2 },
			};
			mockedController.listProjects.mockResolvedValue(mockResponse);

			// Act
			await program.parseAsync(["node", "test", "list-projects"]);

			// Assert
			expect(mockedController.listProjects).toHaveBeenCalledWith({
				limit: undefined,
				page: undefined,
				includeStats: false,
			});
			expect(console.log).toHaveBeenCalledWith(mockResponse.content);
		});

		it("should handle pagination options", async () => {
			// Arrange
			const mockResponse = {
				content: "# Projects Page 2",
				data: [],
				metadata: {},
			};
			mockedController.listProjects.mockResolvedValue(mockResponse);

			// Act
			await program.parseAsync([
				"node",
				"test",
				"list-projects",
				"--page",
				"2",
				"--limit",
				"50",
			]);

			// Assert
			expect(mockedController.listProjects).toHaveBeenCalledWith({
				page: 2,
				limit: 50,
				includeStats: false,
			});
		});

		it("should handle include-stats option", async () => {
			// Arrange
			const mockResponse = {
				content: "# Projects with Stats",
				data: [],
				metadata: {},
			};
			mockedController.listProjects.mockResolvedValue(mockResponse);

			// Act
			await program.parseAsync([
				"node",
				"test",
				"list-projects",
				"--include-stats",
			]);

			// Assert
			expect(mockedController.listProjects).toHaveBeenCalledWith({
				limit: undefined,
				page: undefined,
				includeStats: true,
			});
		});

		it("should handle controller errors", async () => {
			// Arrange
			mockedController.listProjects.mockRejectedValue(
				new McpError("Service unavailable", ErrorType.API_ERROR),
			);

			// Act & Assert
			try {
				await program.parseAsync(["node", "test", "list-projects"]);
			} catch {
				// Expected - process.exit is mocked to not actually exit
			}

			expect(console.error).toHaveBeenCalledWith(
				expect.stringContaining("Error"),
			);
			expect(process.exit).toHaveBeenCalledWith(1);
		});
	});

	describe("get-project-details command", () => {
		beforeEach(() => {
			projectsCli.register(program);
		});

		it("should get project details", async () => {
			// Arrange
			const mockResponse = {
				content: "# Project Details",
				data: { project_id: "test-123" },
				metadata: {},
			};
			mockedController.getProjectDetails.mockResolvedValue(mockResponse);

			// Act
			await program.parseAsync([
				"node",
				"test",
				"get-project-details",
				"test-123",
			]);

			// Assert
			expect(mockedController.getProjectDetails).toHaveBeenCalledWith({
				projectId: "test-123",
				includeLanguages: false,
				includeKeysSummary: false,
			});
			expect(console.log).toHaveBeenCalledWith(mockResponse.content);
		});

		it("should handle optional flags", async () => {
			// Arrange
			const mockResponse = {
				content: "# Project with options",
				data: {},
				metadata: {},
			};
			mockedController.getProjectDetails.mockResolvedValue(mockResponse);

			// Act
			await program.parseAsync([
				"node",
				"test",
				"get-project-details",
				"test-123",
				"--include-languages",
				"--include-keys-summary",
			]);

			// Assert
			expect(mockedController.getProjectDetails).toHaveBeenCalledWith({
				projectId: "test-123",
				includeLanguages: true,
				includeKeysSummary: true,
			});
		});
	});

	describe("create-project command", () => {
		beforeEach(() => {
			projectsCli.register(program);
		});

		it("should create project with name only", async () => {
			// Arrange
			const mockResponse = {
				content: "# Project Created",
				data: { project_id: "new-123", name: "New Project" },
				metadata: {},
			};
			mockedController.createProject.mockResolvedValue(mockResponse);

			// Act
			await program.parseAsync([
				"node",
				"test",
				"create-project",
				"New Project",
			]);

			// Assert
			expect(mockedController.createProject).toHaveBeenCalledWith({
				name: "New Project",
				description: undefined,
				base_lang_iso: "en",
			});
			expect(console.log).toHaveBeenCalledWith(mockResponse.content);
		});

		it("should create project with all options", async () => {
			// Arrange
			const mockResponse = {
				content: "# Project Created",
				data: {},
				metadata: {},
			};
			mockedController.createProject.mockResolvedValue(mockResponse);

			// Act
			await program.parseAsync([
				"node",
				"test",
				"create-project",
				"Full Project",
				"--description",
				"Test description",
				"--base-lang",
				"de",
			]);

			// Assert
			expect(mockedController.createProject).toHaveBeenCalledWith({
				name: "Full Project",
				description: "Test description",
				base_lang_iso: "de",
			});
		});
	});

	describe("update-project command", () => {
		beforeEach(() => {
			projectsCli.register(program);
		});

		it("should update project name", async () => {
			// Arrange
			const mockResponse = {
				content: "# Project Updated",
				data: {},
				metadata: {},
			};
			mockedController.updateProject.mockResolvedValue(mockResponse);

			// Act
			await program.parseAsync([
				"node",
				"test",
				"update-project",
				"test-123",
				"--name",
				"Updated Name",
			]);

			// Assert
			expect(mockedController.updateProject).toHaveBeenCalledWith({
				projectId: "test-123",
				projectData: {
					name: "Updated Name",
				},
			});
		});

		it("should update project description", async () => {
			// Arrange
			const mockResponse = {
				content: "# Project Updated",
				data: {},
				metadata: {},
			};
			mockedController.updateProject.mockResolvedValue(mockResponse);

			// Act
			await program.parseAsync([
				"node",
				"test",
				"update-project",
				"test-123",
				"--description",
				"New description",
			]);

			// Assert
			expect(mockedController.updateProject).toHaveBeenCalledWith({
				projectId: "test-123",
				projectData: {
					description: "New description",
				},
			});
		});

		it("should update both name and description", async () => {
			// Arrange
			const mockResponse = {
				content: "# Project Updated",
				data: {},
				metadata: {},
			};
			mockedController.updateProject.mockResolvedValue(mockResponse);

			// Act
			await program.parseAsync([
				"node",
				"test",
				"update-project",
				"test-123",
				"--name",
				"New Name",
				"--description",
				"New Desc",
			]);

			// Assert
			expect(mockedController.updateProject).toHaveBeenCalledWith({
				projectId: "test-123",
				projectData: {
					name: "New Name",
					description: "New Desc",
				},
			});
		});

		it("should handle missing update fields", async () => {
			// Act & Assert
			try {
				await program.parseAsync([
					"node",
					"test",
					"update-project",
					"test-123",
				]);
			} catch {
				// Expected - process.exit is mocked to not actually exit
			}

			// Should not call controller and should error
			expect(mockedController.updateProject).not.toHaveBeenCalled();
			expect(console.error).toHaveBeenCalledWith(
				expect.stringContaining("At least one field must be provided"),
			);
			expect(process.exit).toHaveBeenCalledWith(1);
		});
	});

	describe("delete-project command", () => {
		beforeEach(() => {
			projectsCli.register(program);
		});

		it("should delete project with confirmation", async () => {
			// Arrange
			const mockResponse = {
				content: "# Project Deleted",
				data: { project_deleted: true },
				metadata: {},
			};
			mockedController.deleteProject.mockResolvedValue(mockResponse);

			// Act
			await program.parseAsync([
				"node",
				"test",
				"delete-project",
				"test-123",
				"--confirm",
			]);

			// Assert
			expect(mockedController.deleteProject).toHaveBeenCalledWith({
				projectId: "test-123",
			});
			expect(console.log).toHaveBeenCalledWith(mockResponse.content);
		});

		it("should skip deletion without confirmation", async () => {
			// Act & Assert
			try {
				await program.parseAsync([
					"node",
					"test",
					"delete-project",
					"test-123",
				]);
			} catch {
				// Expected - process.exit is mocked to not actually exit
			}

			expect(mockedController.deleteProject).not.toHaveBeenCalled();
			expect(console.error).toHaveBeenCalledWith(
				expect.stringContaining("requires confirmation"),
			);
			expect(process.exit).toHaveBeenCalledWith(1);
		});
	});

	describe("empty-project command", () => {
		beforeEach(() => {
			projectsCli.register(program);
		});

		it("should empty project with confirmation", async () => {
			// Arrange
			const mockResponse = {
				content: "# Project Emptied",
				data: { project_emptied: true, keys_deleted: 150 },
				metadata: {},
			};
			mockedController.emptyProject.mockResolvedValue(mockResponse);

			// Act
			await program.parseAsync([
				"node",
				"test",
				"empty-project",
				"test-123",
				"--confirm",
			]);

			// Assert
			expect(mockedController.emptyProject).toHaveBeenCalledWith({
				projectId: "test-123",
			});
			expect(console.log).toHaveBeenCalledWith(mockResponse.content);
		});

		it("should skip emptying without confirmation", async () => {
			// Act & Assert
			try {
				await program.parseAsync(["node", "test", "empty-project", "test-123"]);
			} catch {
				// Expected - process.exit is mocked to not actually exit
			}

			expect(mockedController.emptyProject).not.toHaveBeenCalled();
			expect(console.error).toHaveBeenCalledWith(
				expect.stringContaining("requires confirmation"),
			);
			expect(process.exit).toHaveBeenCalledWith(1);
		});
	});

	describe("Error Handling", () => {
		beforeEach(() => {
			projectsCli.register(program);
		});

		it("should handle controller errors gracefully", async () => {
			// Arrange
			mockedController.listProjects.mockRejectedValue(
				new Error("Controller failed"),
			);

			// Act & Assert
			try {
				await program.parseAsync(["node", "test", "list-projects"]);
			} catch {
				// Expected - process.exit is mocked to not actually exit
			}

			expect(console.error).toHaveBeenCalledWith(
				expect.stringContaining("Error"),
			);
			expect(process.exit).toHaveBeenCalledWith(1);
		});

		it("should handle invalid command", async () => {
			// Act & Assert
			await expect(
				program.parseAsync(["node", "test", "invalid-command"]),
			).rejects.toThrow();
		});

		it("should handle missing required arguments", async () => {
			// Act & Assert
			await expect(
				program.parseAsync(["node", "test", "get-project-details"]),
			).rejects.toThrow();
		});
	});

	describe("Output Formatting", () => {
		beforeEach(() => {
			projectsCli.register(program);
		});

		it("should output markdown formatted content", async () => {
			// Arrange
			const mockResponse = {
				content: "# Markdown Output\n\n**Bold** and _italic_ text",
				data: [],
				metadata: {},
			};
			mockedController.listProjects.mockResolvedValue(mockResponse);

			// Act
			await program.parseAsync(["node", "test", "list-projects"]);

			// Assert
			expect(console.log).toHaveBeenCalledWith(mockResponse.content);
		});

		it("should handle empty responses", async () => {
			// Arrange
			const mockResponse = {
				content: "",
				data: [],
				metadata: {},
			};
			mockedController.listProjects.mockResolvedValue(mockResponse);

			// Act
			await program.parseAsync(["node", "test", "list-projects"]);

			// Assert
			expect(console.log).toHaveBeenCalledWith("");
		});
	});

	describe("Auto-Discovery", () => {
		it("should be discoverable via DomainCli interface", () => {
			// Assert
			expect(projectsCli).toHaveProperty("register");
			expect(typeof projectsCli.register).toBe("function");
			expect(projectsCli).toHaveProperty("getMeta");
			expect(typeof projectsCli.getMeta).toBe("function");
		});

		it("should register without errors", () => {
			// Act & Assert
			expect(() => projectsCli.register(program)).not.toThrow();
		});
	});
});
