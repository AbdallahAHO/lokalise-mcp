import type {
	CreateProjectParams,
	LokaliseApi,
	ProjectDeleted,
	ProjectEmptied,
	UpdateProjectParams,
} from "@lokalise/node-api";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ErrorType, McpError } from "../../shared/utils/error.util.js";
import {
	createNotFoundError,
	createRateLimitedError,
	createServerError,
	createUnauthorizedError,
	createValidationError,
} from "../../test-utils/error-simulator.js";
import { generators } from "../../test-utils/fixture-helpers/generators.js";
import { ProjectsMockBuilder } from "../../test-utils/mock-builders/projects.mock.js";
import { createMockLokaliseApi } from "../../test-utils/mock-factory.js";

// Mock the lokalise-api.util module
vi.mock("../../shared/utils/lokalise-api.util.js");

import { getLokaliseApi } from "../../shared/utils/lokalise-api.util.js";
// Import the service and the mocked module
import projectsService from "./projects.service.js";

// Get the mocked function for type safety
const mockGetLokaliseApi = vi.mocked(getLokaliseApi);

describe("ProjectsService", () => {
	let mockApi: ReturnType<typeof createMockLokaliseApi>;
	// biome-ignore lint/suspicious/noExplicitAny: its a mock
	let mockProjects: any;

	beforeEach(() => {
		// Clear all mocks
		vi.clearAllMocks();

		// Create mock API
		mockApi = createMockLokaliseApi();
		mockProjects = mockApi.projects();

		// Configure the mock to return our API
		mockGetLokaliseApi.mockReturnValue(mockApi as unknown as LokaliseApi);
	});

	afterEach(() => {
		vi.clearAllMocks();
	});

	describe("getProjects", () => {
		it("should fetch projects with default pagination", async () => {
			// Arrange
			const mockBuilder = new ProjectsMockBuilder();
			const mockResponse = mockBuilder
				.withProject({ name: "Project 1", project_id: "123" })
				.withProject({ name: "Project 2", project_id: "456" })
				.withPagination(1, 100)
				.build();

			mockProjects.list.mockResolvedValue(mockResponse);

			// Act
			const result = await projectsService.getProjects();

			// Assert
			expect(result).toHaveLength(2);
			expect(result[0].name).toBe("Project 1");
			expect(result[1].name).toBe("Project 2");
			expect(mockProjects.list).toHaveBeenCalledWith({
				limit: undefined,
				page: undefined,
			});
		});

		it("should fetch projects with custom pagination", async () => {
			// Arrange
			const mockBuilder = new ProjectsMockBuilder();
			const mockResponse = mockBuilder
				.withProject({ name: "Project 3" })
				.withPagination(2, 50)
				.build();

			mockProjects.list.mockResolvedValue(mockResponse);

			// Act
			const result = await projectsService.getProjects({ page: 2, limit: 50 });

			// Assert
			expect(result).toHaveLength(1);
			expect(mockProjects.list).toHaveBeenCalledWith({
				page: 2,
				limit: 50,
			});
		});

		it("should handle empty project list", async () => {
			// Arrange
			const mockBuilder = new ProjectsMockBuilder();
			const mockResponse = mockBuilder.withPagination(1, 100).build();

			mockProjects.list.mockResolvedValue(mockResponse);

			// Act
			const result = await projectsService.getProjects();

			// Assert
			expect(result).toHaveLength(0);
			expect(result).toEqual([]);
		});

		it("should handle API errors", async () => {
			// Arrange
			const error = createUnauthorizedError();
			mockProjects.list.mockRejectedValue(error);

			// Act & Assert
			await expect(projectsService.getProjects()).rejects.toThrow(McpError);
		});

		it("should handle rate limiting (429)", async () => {
			// Arrange
			const error = createRateLimitedError();
			mockProjects.list.mockRejectedValue(error);

			// Act & Assert
			await expect(projectsService.getProjects()).rejects.toThrow(
				"Unexpected service error while fetching Lokalise projects",
			);
		});

		it("should handle server errors (500)", async () => {
			// Arrange
			const error = createServerError();
			mockProjects.list.mockRejectedValue(error);

			// Act & Assert
			await expect(projectsService.getProjects()).rejects.toThrow(McpError);
		});
	});

	describe("getProjectDetails", () => {
		it("should fetch project details successfully", async () => {
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
						not_reviewed: 1,
						unverified: 1,
						spelling_grammar: 1,
						inconsistent_placeholders: 1,
						inconsistent_html: 1,
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

			mockProjects.get.mockResolvedValue(mockProject);

			// Act
			const result = await projectsService.getProjectDetails("test-123");

			// Assert
			expect(result).toEqual(mockProject);
			expect(result.project_id).toBe("test-123");
			expect(result.name).toBe("Test Project");
			expect(mockProjects.get).toHaveBeenCalledWith("test-123");
		});

		it("should handle project not found (404)", async () => {
			// Arrange
			const error = createNotFoundError("Project");
			mockProjects.get.mockRejectedValue(error);

			// Act & Assert
			await expect(
				projectsService.getProjectDetails("non-existent"),
			).rejects.toThrow(
				"Unexpected service error while fetching Lokalise project details",
			);
		});

		it("should handle invalid project ID", async () => {
			// Arrange
			const error = createValidationError([
				{ field: "project_id", message: "Invalid project ID format" },
			]);
			mockProjects.get.mockRejectedValue(error);

			// Act & Assert
			await expect(
				projectsService.getProjectDetails("invalid"),
			).rejects.toThrow(McpError);
		});
	});

	describe("createProject", () => {
		it("should create project with minimal data", async () => {
			// Arrange
			const projectData: CreateProjectParams = {
				name: "New Project",
			};
			const mockBuilder = new ProjectsMockBuilder();
			const mockProject = mockBuilder.withProject({
				project_id: generators.id.project(1),
				name: "New Project",
				created_at: generators.timestamp().formatted,
			}).projects[0];

			mockProjects.create.mockResolvedValue(mockProject);

			// Act
			const result = await projectsService.createProject(projectData);

			// Assert
			expect(result.name).toBe("New Project");
			expect(mockProjects.create).toHaveBeenCalledWith({
				name: "New Project",
				description: undefined,
				base_lang_iso: "en",
				languages: undefined,
			});
		});

		it("should create project with full data", async () => {
			// Arrange
			const projectData: CreateProjectParams = {
				name: "Full Project",
				description: "Complete project with all fields",
				base_lang_iso: "de",
				languages: [{ lang_iso: "de" }, { lang_iso: "en" }, { lang_iso: "fr" }],
			};
			const mockBuilder = new ProjectsMockBuilder();
			const mockProject = mockBuilder.withProject({
				project_id: generators.id.project(2),
				name: "Full Project",
				description: "Complete project with all fields",
				base_language_iso: "de",
			}).projects[0];

			mockProjects.create.mockResolvedValue(mockProject);

			// Act
			const result = await projectsService.createProject(projectData);

			// Assert
			expect(result.name).toBe("Full Project");
			expect(result.description).toBe("Complete project with all fields");
			expect(mockProjects.create).toHaveBeenCalledWith({
				name: "Full Project",
				description: "Complete project with all fields",
				base_lang_iso: "de",
				languages: projectData.languages,
			});
		});

		it("should handle validation errors", async () => {
			// Arrange
			const projectData: CreateProjectParams = {
				name: "", // Empty name should fail
			};
			const error = createValidationError([
				{ field: "name", message: "Project name is required" },
			]);
			mockProjects.create.mockRejectedValue(error);

			// Act & Assert
			await expect(projectsService.createProject(projectData)).rejects.toThrow(
				McpError,
			);
		});

		it("should handle duplicate project names", async () => {
			// Arrange
			const projectData: CreateProjectParams = {
				name: "Existing Project",
			};
			const error = createValidationError([
				{ field: "name", message: "Project with this name already exists" },
			]);
			mockProjects.create.mockRejectedValue(error);

			// Act & Assert
			await expect(projectsService.createProject(projectData)).rejects.toThrow(
				"Unexpected service error while creating Lokalise project",
			);
		});
	});

	describe("updateProject", () => {
		it("should update project name", async () => {
			// Arrange
			const updateData: UpdateProjectParams = {
				name: "Updated Name",
			};
			const mockBuilder = new ProjectsMockBuilder();
			const mockProject = mockBuilder.withProject({
				project_id: "test-123",
				name: "Updated Name",
			}).projects[0];

			mockProjects.update.mockResolvedValue(mockProject);

			// Act
			const result = await projectsService.updateProject(
				"test-123",
				updateData,
			);

			// Assert
			expect(result.name).toBe("Updated Name");
			expect(mockProjects.update).toHaveBeenCalledWith("test-123", updateData);
		});

		it("should update project description", async () => {
			// Arrange
			const updateData: UpdateProjectParams = {
				description: "New description for the project",
				name: "Updated Name",
			};
			const mockBuilder = new ProjectsMockBuilder();
			const mockProject = mockBuilder.withProject({
				project_id: "test-123",
				description: "New description for the project",
				name: "Updated Name",
			}).projects[0];

			mockProjects.update.mockResolvedValue(mockProject);

			// Act
			const result = await projectsService.updateProject(
				"test-123",
				updateData,
			);

			// Assert
			expect(result.description).toBe("New description for the project");
		});

		it("should handle partial updates", async () => {
			// Arrange
			const updateData: UpdateProjectParams = {
				name: "Partially Updated",
				// Only updating name, not description
			};
			const mockBuilder = new ProjectsMockBuilder();
			const mockProject = mockBuilder.withProject({
				project_id: "test-123",
				name: "Partially Updated",
				description: "Original description remains",
			}).projects[0];

			mockProjects.update.mockResolvedValue(mockProject);

			// Act
			const result = await projectsService.updateProject(
				"test-123",
				updateData,
			);

			// Assert
			expect(result.name).toBe("Partially Updated");
			expect(result.description).toBe("Original description remains");
		});

		it("should handle update of non-existent project", async () => {
			// Arrange
			const updateData: UpdateProjectParams = { name: "New Name" };
			const error = createNotFoundError("Project");
			mockProjects.update.mockRejectedValue(error);

			// Act & Assert
			await expect(
				projectsService.updateProject("non-existent", updateData),
			).rejects.toThrow(
				"Unexpected service error while updating Lokalise project",
			);
		});

		it("should handle invalid update data", async () => {
			// Arrange
			const updateData: UpdateProjectParams = {
				name: "x".repeat(256), // Name too long
			};
			const error = createValidationError([
				{ field: "name", message: "Project name too long" },
			]);
			mockProjects.update.mockRejectedValue(error);

			// Act & Assert
			await expect(
				projectsService.updateProject("test-123", updateData),
			).rejects.toThrow(McpError);
		});
	});

	describe("deleteProject", () => {
		it("should delete project successfully", async () => {
			// Arrange
			const mockResult: ProjectDeleted = {
				project_deleted: true,
				project_id: "test-123",
			};
			mockProjects.delete.mockResolvedValue(mockResult);

			// Act
			const result = await projectsService.deleteProject("test-123");

			// Assert
			expect(result).toEqual(mockResult);
			expect((result as ProjectDeleted).project_deleted).toBe(true);
			expect(mockProjects.delete).toHaveBeenCalledWith("test-123");
		});

		it("should handle deletion of non-existent project", async () => {
			// Arrange
			const error = createNotFoundError("Project");
			mockProjects.delete.mockRejectedValue(error);

			// Act & Assert
			await expect(
				projectsService.deleteProject("non-existent"),
			).rejects.toThrow(
				"Unexpected service error while deleting Lokalise project",
			);
		});

		it("should handle permission errors during deletion", async () => {
			// Arrange
			const error = new Error("Insufficient permissions to delete project");
			mockProjects.delete.mockRejectedValue(error);

			// Act & Assert
			await expect(projectsService.deleteProject("test-123")).rejects.toThrow(
				"Unexpected service error while deleting Lokalise project",
			);
		});

		it("should handle deletion failure", async () => {
			// Arrange
			const mockResult: ProjectDeleted = {
				project_deleted: false,
				project_id: "test-123",
			};
			mockProjects.delete.mockResolvedValue(mockResult);

			// Act
			const result = await projectsService.deleteProject("test-123");

			// Assert
			expect((result as ProjectDeleted).project_deleted).toBe(false);
		});
	});

	describe("emptyProject", () => {
		it("should empty project successfully", async () => {
			// Arrange
			const mockResult: ProjectEmptied = {
				project_id: "test-123",
				keys_deleted: true,
			};
			mockProjects.empty.mockResolvedValue(mockResult);

			// Act
			const result = await projectsService.emptyProject("test-123");

			// Assert
			expect(result).toEqual(mockResult);
			expect((result as ProjectEmptied).keys_deleted).toBe(true);
			expect(mockProjects.empty).toHaveBeenCalledWith("test-123");
		});

		it("should handle emptying already empty project", async () => {
			// Arrange
			const mockResult: ProjectEmptied = {
				project_id: "test-123",
				keys_deleted: true,
			};
			mockProjects.empty.mockResolvedValue(mockResult);

			// Act
			const result = await projectsService.emptyProject("test-123");

			// Assert
			expect(result.keys_deleted).toBe(true);
		});

		it("should handle large number of keys deletion", async () => {
			// Arrange
			const mockResult: ProjectEmptied = {
				project_id: "test-123",
				keys_deleted: true,
			};
			mockProjects.empty.mockResolvedValue(mockResult);

			// Act
			const result = await projectsService.emptyProject("test-123");

			// Assert
			expect(result.keys_deleted).toBe(true);
		});

		it("should handle empty project failure", async () => {
			// Arrange
			const error = createNotFoundError("Project");
			mockProjects.empty.mockRejectedValue(error);

			// Act & Assert
			await expect(
				projectsService.emptyProject("non-existent"),
			).rejects.toThrow(
				"Unexpected service error while emptying Lokalise project",
			);
		});

		it("should handle permission errors during empty", async () => {
			// Arrange
			const error = new Error("Insufficient permissions to empty project");
			mockProjects.empty.mockRejectedValue(error);

			// Act & Assert
			await expect(projectsService.emptyProject("test-123")).rejects.toThrow(
				"Unexpected service error while emptying Lokalise project",
			);
		});
	});

	describe("Error Handling", () => {
		it("should rethrow McpError instances", async () => {
			// Arrange
			const mcpError = new McpError(
				"Custom error message",
				ErrorType.UNEXPECTED_ERROR,
			);
			mockProjects.list.mockRejectedValue(mcpError);

			// Act & Assert
			await expect(projectsService.getProjects()).rejects.toThrow(mcpError);
		});

		it("should wrap unexpected errors", async () => {
			// Arrange
			const unexpectedError = new Error("Network timeout");
			mockProjects.list.mockRejectedValue(unexpectedError);

			// Act & Assert
			await expect(projectsService.getProjects()).rejects.toThrow(McpError);
			await expect(projectsService.getProjects()).rejects.toThrow(
				"Unexpected service error",
			);
		});

		it("should handle null response gracefully", async () => {
			// Arrange
			mockProjects.list.mockResolvedValue(
				null as unknown as ReturnType<typeof mockProjects.list>,
			);

			// Act & Assert
			await expect(projectsService.getProjects()).rejects.toThrow();
		});
	});

	describe("Performance", () => {
		it("should handle large project lists efficiently", async () => {
			// Arrange
			const mockBuilder = new ProjectsMockBuilder();
			for (let i = 0; i < 1000; i++) {
				mockBuilder.withProject({
					project_id: generators.id.project(i),
					name: generators.projectName(i % 10),
				});
			}
			const mockResponse = mockBuilder.withPagination(1, 1000).build();
			mockProjects.list.mockResolvedValue(mockResponse);

			// Act
			const startTime = Date.now();
			const result = await projectsService.getProjects({ limit: 1000 });
			const duration = Date.now() - startTime;

			// Assert
			expect(result).toHaveLength(1000);
			expect(duration).toBeLessThan(1000); // Should complete within 1 second
		});

		it("should handle concurrent requests", async () => {
			// Arrange
			const mockBuilder = new ProjectsMockBuilder();
			const mockResponse = mockBuilder
				.withProject({ name: "Concurrent Project" })
				.build();
			mockProjects.list.mockResolvedValue(mockResponse);

			// Act
			const promises = Array(10)
				.fill(null)
				.map(() => projectsService.getProjects());
			const results = await Promise.all(promises);

			// Assert
			expect(results).toHaveLength(10);
			results.forEach((result) => {
				expect(result).toHaveLength(1);
			});
			expect(mockProjects.list).toHaveBeenCalledTimes(10);
		});
	});
});
