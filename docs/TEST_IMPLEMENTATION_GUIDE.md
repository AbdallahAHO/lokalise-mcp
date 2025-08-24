# Test Implementation Guide

## Overview

This guide provides detailed instructions for implementing tests across all layers of the lokalise-mcp project. Each domain follows a consistent structure with five test files covering different aspects of functionality.

## Test File Structure

### Domain Test Organization

Each domain should have the following test structure:

```
src/domains/[domain]/
├── [domain].service.test.ts      # API interaction tests
├── [domain].controller.test.ts   # Business logic tests
├── [domain].tool.test.ts         # MCP tool tests
├── [domain].resource.test.ts     # MCP resource tests
├── [domain].cli.test.ts          # CLI command tests
└── __fixtures__/
    └── [domain].fixtures.ts      # Test data and mocks
```

## Layer-by-Layer Implementation

### 1. Service Layer Tests

**Purpose**: Test direct API interactions with mocked Lokalise SDK
**Coverage Target**: 95%
**Focus**: API calls, error handling, data transformation

#### Template Structure

```typescript
// src/domains/projects/projects.service.test.ts
import { describe, it, expect, beforeEach, afterEach, jest } from "@jest/globals";
import { ProjectsService } from "./projects.service";
import { McpError } from "../../shared/utils/error.util";
import { createMockLokaliseApi } from "../../test-utils/mock-factory";
import {
  createProjectsListFixture,
  createProjectFixture,
  createErrorResponse
} from "./__fixtures__/projects.fixtures";

describe("ProjectsService", () => {
  let service: ProjectsService;
  let mockApi: ReturnType<typeof createMockLokaliseApi>;

  beforeEach(() => {
    // Clear any module cache
    jest.clearAllMocks();

    // Create mock API
    mockApi = createMockLokaliseApi();

    // Create service instance
    service = new ProjectsService();

    // Inject mock API
    (service as unknown).getLokaliseApi = () => mockApi;
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe("listProjects", () => {
    it("should fetch projects with default parameters", async () => {
      // Arrange
      const mockResponse = createProjectsListFixture();
      mockApi.projects().list.mockResolvedValue(mockResponse);

      // Act
      const result = await service.listProjects({});

      // Assert
      expect(result).toEqual(mockResponse);
      expect(mockApi.projects().list).toHaveBeenCalledWith({
        page: 1,
        limit: 100
      });
    });

    it("should handle pagination parameters", async () => {
      // Arrange
      const mockResponse = createProjectsListFixture({ page: 2, limit: 50 });
      mockApi.projects().list.mockResolvedValue(mockResponse);

      // Act
      const result = await service.listProjects({ page: 2, limit: 50 });

      // Assert
      expect(result.currentPage).toBe(2);
      expect(result.resultsPerPage).toBe(50);
      expect(mockApi.projects().list).toHaveBeenCalledWith({
        page: 2,
        limit: 50
      });
    });

    it("should handle API errors", async () => {
      // Arrange
      const error = createErrorResponse(404, "Projects not found");
      mockApi.projects().list.mockRejectedValue(error);

      // Act & Assert
      await expect(service.listProjects({}))
        .rejects
        .toThrow(McpError);
    });

    it("should handle rate limiting", async () => {
      // Arrange
      const rateLimitError = createErrorResponse(429, "Rate limit exceeded");
      mockApi.projects().list.mockRejectedValue(rateLimitError);

      // Act & Assert
      await expect(service.listProjects({}))
        .rejects
        .toThrow("Rate limit exceeded");
    });
  });

  describe("getProject", () => {
    it("should fetch a single project by ID", async () => {
      // Arrange
      const projectId = "test_project_123";
      const mockProject = createProjectFixture({ project_id: projectId });
      mockApi.projects().get.mockResolvedValue(mockProject);

      // Act
      const result = await service.getProject(projectId);

      // Assert
      expect(result).toEqual(mockProject);
      expect(mockApi.projects().get).toHaveBeenCalledWith(projectId);
    });

    it("should handle non-existent project", async () => {
      // Arrange
      const error = createErrorResponse(404, "Project not found");
      mockApi.projects().get.mockRejectedValue(error);

      // Act & Assert
      await expect(service.getProject("invalid_id"))
        .rejects
        .toThrow("Project not found");
    });
  });

  describe("createProject", () => {
    it("should create a new project", async () => {
      // Arrange
      const newProject = {
        name: "New Project",
        description: "Test project"
      };
      const mockResponse = createProjectFixture(newProject);
      mockApi.projects().create.mockResolvedValue(mockResponse);

      // Act
      const result = await service.createProject(newProject);

      // Assert
      expect(result.name).toBe("New Project");
      expect(mockApi.projects().create).toHaveBeenCalledWith(newProject);
    });

    it("should handle validation errors", async () => {
      // Arrange
      const error = createErrorResponse(400, "Invalid project name");
      mockApi.projects().create.mockRejectedValue(error);

      // Act & Assert
      await expect(service.createProject({ name: "" }))
        .rejects
        .toThrow("Invalid project name");
    });
  });

  describe("updateProject", () => {
    it("should update project settings", async () => {
      // Arrange
      const projectId = "test_project_123";
      const updates = { name: "Updated Name" };
      const mockResponse = createProjectFixture({
        project_id: projectId,
        ...updates
      });
      mockApi.projects().update.mockResolvedValue(mockResponse);

      // Act
      const result = await service.updateProject(projectId, updates);

      // Assert
      expect(result.name).toBe("Updated Name");
      expect(mockApi.projects().update).toHaveBeenCalledWith(
        projectId,
        updates
      );
    });
  });

  describe("deleteProject", () => {
    it("should delete a project", async () => {
      // Arrange
      const projectId = "test_project_123";
      mockApi.projects().delete.mockResolvedValue({
        project_deleted: true
      });

      // Act
      const result = await service.deleteProject(projectId);

      // Assert
      expect(result.project_deleted).toBe(true);
      expect(mockApi.projects().delete).toHaveBeenCalledWith(projectId);
    });

    it("should handle deletion of non-existent project", async () => {
      // Arrange
      const error = createErrorResponse(404, "Project not found");
      mockApi.projects().delete.mockRejectedValue(error);

      // Act & Assert
      await expect(service.deleteProject("invalid_id"))
        .rejects
        .toThrow("Project not found");
    });
  });

  describe("emptyProject", () => {
    it("should empty all keys and translations", async () => {
      // Arrange
      const projectId = "test_project_123";
      mockApi.projects().empty.mockResolvedValue({
        keys_deleted: true
      });

      // Act
      const result = await service.emptyProject(projectId);

      // Assert
      expect(result.keys_deleted).toBe(true);
      expect(mockApi.projects().empty).toHaveBeenCalledWith(projectId);
    });
  });
});
```

### 2. Controller Layer Tests

**Purpose**: Test business logic, validation, and orchestration
**Coverage Target**: 90%
**Focus**: Input validation, error transformation, response formatting

#### Template Structure

```typescript
// src/domains/projects/projects.controller.test.ts
import { describe, it, expect, beforeEach, jest } from "@jest/globals";
import { projectsController } from "./projects.controller";
import * as projectsService from "./projects.service";
import { McpError } from "../../shared/utils/error.util";
import {
  createProjectsListFixture,
  createProjectFixture
} from "./__fixtures__/projects.fixtures";

// Mock the service module
jest.mock("./projects.service");

describe("ProjectsController", () => {
  const mockService = projectsService as jest.Mocked<typeof projectsService>;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("listProjects", () => {
    it("should validate input and call service", async () => {
      // Arrange
      const mockResponse = createProjectsListFixture();
      mockService.listProjects.mockResolvedValue(mockResponse);

      // Act
      const result = await projectsController.listProjects({
        page: 1,
        limit: 50,
        includeStats: true
      });

      // Assert
      expect(result.content).toContain("# Projects List");
      expect(result.data).toEqual(mockResponse);
      expect(mockService.listProjects).toHaveBeenCalledWith({
        page: 1,
        limit: 50,
        include_statistics: 1
      });
    });

    it("should apply default values", async () => {
      // Arrange
      mockService.listProjects.mockResolvedValue(
        createProjectsListFixture()
      );

      // Act
      await projectsController.listProjects({});

      // Assert
      expect(mockService.listProjects).toHaveBeenCalledWith({
        page: 1,
        limit: 100,
        include_statistics: 1
      });
    });

    it("should validate page number", async () => {
      // Act & Assert
      await expect(projectsController.listProjects({ page: -1 }))
        .rejects
        .toThrow("Page must be positive");
    });

    it("should validate limit range", async () => {
      // Act & Assert
      await expect(projectsController.listProjects({ limit: 1001 }))
        .rejects
        .toThrow("Limit must be between 1 and 1000");
    });

    it("should handle service errors gracefully", async () => {
      // Arrange
      mockService.listProjects.mockRejectedValue(
        new Error("API Error")
      );

      // Act & Assert
      await expect(projectsController.listProjects({}))
        .rejects
        .toThrow(McpError);
    });

    it("should format response correctly", async () => {
      // Arrange
      const projects = createProjectsListFixture({
        projects: [
          { project_id: "1", name: "Project A" },
          { project_id: "2", name: "Project B" }
        ]
      });
      mockService.listProjects.mockResolvedValue(projects);

      // Act
      const result = await projectsController.listProjects({});

      // Assert
      expect(result.content).toContain("Project A");
      expect(result.content).toContain("Project B");
      expect(result.content).toContain("Total: 2 projects");
      expect(result.metadata).toEqual({
        total: 2,
        page: 1,
        hasMore: false
      });
    });
  });

  describe("getProject", () => {
    it("should fetch and format single project", async () => {
      // Arrange
      const project = createProjectFixture({
        project_id: "test_123",
        name: "Test Project",
        description: "A test project"
      });
      mockService.getProject.mockResolvedValue(project);

      // Act
      const result = await projectsController.getProject("test_123");

      // Assert
      expect(result.content).toContain("# Test Project");
      expect(result.content).toContain("A test project");
      expect(result.data).toEqual(project);
    });

    it("should include languages if requested", async () => {
      // Arrange
      const project = createProjectFixture({
        languages: [
          { language_iso: "en", progress: 100 },
          { language_iso: "fr", progress: 75 }
        ]
      });
      mockService.getProject.mockResolvedValue(project);

      // Act
      const result = await projectsController.getProject("test_123", {
        includeLanguages: true
      });

      // Assert
      expect(result.content).toContain("## Languages");
      expect(result.content).toContain("English (en): 100%");
      expect(result.content).toContain("French (fr): 75%");
    });
  });

  describe("createProject", () => {
    it("should validate required fields", async () => {
      // Act & Assert
      await expect(projectsController.createProject({}))
        .rejects
        .toThrow("Name is required");
    });

    it("should create project with valid data", async () => {
      // Arrange
      const newProject = {
        name: "New Project",
        description: "Description",
        base_language_iso: "en"
      };
      const created = createProjectFixture(newProject);
      mockService.createProject.mockResolvedValue(created);

      // Act
      const result = await projectsController.createProject(newProject);

      // Assert
      expect(result.content).toContain("Successfully created");
      expect(result.content).toContain("New Project");
      expect(mockService.createProject).toHaveBeenCalledWith(newProject);
    });
  });

  describe("updateProject", () => {
    it("should update project with partial data", async () => {
      // Arrange
      const updates = { name: "Updated Name" };
      const updated = createProjectFixture(updates);
      mockService.updateProject.mockResolvedValue(updated);

      // Act
      const result = await projectsController.updateProject(
        "test_123",
        updates
      );

      // Assert
      expect(result.content).toContain("Successfully updated");
      expect(mockService.updateProject).toHaveBeenCalledWith(
        "test_123",
        updates
      );
    });
  });

  describe("deleteProject", () => {
    it("should require confirmation", async () => {
      // Act & Assert
      await expect(
        projectsController.deleteProject("test_123", { confirm: false })
      ).rejects.toThrow("Confirmation required");
    });

    it("should delete with confirmation", async () => {
      // Arrange
      mockService.deleteProject.mockResolvedValue({
        project_deleted: true
      });

      // Act
      const result = await projectsController.deleteProject("test_123", {
        confirm: true
      });

      // Assert
      expect(result.content).toContain("Successfully deleted");
      expect(mockService.deleteProject).toHaveBeenCalledWith("test_123");
    });
  });
});
```

### 3. Tool Layer Tests

**Purpose**: Test MCP tool integration
**Coverage Target**: 85%
**Focus**: Schema validation, tool execution, error handling

#### Template Structure

```typescript
// src/domains/projects/projects.tool.test.ts
import { describe, it, expect, beforeEach, jest } from "@jest/globals";
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { projectsTool } from "./projects.tool";
import { projectsController } from "./projects.controller";
import { z } from "zod";

jest.mock("./projects.controller");

describe("ProjectsTool", () => {
  let server: Server;
  const mockController = projectsController as jest.Mocked<
    typeof projectsController
  >;

  beforeEach(() => {
    server = new Server({
      name: "test-server",
      version: "1.0.0"
    });
    projectsTool.registerTools(server);
    jest.clearAllMocks();
  });

  describe("lokalise_list_projects", () => {
    it("should register tool with correct schema", () => {
      // Assert tool is registered
      const tools = server.getTools();
      const listTool = tools.find(t => t.name === "lokalise_list_projects");

      expect(listTool).toBeDefined();
      expect(listTool?.description).toContain("List all projects");
      expect(listTool?.inputSchema).toBeDefined();
    });

    it("should validate input parameters", async () => {
      // Arrange
      const invalidInput = {
        page: -1,
        limit: 5000
      };

      // Act & Assert
      await expect(
        server.callTool("lokalise_list_projects", invalidInput)
      ).rejects.toThrow("Validation error");
    });

    it("should execute with valid parameters", async () => {
      // Arrange
      mockController.listProjects.mockResolvedValue({
        content: "# Projects\n- Project 1",
        data: { items: [] }
      });

      // Act
      const result = await server.callTool("lokalise_list_projects", {
        page: 1,
        limit: 100,
        includeStats: true
      });

      // Assert
      expect(result.content).toContain("Projects");
      expect(mockController.listProjects).toHaveBeenCalledWith({
        page: 1,
        limit: 100,
        includeStats: true
      });
    });

    it("should handle controller errors", async () => {
      // Arrange
      mockController.listProjects.mockRejectedValue(
        new Error("Controller error")
      );

      // Act & Assert
      await expect(
        server.callTool("lokalise_list_projects", {})
      ).rejects.toThrow("Controller error");
    });
  });

  describe("lokalise_get_project", () => {
    it("should require project ID", async () => {
      // Act & Assert
      await expect(
        server.callTool("lokalise_get_project", {})
      ).rejects.toThrow("Project ID is required");
    });

    it("should fetch project details", async () => {
      // Arrange
      mockController.getProject.mockResolvedValue({
        content: "# Project Details",
        data: { project_id: "test_123" }
      });

      // Act
      const result = await server.callTool("lokalise_get_project", {
        projectId: "test_123"
      });

      // Assert
      expect(result.content).toContain("Project Details");
      expect(mockController.getProject).toHaveBeenCalledWith("test_123");
    });
  });

  describe("lokalise_create_project", () => {
    it("should validate required fields", async () => {
      // Act & Assert
      await expect(
        server.callTool("lokalise_create_project", {
          description: "No name provided"
        })
      ).rejects.toThrow("Name is required");
    });

    it("should create project", async () => {
      // Arrange
      const projectData = {
        name: "New Project",
        description: "Test",
        base_language_iso: "en"
      };

      mockController.createProject.mockResolvedValue({
        content: "Created successfully",
        data: { ...projectData, project_id: "new_123" }
      });

      // Act
      const result = await server.callTool(
        "lokalise_create_project",
        projectData
      );

      // Assert
      expect(result.content).toContain("Created successfully");
      expect(mockController.createProject).toHaveBeenCalledWith(projectData);
    });
  });

  describe("Tool Discovery", () => {
    it("should auto-register all domain tools", () => {
      const tools = server.getTools();
      const projectTools = tools.filter(t =>
        t.name.startsWith("lokalise_") &&
        t.name.includes("project")
      );

      expect(projectTools).toHaveLength(6);
      expect(projectTools.map(t => t.name)).toContain(
        "lokalise_list_projects",
        "lokalise_get_project",
        "lokalise_create_project",
        "lokalise_update_project",
        "lokalise_delete_project",
        "lokalise_empty_project"
      );
    });
  });
});
```

### 4. Resource Layer Tests

**Purpose**: Test MCP resource handling
**Coverage Target**: 85%
**Focus**: URI parsing, query parameters, resource generation

#### Template Structure

```typescript
// src/domains/projects/projects.resource.test.ts
import { describe, it, expect, beforeEach, jest } from "@jest/globals";
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { projectsResource } from "./projects.resource";
import { projectsController } from "./projects.controller";

jest.mock("./projects.controller");

describe("ProjectsResource", () => {
  let server: Server;
  const mockController = projectsController as jest.Mocked<
    typeof projectsController
  >;

  beforeEach(() => {
    server = new Server({
      name: "test-server",
      version: "1.0.0"
    });
    projectsResource.registerResources(server);
    jest.clearAllMocks();
  });

  describe("lokalise-projects", () => {
    it("should handle resource URI", async () => {
      // Arrange
      mockController.listProjects.mockResolvedValue({
        content: "Projects list",
        data: { items: [] }
      });

      // Act
      const result = await server.getResource(
        "lokalise://projects?page=1&limit=10"
      );

      // Assert
      expect(result.content).toBe("Projects list");
      expect(mockController.listProjects).toHaveBeenCalledWith({
        page: 1,
        limit: 10
      });
    });

    it("should parse query parameters", async () => {
      // Arrange
      const uri = "lokalise://projects?page=2&limit=50&includeStats=true";
      mockController.listProjects.mockResolvedValue({
        content: "Filtered projects",
        data: { items: [] }
      });

      // Act
      await server.getResource(uri);

      // Assert
      expect(mockController.listProjects).toHaveBeenCalledWith({
        page: 2,
        limit: 50,
        includeStats: true
      });
    });

    it("should use defaults for missing parameters", async () => {
      // Arrange
      mockController.listProjects.mockResolvedValue({
        content: "Default projects",
        data: { items: [] }
      });

      // Act
      await server.getResource("lokalise://projects");

      // Assert
      expect(mockController.listProjects).toHaveBeenCalledWith({
        page: 1,
        limit: 100
      });
    });
  });

  describe("lokalise-project-details", () => {
    it("should extract project ID from URI", async () => {
      // Arrange
      mockController.getProject.mockResolvedValue({
        content: "Project details",
        data: { project_id: "test_123" }
      });

      // Act
      const result = await server.getResource(
        "lokalise://projects/test_123"
      );

      // Assert
      expect(result.content).toBe("Project details");
      expect(mockController.getProject).toHaveBeenCalledWith("test_123");
    });

    it("should handle optional parameters", async () => {
      // Arrange
      const uri = "lokalise://projects/test_123?includeLanguages=true";
      mockController.getProject.mockResolvedValue({
        content: "Detailed project",
        data: {}
      });

      // Act
      await server.getResource(uri);

      // Assert
      expect(mockController.getProject).toHaveBeenCalledWith("test_123", {
        includeLanguages: true
      });
    });

    it("should handle invalid URIs", async () => {
      // Act & Assert
      await expect(
        server.getResource("lokalise://invalid/uri")
      ).rejects.toThrow("Invalid resource URI");
    });
  });
});
```

### 5. CLI Layer Tests

**Purpose**: Test CLI command integration
**Coverage Target**: 80%
**Focus**: Command registration, argument parsing, output formatting

#### Template Structure

```typescript
// src/domains/projects/projects.cli.test.ts
import { describe, it, expect, beforeEach, jest } from "@jest/globals";
import { Command } from "commander";
import { projectsCli } from "./projects.cli";
import { projectsController } from "./projects.controller";

jest.mock("./projects.controller");

describe("ProjectsCLI", () => {
  let program: Command;
  const mockController = projectsController as jest.Mocked<
    typeof projectsController
  >;

  beforeEach(() => {
    program = new Command();
    program.exitOverride(); // Prevent process.exit in tests
    projectsCli.register(program);
    jest.clearAllMocks();

    // Mock console methods
    jest.spyOn(console, "log").mockImplementation();
    jest.spyOn(console, "error").mockImplementation();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe("list-projects command", () => {
    it("should register command with options", () => {
      const cmd = program.commands.find(c => c.name() === "list-projects");

      expect(cmd).toBeDefined();
      expect(cmd?.description()).toContain("List all projects");
      expect(cmd?.options).toHaveLength(3); // page, limit, stats
    });

    it("should execute with default options", async () => {
      // Arrange
      mockController.listProjects.mockResolvedValue({
        content: "Projects list",
        data: { items: [] }
      });

      // Act
      await program.parseAsync(["node", "test", "list-projects"]);

      // Assert
      expect(mockController.listProjects).toHaveBeenCalledWith({
        page: 1,
        limit: 100,
        includeStats: false
      });
      expect(console.log).toHaveBeenCalledWith("Projects list");
    });

    it("should parse command options", async () => {
      // Arrange
      mockController.listProjects.mockResolvedValue({
        content: "Filtered list",
        data: { items: [] }
      });

      // Act
      await program.parseAsync([
        "node",
        "test",
        "list-projects",
        "--page",
        "2",
        "--limit",
        "50",
        "--stats"
      ]);

      // Assert
      expect(mockController.listProjects).toHaveBeenCalledWith({
        page: 2,
        limit: 50,
        includeStats: true
      });
    });

    it("should handle errors gracefully", async () => {
      // Arrange
      mockController.listProjects.mockRejectedValue(
        new Error("API Error")
      );

      // Act & Assert
      await expect(
        program.parseAsync(["node", "test", "list-projects"])
      ).rejects.toThrow("API Error");

      expect(console.error).toHaveBeenCalledWith(
        expect.stringContaining("Error")
      );
    });
  });

  describe("get-project command", () => {
    it("should require project ID argument", async () => {
      // Act & Assert
      await expect(
        program.parseAsync(["node", "test", "get-project"])
      ).rejects.toThrow("Missing required argument");
    });

    it("should fetch project details", async () => {
      // Arrange
      mockController.getProject.mockResolvedValue({
        content: "Project details",
        data: {}
      });

      // Act
      await program.parseAsync([
        "node",
        "test",
        "get-project",
        "test_123"
      ]);

      // Assert
      expect(mockController.getProject).toHaveBeenCalledWith("test_123");
      expect(console.log).toHaveBeenCalledWith("Project details");
    });
  });

  describe("create-project command", () => {
    it("should prompt for required fields", async () => {
      // This would use inquirer or similar for interactive prompts
      // Mock the prompt responses
      const mockPrompt = jest.fn().mockResolvedValue({
        name: "New Project",
        description: "Test project"
      });

      (program as unknown).prompt = mockPrompt;

      mockController.createProject.mockResolvedValue({
        content: "Created",
        data: {}
      });

      // Act
      await program.parseAsync(["node", "test", "create-project"]);

      // Assert
      expect(mockPrompt).toHaveBeenCalled();
      expect(mockController.createProject).toHaveBeenCalledWith({
        name: "New Project",
        description: "Test project"
      });
    });

    it("should accept options directly", async () => {
      // Arrange
      mockController.createProject.mockResolvedValue({
        content: "Created",
        data: {}
      });

      // Act
      await program.parseAsync([
        "node",
        "test",
        "create-project",
        "--name",
        "CLI Project",
        "--description",
        "From CLI"
      ]);

      // Assert
      expect(mockController.createProject).toHaveBeenCalledWith({
        name: "CLI Project",
        description: "From CLI"
      });
    });
  });

  describe("delete-project command", () => {
    it("should require confirmation", async () => {
      // Mock confirmation prompt
      const mockConfirm = jest.fn().mockResolvedValue(false);
      (program as unknown).confirm = mockConfirm;

      // Act
      await program.parseAsync([
        "node",
        "test",
        "delete-project",
        "test_123"
      ]);

      // Assert
      expect(mockController.deleteProject).not.toHaveBeenCalled();
      expect(console.log).toHaveBeenCalledWith("Deletion cancelled");
    });

    it("should delete with confirmation", async () => {
      // Mock confirmation prompt
      const mockConfirm = jest.fn().mockResolvedValue(true);
      (program as unknown).confirm = mockConfirm;

      mockController.deleteProject.mockResolvedValue({
        content: "Deleted",
        data: {}
      });

      // Act
      await program.parseAsync([
        "node",
        "test",
        "delete-project",
        "test_123"
      ]);

      // Assert
      expect(mockController.deleteProject).toHaveBeenCalledWith(
        "test_123",
        { confirm: true }
      );
    });
  });
});
```

## Test Patterns and Best Practices

### 1. Mock Isolation

Always isolate mocks to prevent test interference:

```typescript
beforeEach(() => {
  jest.clearAllMocks();
  jest.resetModules();
});

afterEach(() => {
  jest.restoreAllMocks();
});
```

### 2. Test Data Builders

Use builders for complex test data:

```typescript
class ProjectBuilder {
  private project: Partial<Project> = {};

  withId(id: string): this {
    this.project.project_id = id;
    return this;
  }

  withName(name: string): this {
    this.project.name = name;
    return this;
  }

  build(): Project {
    return {
      project_id: this.project.project_id || "default_id",
      name: this.project.name || "Default Project",
      // ... other defaults
    } as Project;
  }
}
```

### 3. Async Testing

Always properly handle async operations:

```typescript
// Good
it("should handle async operations", async () => {
  const result = await asyncFunction();
  expect(result).toBeDefined();
});

// Bad - may cause flaky tests
it("should handle async operations", (done) => {
  asyncFunction().then(result => {
    expect(result).toBeDefined();
    done();
  });
});
```

### 4. Error Testing

Test both error cases and success paths:

```typescript
describe("error handling", () => {
  it.each([
    [400, "Bad Request"],
    [401, "Unauthorized"],
    [403, "Forbidden"],
    [404, "Not Found"],
    [429, "Rate Limited"],
    [500, "Server Error"],
  ])("should handle %i error: %s", async (code, message) => {
    mockApi.method.mockRejectedValue(
      createErrorResponse(code, message)
    );

    await expect(service.method()).rejects.toThrow(message);
  });
});
```

### 5. Coverage Verification

Use coverage comments to track untested code:

```typescript
/* istanbul ignore next - Defensive code, should not happen */
if (!apiKey) {
  throw new Error("API key missing");
}
```

## Performance Testing

### Load Testing Template

```typescript
describe("Performance", () => {
  it("should handle 1000 items efficiently", async () => {
    const largeDataset = Array.from({ length: 1000 }, (_, i) =>
      createProjectFixture({ project_id: `proj_${i}` })
    );

    mockApi.projects().list.mockResolvedValue({
      items: largeDataset,
      totalResults: 1000
    });

    const start = performance.now();
    const result = await service.listProjects({ limit: 1000 });
    const duration = performance.now() - start;

    expect(result.items).toHaveLength(1000);
    expect(duration).toBeLessThan(1000); // Should complete in < 1 second
  });
});
```

### Memory Testing

```typescript
describe("Memory Usage", () => {
  it("should not leak memory in bulk operations", async () => {
    const initialMemory = process.memoryUsage().heapUsed;

    // Perform bulk operation
    for (let i = 0; i < 100; i++) {
      await service.bulkCreate(generateLargeDataset());
    }

    // Force garbage collection (requires --expose-gc flag)
    if (global.gc) global.gc();

    const finalMemory = process.memoryUsage().heapUsed;
    const memoryIncrease = finalMemory - initialMemory;

    // Memory increase should be minimal
    expect(memoryIncrease).toBeLessThan(50 * 1024 * 1024); // < 50MB
  });
});
```

## Integration Testing

### End-to-End Test Template

```typescript
describe("E2E: Project Workflow", () => {
  it("should complete full project lifecycle", async () => {
    // 1. Create project
    const created = await controller.createProject({
      name: "E2E Test Project"
    });
    expect(created.data.project_id).toBeDefined();

    const projectId = created.data.project_id;

    // 2. Add languages
    await controller.addLanguages(projectId, ["en", "fr", "de"]);

    // 3. Add keys
    await controller.createKeys(projectId, [
      { key_name: "app.title", translations: { en: "App Title" } }
    ]);

    // 4. Verify project state
    const project = await controller.getProject(projectId);
    expect(project.data.statistics.keys_total).toBe(1);
    expect(project.data.statistics.languages.length).toBe(3);

    // 5. Clean up
    await controller.deleteProject(projectId, { confirm: true });
  });
});
```

## CI/CD Integration

### Jest Configuration for CI

```javascript
// jest.ci.config.js
module.exports = {
  ...baseConfig,
  coverageThreshold: {
    global: {
      branches: 90,
      functions: 90,
      lines: 90,
      statements: 90
    }
  },
  reporters: [
    "default",
    ["jest-junit", {
      outputDirectory: "test-results",
      outputName: "junit.xml"
    }]
  ],
  maxWorkers: 4,
  bail: true, // Stop on first test failure
};
```

---

**Document Version**: 1.0.0
**Last Updated**: 2025-08-24
**Related**: API_MOCKING_GUIDE.md, TEST_FIXTURES_SPECIFICATION.md, MOCK_IMPLEMENTATION_EXAMPLES.md