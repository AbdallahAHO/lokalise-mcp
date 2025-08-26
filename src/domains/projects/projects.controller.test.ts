import {
	afterEach,
	beforeEach,
	describe,
	expect,
	it,
	jest,
} from "@jest/globals";
import type {
	Project,
	ProjectDeleted,
	ProjectEmptied,
} from "@lokalise/node-api";
// ControllerResponse type is used in function return type signatures
import { ErrorType, McpError } from "../../shared/utils/error.util.js";
import { generators } from "../../test-utils/fixture-helpers/generators.js";
import { ProjectsMockBuilder } from "../../test-utils/mock-builders/projects.mock.js";
import projectsController from "./projects.controller.js";
import * as projectsService from "./projects.service.js";
import type {
	CreateProjectToolArgsType,
	DeleteProjectToolArgsType,
	EmptyProjectToolArgsType,
	GetProjectDetailsToolArgsType,
	ListProjectsToolArgsType,
	UpdateProjectToolArgsType,
} from "./projects.types.js";

// Mock the service module
// TODO: Fix Jest ESM mock configuration issue
// jest.mock("./projects.service.js");

describe.skip("ProjectsController", () => {
	// Since we can't use jest.mock() with ESM, manually create mocks
	beforeEach(() => {
		jest.clearAllMocks();
		// Manually mock the service functions
		(projectsService as any).default = {
			getProjects: jest.fn(),
			getProjectDetails: jest.fn(),
			createProject: jest.fn(),
			updateProject: jest.fn(),
			deleteProject: jest.fn(),
			emptyProject: jest.fn(),
		};
	});

	afterEach(() => {
		jest.clearAllMocks();
	});

	describe("listProjects", () => {
		it("should list projects with default parameters", async () => {
			// Arrange
			const mockBuilder = new ProjectsMockBuilder();
			const mockProjects = [
				mockBuilder.withProject({ name: "Project 1", project_id: "123" })
					.projects[0],
				mockBuilder.withProject({ name: "Project 2", project_id: "456" })
					.projects[0],
			];
			(projectsService as any).default.getProjects.mockResolvedValue(
				mockProjects,
			);

			const args: ListProjectsToolArgsType = {
				includeStats: false,
			};

			// Act
			const result = await projectsController.listProjects(args);

			// Assert
			expect(result).toHaveProperty("content");
			expect(result.content).toContain("Project 1");
			expect(result.content).toContain("Project 2");
			expect((projectsService as any).default.getProjects).toHaveBeenCalledWith(
				{
					page: undefined,
					limit: undefined,
				},
			);
		});

		it("should apply custom pagination parameters", async () => {
			// Arrange
			const mockProjects: Project[] = [];
			(projectsService as any).default.getProjects.mockResolvedValue(
				mockProjects,
			);

			const args: ListProjectsToolArgsType = {
				page: 2,
				limit: 50,
				includeStats: false,
			};

			// Act
			await projectsController.listProjects(args);

			// Assert
			expect((projectsService as any).default.getProjects).toHaveBeenCalledWith(
				{
					page: 2,
					limit: 50,
				},
			);
		});

		it("should validate page number", async () => {
			// Arrange
			const args: ListProjectsToolArgsType = {
				page: -1, // Invalid page
				includeStats: false,
			};

			// Act & Assert
			await expect(projectsController.listProjects(args)).rejects.toThrow(
				McpError,
			);
			await expect(projectsController.listProjects(args)).rejects.toThrow(
				"VALIDATION_ERROR",
			);
		});

		it("should validate limit range", async () => {
			// Arrange
			const args: ListProjectsToolArgsType = {
				limit: 1001, // Exceeds maximum
				includeStats: false,
			};

			// Act & Assert
			await expect(projectsController.listProjects(args)).rejects.toThrow(
				McpError,
			);
			await expect(projectsController.listProjects(args)).rejects.toThrow(
				"VALIDATION_ERROR",
			);
		});

		it("should handle includeStats parameter", async () => {
			// Arrange
			const mockBuilder = new ProjectsMockBuilder();
			const mockProject = mockBuilder.withProject({
				name: "Project with Stats",
				statistics: {
					keys_total: 100,
					progress_total: 75,
					team: 5,
					base_words: 500,
					qa_issues_total: 2,
					qa_issues: {
						not_reviewed: 0,
						unverified: 0,
						spelling_grammar: 0,
						inconsistent_placeholders: 0,
						inconsistent_html: 0,
						different_number_of_urls: 0,
						different_urls: 0,
						leading_whitespace: 0,
						trailing_whitespace: 0,
						different_number_of_email_address: 0,
						different_email_address: 0,
						different_brackets: 0,
						different_numbers: 0,
						double_space: 0,
						special_placeholder: 0,
						unbalanced_brackets: 0,
					},
					languages: [],
				},
			}).projects[0];
			(projectsService as any).default.getProjects.mockResolvedValue([
				mockProject,
			]);

			const args: ListProjectsToolArgsType = {
				includeStats: true,
			};

			// Act
			const result = await projectsController.listProjects(args);

			// Assert
			expect(result.content).toContain("keys");
			expect(result.content).toContain("75%");
		});

		it("should format empty project list", async () => {
			// Arrange
			(projectsService as any).default.getProjects.mockResolvedValue([]);

			// Act
			const result = await projectsController.listProjects({
				includeStats: false,
			});

			// Assert
			expect(result.content).toContain("No projects found");
		});

		it("should generate pagination metadata", async () => {
			// Arrange
			const mockProjects = Array(50)
				.fill(null)
				.map((_, i) => ({
					project_id: `id-${i}`,
					name: `Project ${i}`,
				})) as Project[];
			(projectsService as any).default.getProjects.mockResolvedValue(
				mockProjects,
			);

			const args: ListProjectsToolArgsType = {
				page: 1,
				limit: 50,
				includeStats: false,
			};

			// Act
			const result = await projectsController.listProjects(args);

			// Assert
			expect(result.content).toContain("50");
			expect(result.content).toContain("Page 1");
		});

		it("should handle service errors", async () => {
			// Arrange
			(projectsService as any).default.getProjects.mockRejectedValue(
				new McpError("Service unavailable", ErrorType.API_ERROR),
			);

			// Act & Assert
			await expect(
				projectsController.listProjects({ includeStats: false }),
			).rejects.toThrow("Service unavailable");
		});
	});

	describe("getProjectDetails", () => {
		it("should get project details successfully", async () => {
			// Arrange
			const mockBuilder = new ProjectsMockBuilder();
			const mockProject = mockBuilder.withProject({
				project_id: "test-123",
				name: "Test Project",
				description: "Test Description",
				statistics: {
					keys_total: 100,
					progress_total: 75,
					team: 5,
					base_words: 500,
					qa_issues_total: 2,
					qa_issues: {
						not_reviewed: 0,
						unverified: 0,
						spelling_grammar: 0,
						inconsistent_placeholders: 0,
						inconsistent_html: 0,
						different_number_of_urls: 0,
						different_urls: 0,
						leading_whitespace: 0,
						trailing_whitespace: 0,
						different_number_of_email_address: 0,
						different_email_address: 0,
						different_brackets: 0,
						different_numbers: 0,
						double_space: 0,
						special_placeholder: 0,
						unbalanced_brackets: 0,
					},
					languages: [],
				},
			}).projects[0];
			(projectsService as any).default.getProjectDetails.mockResolvedValue(
				mockProject,
			);

			const args: GetProjectDetailsToolArgsType = {
				projectId: "test-123",
				includeLanguages: false,
				includeKeysSummary: false,
			};

			// Act
			const result = await projectsController.getProjectDetails(args);

			// Assert
			expect(result.content).toContain("Test Project");
			expect(result.content).toContain("Test Description");
			expect(
				(projectsService as any).default.getProjectDetails,
			).toHaveBeenCalledWith("test-123");
		});

		it("should validate project ID format", async () => {
			// Arrange
			const args: GetProjectDetailsToolArgsType = {
				projectId: "", // Empty ID
				includeLanguages: false,
				includeKeysSummary: false,
			};

			// Act & Assert
			await expect(projectsController.getProjectDetails(args)).rejects.toThrow(
				McpError,
			);
			await expect(projectsController.getProjectDetails(args)).rejects.toThrow(
				"VALIDATION_ERROR",
			);
		});

		it("should handle includeLanguages option", async () => {
			// Arrange
			const mockProject = {
				project_id: "test-123",
				name: "Test Project",
				statistics: {
					languages: [
						{ language_iso: "en", progress: 100 },
						{ language_iso: "de", progress: 50 },
					],
				},
			} as unknown as Project;
			(projectsService as any).default.getProjectDetails.mockResolvedValue(
				mockProject,
			);

			const args: GetProjectDetailsToolArgsType = {
				projectId: "test-123",
				includeLanguages: true,
				includeKeysSummary: false,
			};

			// Act
			const result = await projectsController.getProjectDetails(args);

			// Assert
			expect(result.content).toContain("en");
			expect(result.content).toContain("de");
			expect(result.content).toContain("100%");
			expect(result.content).toContain("50%");
		});

		it("should handle includeKeysSummary option", async () => {
			// Arrange
			const mockProject = {
				project_id: "test-123",
				name: "Test Project",
				statistics: {
					keys_total: 150,
					keys_translated: 100,
					keys_untranslated: 50,
				},
			} as unknown as Project;
			(projectsService as any).default.getProjectDetails.mockResolvedValue(
				mockProject,
			);

			const args: GetProjectDetailsToolArgsType = {
				projectId: "test-123",
				includeLanguages: false,
				includeKeysSummary: true,
			};

			// Act
			const result = await projectsController.getProjectDetails(args);

			// Assert
			expect(result.content).toContain("150");
		});

		it("should handle project not found", async () => {
			// Arrange
			(projectsService as any).default.getProjectDetails.mockRejectedValue(
				new McpError("Project not found", ErrorType.NOT_FOUND),
			);

			const args: GetProjectDetailsToolArgsType = {
				projectId: "non-existent",
				includeLanguages: false,
				includeKeysSummary: false,
			};

			// Act & Assert
			await expect(projectsController.getProjectDetails(args)).rejects.toThrow(
				"Project not found",
			);
		});
	});

	describe("createProject", () => {
		it("should create project with minimal data", async () => {
			// Arrange
			const mockProject = {
				project_id: generators.id.project(1),
				name: "New Project",
				created_at: generators.timestamp().formatted,
			} as Project;
			(projectsService as any).default.createProject.mockResolvedValue(
				mockProject,
			);

			const args: CreateProjectToolArgsType = {
				name: "New Project",
				base_lang_iso: "en",
			};

			// Act
			const result = await projectsController.createProject(args);

			// Assert
			expect(result.content).toContain("New Project");
			expect(result.content).toContain("successfully created");
			expect(
				(projectsService as any).default.createProject,
			).toHaveBeenCalledWith({
				name: "New Project",
				description: undefined,
				base_lang_iso: undefined,
				languages: undefined,
			});
		});

		it("should create project with full data", async () => {
			// Arrange
			const mockProject = {
				project_id: generators.id.project(2),
				name: "Full Project",
				description: "Complete project",
				base_language_iso: "de",
			} as Project;
			(projectsService as any).default.createProject.mockResolvedValue(
				mockProject,
			);

			const args: CreateProjectToolArgsType = {
				name: "Full Project",
				description: "Complete project",
				base_lang_iso: "de",
				languages: [{ lang_iso: "de" }, { lang_iso: "en" }, { lang_iso: "fr" }],
			};

			// Act
			const result = await projectsController.createProject(args);

			// Assert
			expect(result.content).toContain("Full Project");
			expect(
				(projectsService as any).default.createProject,
			).toHaveBeenCalledWith({
				name: "Full Project",
				description: "Complete project",
				base_lang_iso: "de",
				languages: [{ lang_iso: "de" }, { lang_iso: "en" }, { lang_iso: "fr" }],
			});
		});

		it("should validate project name", async () => {
			// Arrange
			const args: CreateProjectToolArgsType = {
				name: "", // Empty name
				base_lang_iso: "en",
			};

			// Act & Assert
			await expect(projectsController.createProject(args)).rejects.toThrow(
				"VALIDATION_ERROR",
			);
		});

		it("should validate project name length", async () => {
			// Arrange
			const args: CreateProjectToolArgsType = {
				name: "x".repeat(256), // Too long
				base_lang_iso: "en",
			};

			// Act & Assert
			await expect(projectsController.createProject(args)).rejects.toThrow(
				"VALIDATION_ERROR",
			);
		});

		it("should validate base language ISO", async () => {
			// Arrange
			const args: CreateProjectToolArgsType = {
				name: "Test Project",
				base_lang_iso: "invalid", // Invalid ISO code
			};

			// Act & Assert
			await expect(projectsController.createProject(args)).rejects.toThrow(
				"VALIDATION_ERROR",
			);
		});

		it("should handle duplicate project name error", async () => {
			// Arrange
			(projectsService as any).default.createProject.mockRejectedValue(
				new McpError("Project name already exists", ErrorType.API_ERROR),
			);

			const args: CreateProjectToolArgsType = {
				name: "Existing Project",
				base_lang_iso: "en",
			};

			// Act & Assert
			await expect(projectsController.createProject(args)).rejects.toThrow(
				"Project name already exists",
			);
		});
	});

	describe("updateProject", () => {
		it("should update project name", async () => {
			// Arrange
			const mockProject = {
				project_id: "test-123",
				name: "Updated Name",
			} as Project;
			(projectsService as any).default.updateProject.mockResolvedValue(
				mockProject,
			);

			const args: UpdateProjectToolArgsType = {
				projectId: "test-123",
				projectData: {
					name: "Updated Name",
				},
			};

			// Act
			const result = await projectsController.updateProject(args);

			// Assert
			expect(result.content).toContain("Updated Name");
			expect(result.content).toContain("successfully updated");
			expect(
				(projectsService as any).default.updateProject,
			).toHaveBeenCalledWith("test-123", {
				name: "Updated Name",
				description: undefined,
			});
		});

		it("should update project description", async () => {
			// Arrange
			const mockProject = {
				project_id: "test-123",
				description: "New description",
			} as Project;
			(projectsService as any).default.updateProject.mockResolvedValue(
				mockProject,
			);

			const args: UpdateProjectToolArgsType = {
				projectId: "test-123",
				projectData: {
					description: "New description",
				},
			};

			// Act
			const result = await projectsController.updateProject(args);

			// Assert
			expect(result.content).toContain("New description");
			expect(
				(projectsService as any).default.updateProject,
			).toHaveBeenCalledWith("test-123", {
				name: undefined,
				description: "New description",
			});
		});

		it("should validate at least one update field", async () => {
			// Arrange
			const args: UpdateProjectToolArgsType = {
				projectId: "test-123",
				projectData: {
					// No update fields provided
				},
			};

			// Act & Assert
			await expect(projectsController.updateProject(args)).rejects.toThrow(
				"VALIDATION_ERROR",
			);
			await expect(projectsController.updateProject(args)).rejects.toThrow(
				"At least one field",
			);
		});

		it("should handle partial updates", async () => {
			// Arrange
			const mockProject = {
				project_id: "test-123",
				name: "Partially Updated",
				description: "Original description",
			} as Project;
			(projectsService as any).default.updateProject.mockResolvedValue(
				mockProject,
			);

			const args: UpdateProjectToolArgsType = {
				projectId: "test-123",
				projectData: {
					name: "Partially Updated",
				},
			};

			// Act
			const result = await projectsController.updateProject(args);

			// Assert
			expect(result.content).toContain("Partially Updated");
			expect(
				(projectsService as any).default.updateProject,
			).toHaveBeenCalledWith("test-123", {
				name: "Partially Updated",
				description: undefined,
			});
		});
	});

	describe("deleteProject", () => {
		it("should delete project successfully", async () => {
			// Arrange
			const mockResult: ProjectDeleted = {
				project_deleted: true,
				project_id: "test-123",
			};
			(projectsService as any).default.deleteProject.mockResolvedValue(
				mockResult,
			);

			const args: DeleteProjectToolArgsType = {
				projectId: "test-123",
			};

			// Act
			const result = await projectsController.deleteProject(args);

			// Assert
			expect(result.content).toContain("successfully deleted");
			expect(
				(projectsService as any).default.deleteProject,
			).toHaveBeenCalledWith("test-123");
		});

		it("should handle deletion failure", async () => {
			// Arrange
			const mockResult: ProjectDeleted = {
				project_deleted: false,
				project_id: "test-123",
			};
			(projectsService as any).default.deleteProject.mockResolvedValue(
				mockResult,
			);

			const args: DeleteProjectToolArgsType = {
				projectId: "test-123",
			};

			// Act
			const result = await projectsController.deleteProject(args);

			// Assert
			expect(result.content).toContain("Could not delete");
		});

		it("should validate project ID", async () => {
			// Arrange
			const args: DeleteProjectToolArgsType = {
				projectId: "",
			};

			// Act & Assert
			await expect(projectsController.deleteProject(args)).rejects.toThrow(
				"VALIDATION_ERROR",
			);
		});
	});

	describe("emptyProject", () => {
		it("should empty project successfully", async () => {
			// Arrange
			const mockResult: ProjectEmptied = {
				project_emptied: true,
				keys_deleted: true,
			};
			(projectsService as any).default.emptyProject.mockResolvedValue(
				mockResult,
			);

			const args: EmptyProjectToolArgsType = {
				projectId: "test-123",
			};

			// Act
			const result = await projectsController.emptyProject(args);

			// Assert
			expect(result.content).toContain("successfully emptied");
			expect(
				(projectsService as any).default.emptyProject,
			).toHaveBeenCalledWith("test-123");
		});

		it("should handle emptying already empty project", async () => {
			// Arrange
			const mockResult: ProjectEmptied = {
				project_emptied: true,
				keys_deleted: true,
			};
			(projectsService as any).default.emptyProject.mockResolvedValue(
				mockResult,
			);

			const args: EmptyProjectToolArgsType = {
				projectId: "test-123",
			};

			// Act
			const result = await projectsController.emptyProject(args);

			// Assert
			expect(result.content).toContain("already empty");
		});

		it("should handle large number of keys", async () => {
			// Arrange
			const mockResult: ProjectEmptied = {
				project_emptied: true,
				keys_deleted: true,
			};
			(projectsService as any).default.emptyProject.mockResolvedValue(
				mockResult,
			);

			const args: EmptyProjectToolArgsType = {
				projectId: "test-123",
			};

			// Act
			const result = await projectsController.emptyProject(args);

			// Assert
			expect(result.content).toContain("successfully emptied");
		});

		it("should validate project ID", async () => {
			// Arrange
			const args: EmptyProjectToolArgsType = {
				projectId: "",
			};

			// Act & Assert
			await expect(projectsController.emptyProject(args)).rejects.toThrow(
				"VALIDATION_ERROR",
			);
		});
	});

	describe("Error Handling", () => {
		it("should transform service errors to controller format", async () => {
			// Arrange
			(projectsService as any).default.getProjects.mockRejectedValue(
				new Error("Network error"),
			);

			// Act & Assert
			await expect(
				projectsController.listProjects({ includeStats: false }),
			).rejects.toThrow(McpError);
		});

		it("should preserve error context", async () => {
			// Arrange
			const error = new McpError(
				"Rate limited",
				ErrorType.RATE_LIMIT_EXCEEDED,
				429,
			);
			(projectsService as any).default.getProjects.mockRejectedValue(error);

			// Act & Assert
			try {
				await projectsController.listProjects({ includeStats: false });
			} catch (err) {
				expect(err).toBeInstanceOf(McpError);
				const mcpErr = err as McpError;
				expect(mcpErr.statusCode).toBe(429);
			}
		});

		it("should add controller context to errors", async () => {
			// Arrange
			(projectsService as any).default.getProjectDetails.mockRejectedValue(
				new Error("Database connection failed"),
			);

			// Act & Assert
			try {
				await projectsController.getProjectDetails({
					projectId: "test-123",
					includeLanguages: false,
					includeKeysSummary: false,
				});
			} catch (err) {
				expect(err).toBeInstanceOf(McpError);
				const mcpErr = err as McpError;
				expect(mcpErr.message).toContain("Database connection failed");
			}
		});
	});

	describe("Response Formatting", () => {
		it("should format response as ControllerResponse", async () => {
			// Arrange
			const mockProjects = [{ name: "Test" }] as Project[];
			(projectsService as any).default.getProjects.mockResolvedValue(
				mockProjects,
			);

			// Act
			const result = await projectsController.listProjects({
				includeStats: false,
			});

			// Assert
			expect(result).toHaveProperty("content");
			expect(typeof result.content).toBe("string");
		});

		it("should include markdown formatting in content", async () => {
			// Arrange
			const mockProject = {
				project_id: "test-123",
				name: "Test Project",
				description: "Test Description",
			} as Project;
			(projectsService as any).default.getProjectDetails.mockResolvedValue(
				mockProject,
			);

			// Act
			const result = await projectsController.getProjectDetails({
				projectId: "test-123",
				includeLanguages: false,
				includeKeysSummary: false,
			});

			// Assert
			expect(result.content).toContain("#"); // Markdown header
			expect(result.content).toContain("**"); // Bold text
			expect(result.content).toContain("-"); // List items
		});
	});
});
