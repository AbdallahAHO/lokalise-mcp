# Mock Implementation Examples

## Overview

This document provides complete, working examples of mock implementations for each domain in the lokalise-mcp project. These examples follow the patterns established in the official Lokalise SDK tests.

## Complete Mock Setup

### 1. Jest Configuration

```javascript
// jest.config.js
module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  roots: ["<rootDir>/src"],
  testMatch: ["**/*.test.ts"],
  collectCoverageFrom: [
    "src/**/*.ts",
    "!src/**/*.test.ts",
    "!src/**/*.fixtures.ts",
    "!src/**/index.ts"
  ],
  coverageThreshold: {
    global: {
      branches: 90,
      functions: 90,
      lines: 90,
      statements: 90
    }
  },
  setupFilesAfterEnv: ["<rootDir>/src/test-utils/setup.ts"],
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1"
  },
  clearMocks: true,
  restoreMocks: true
};
```

### 2. Test Setup File

```typescript
// src/test-utils/setup.ts
import { jest } from "@jest/globals";

// Set test environment
process.env.NODE_ENV = "test";
process.env.LOKALISE_API_KEY = "test_api_key";

// Global test timeout
jest.setTimeout(10000);

// Mock console methods to reduce noise
global.console = {
  ...console,
  log: jest.fn(),
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn()
};

// Add custom matchers
expect.extend({
  toBeValidUUID(received: string) {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    const pass = uuidRegex.test(received);
    return {
      pass,
      message: () =>
        pass
          ? `Expected ${received} not to be a valid UUID`
          : `Expected ${received} to be a valid UUID`
    };
  }
});
```

## Projects Domain Mock Implementation

### Complete Projects Service Test

```typescript
// src/domains/projects/projects.service.test.ts
import { describe, it, expect, beforeEach, afterEach, jest } from "@jest/globals";
import { ProjectsService } from "./projects.service";
import { LokaliseApi } from "@lokalise/node-api";
import type { Project, PaginatedResult } from "@lokalise/node-api";
import { McpError } from "../../shared/utils/error.util";

// Mock the entire @lokalise/node-api module
jest.mock("@lokalise/node-api");

describe("ProjectsService", () => {
  let service: ProjectsService;
  let mockApi: jest.Mocked<LokaliseApi>;
  let mockProjects: jest.Mocked<any>;

  beforeEach(() => {
    // Create mock projects methods
    mockProjects = {
      list: jest.fn(),
      get: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      empty: jest.fn()
    };

    // Create mock API instance
    mockApi = {
      projects: jest.fn(() => mockProjects)
    } as unknown;

    // Mock the constructor
    (LokaliseApi as jest.MockedClass<typeof LokaliseApi>).mockImplementation(
      () => mockApi
    );

    // Create service instance
    service = new ProjectsService();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("listProjects", () => {
    it("should list projects with default pagination", async () => {
      // Arrange
      const mockResponse: PaginatedResult<Project> = {
        items: [
          {
            project_id: "proj_1",
            name: "Project 1",
            description: "First project",
            created_at: "2024-01-01 00:00:00 (Etc/UTC)",
            created_at_timestamp: 1704067200,
            created_by: 12345,
            created_by_email: "user@example.com",
            team_id: 100,
            base_language_id: 640,
            base_language_iso: "en",
            project_type: "localization_files",
            settings: {
              per_platform_key_names: false,
              reviewing: true,
              auto_toggle_unverified: true,
              offline_translation: true,
              key_editing: true,
              inline_machine_translations: true,
              branching: true,
              segmentation: false,
              contributor_preview_download_enabled: false,
              custom_translation_statuses: false,
              custom_translation_statuses_allow_multiple: false
            },
            statistics: {
              progress_total: 75,
              keys_total: 100,
              team: 5,
              base_words: 1000,
              qa_issues_total: 10,
              qa_issues: {
                not_reviewed: 5,
                unverified: 3,
                spelling_grammar: 2,
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
                unbalanced_brackets: 0
              },
              languages: []
            }
          }
        ],
        totalResults: 1,
        totalPages: 1,
        resultsPerPage: 100,
        currentPage: 1,
        hasNextPage: () => false,
        hasPrevPage: () => false,
        nextPage: () => 2,
        prevPage: () => 0
      };

      mockProjects.list.mockResolvedValue(mockResponse);

      // Act
      const result = await service.listProjects({});

      // Assert
      expect(result).toEqual(mockResponse);
      expect(mockProjects.list).toHaveBeenCalledWith({
        page: 1,
        limit: 100
      });
    });

    it("should handle custom pagination parameters", async () => {
      // Arrange
      const mockResponse: PaginatedResult<Project> = {
        items: [],
        totalResults: 50,
        totalPages: 5,
        resultsPerPage: 10,
        currentPage: 2,
        hasNextPage: () => true,
        hasPrevPage: () => true,
        nextPage: () => 3,
        prevPage: () => 1
      };

      mockProjects.list.mockResolvedValue(mockResponse);

      // Act
      const result = await service.listProjects({
        page: 2,
        limit: 10,
        include_statistics: 1
      });

      // Assert
      expect(result.currentPage).toBe(2);
      expect(result.resultsPerPage).toBe(10);
      expect(mockProjects.list).toHaveBeenCalledWith({
        page: 2,
        limit: 10,
        include_statistics: 1
      });
    });

    it("should handle API errors", async () => {
      // Arrange
      const apiError = new Error("API Error");
      (apiError as unknown).response = {
        status: 404,
        data: { error: { message: "Projects not found" } }
      };
      mockProjects.list.mockRejectedValue(apiError);

      // Act & Assert
      await expect(service.listProjects({}))
        .rejects
        .toThrow(McpError);

      try {
        await service.listProjects({});
      } catch (error) {
        expect((error as McpError).code).toBe("LOKALISE_API_ERROR");
        expect((error as McpError).message).toContain("Projects not found");
      }
    });

    it("should handle rate limiting", async () => {
      // Arrange
      const rateLimitError = new Error("Too Many Requests");
      (rateLimitError as unknown).response = {
        status: 429,
        data: { error: { message: "Rate limit exceeded" } },
        headers: {
          "x-rate-limit-limit": "6000",
          "x-rate-limit-remaining": "0",
          "x-rate-limit-reset": String(Date.now() + 3600000)
        }
      };
      mockProjects.list.mockRejectedValue(rateLimitError);

      // Act & Assert
      await expect(service.listProjects({}))
        .rejects
        .toThrow("Rate limit exceeded");
    });
  });

  describe("createProject", () => {
    it("should create a new project", async () => {
      // Arrange
      const newProject = {
        name: "New Project",
        description: "A new test project",
        base_language_iso: "en"
      };

      const createdProject: Project = {
        project_id: "new_proj_123",
        ...newProject,
        created_at: "2024-01-15 10:00:00 (Etc/UTC)",
        created_at_timestamp: 1705314000,
        created_by: 12345,
        created_by_email: "creator@example.com",
        team_id: 100,
        base_language_id: 640,
        project_type: "localization_files",
        settings: {} as unknown,
        statistics: {} as unknown
      };

      mockProjects.create.mockResolvedValue(createdProject);

      // Act
      const result = await service.createProject(newProject);

      // Assert
      expect(result).toEqual(createdProject);
      expect(result.project_id).toBe("new_proj_123");
      expect(mockProjects.create).toHaveBeenCalledWith(newProject);
    });

    it("should handle validation errors", async () => {
      // Arrange
      const invalidProject = { name: "" }; // Missing required fields
      const validationError = new Error("Validation Error");
      (validationError as unknown).response = {
        status: 400,
        data: {
          error: {
            message: "Validation failed",
            errors: [
              { field: "name", message: "Name cannot be empty" },
              { field: "base_language_iso", message: "Base language is required" }
            ]
          }
        }
      };
      mockProjects.create.mockRejectedValue(validationError);

      // Act & Assert
      await expect(service.createProject(invalidProject))
        .rejects
        .toThrow(McpError);
    });
  });

  describe("bulk operations", () => {
    it("should handle bulk project operations", async () => {
      // Arrange
      const projectIds = ["proj_1", "proj_2", "proj_3"];
      const deletePromises = projectIds.map(id =>
        Promise.resolve({ project_deleted: true })
      );

      mockProjects.delete
        .mockResolvedValueOnce(deletePromises[0])
        .mockResolvedValueOnce(deletePromises[1])
        .mockResolvedValueOnce(deletePromises[2]);

      // Act
      const results = await Promise.all(
        projectIds.map(id => service.deleteProject(id))
      );

      // Assert
      expect(results).toHaveLength(3);
      expect(results.every(r => r.project_deleted)).toBe(true);
      expect(mockProjects.delete).toHaveBeenCalledTimes(3);
    });
  });
});
```

## Keys Domain Mock Implementation with Cursor Pagination

```typescript
// src/domains/keys/keys.service.test.ts
import { describe, it, expect, beforeEach, jest } from "@jest/globals";
import { KeysService } from "./keys.service";
import { LokaliseApi } from "@lokalise/node-api";
import type { Key, PaginatedResult } from "@lokalise/node-api";

jest.mock("@lokalise/node-api");

describe("KeysService", () => {
  let service: KeysService;
  let mockApi: jest.Mocked<LokaliseApi>;
  let mockKeys: jest.Mocked<any>;

  beforeEach(() => {
    mockKeys = {
      list: jest.fn(),
      get: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      bulk_update: jest.fn(),
      delete: jest.fn(),
      bulk_delete: jest.fn()
    };

    mockApi = {
      keys: jest.fn(() => mockKeys)
    } as unknown;

    (LokaliseApi as jest.MockedClass<typeof LokaliseApi>).mockImplementation(
      () => mockApi
    );

    service = new KeysService();
  });

  describe("listKeys with cursor pagination", () => {
    it("should handle cursor pagination", async () => {
      // Arrange
      const mockResponse: PaginatedResult<Key> & {
        nextCursor: string | null;
        hasNextCursor: () => boolean;
        responseTooBig: boolean;
      } = {
        items: [
          {
            key_id: 15519786,
            created_at: "2024-01-20 14:22:33 (Etc/UTC)",
            created_at_timestamp: 1705761753,
            key_name: {
              ios: "app_title",
              android: "app_title",
              web: "APP_TITLE",
              other: "app.title"
            },
            filenames: {
              ios: "Localizable.strings",
              android: "strings.xml",
              web: "en.json",
              other: "app.yml"
            },
            description: "Application title",
            platforms: ["ios", "android", "web"],
            tags: ["ui", "important"],
            comments: [],
            screenshots: [],
            translations: [],
            is_plural: false,
            plural_name: "",
            is_hidden: false,
            is_archived: false,
            context: "",
            base_words: 2,
            char_limit: 50,
            custom_attributes: {},
            modified_at: "2024-01-20 14:22:33 (Etc/UTC)",
            modified_at_timestamp: 1705761753
          }
        ],
        totalResults: 0, // Not provided in cursor pagination
        totalPages: 0,
        resultsPerPage: 100,
        currentPage: 0,
        nextCursor: "eyIxIjo0NDU5NjA2MX0=",
        hasNextCursor: () => true,
        responseTooBig: false,
        hasNextPage: () => false,
        hasPrevPage: () => false,
        nextPage: () => 0,
        prevPage: () => 0
      };

      mockKeys.list.mockResolvedValue(mockResponse);

      // Act
      const result = await service.listKeys({
        project_id: "test_project",
        pagination: "cursor",
        limit: 100
      });

      // Assert
      expect(result.nextCursor).toBe("eyIxIjo0NDU5NjA2MX0=");
      expect(result.hasNextCursor()).toBe(true);
      expect(result.responseTooBig).toBe(false);
      expect(mockKeys.list).toHaveBeenCalledWith({
        project_id: "test_project",
        pagination: "cursor",
        limit: 100
      });
    });

    it("should handle next cursor pagination", async () => {
      // Arrange - First page
      const firstPageResponse = {
        items: Array(100).fill(null).map((_, i) => ({
          key_id: i + 1,
          key_name: { web: `key_${i + 1}` }
        })),
        nextCursor: "eyIxIjo0NDU5NjA2MX0=",
        hasNextCursor: () => true,
        responseTooBig: false
      };

      // Arrange - Second page
      const secondPageResponse = {
        items: Array(50).fill(null).map((_, i) => ({
          key_id: i + 101,
          key_name: { web: `key_${i + 101}` }
        })),
        nextCursor: null,
        hasNextCursor: () => false,
        responseTooBig: false
      };

      mockKeys.list
        .mockResolvedValueOnce(firstPageResponse as unknown)
        .mockResolvedValueOnce(secondPageResponse as unknown);

      // Act - First request
      const firstResult = await service.listKeys({
        project_id: "test_project",
        pagination: "cursor",
        limit: 100
      });

      // Act - Second request with cursor
      const secondResult = await service.listKeys({
        project_id: "test_project",
        pagination: "cursor",
        limit: 100,
        cursor: firstResult.nextCursor
      });

      // Assert
      expect(firstResult.items).toHaveLength(100);
      expect(firstResult.hasNextCursor()).toBe(true);
      expect(secondResult.items).toHaveLength(50);
      expect(secondResult.hasNextCursor()).toBe(false);
    });

    it("should handle response too big header", async () => {
      // Arrange
      const mockResponse = {
        items: [],
        nextCursor: "eyIxIjo0NDU5NjA2MX0=",
        hasNextCursor: () => true,
        responseTooBig: true // Response was truncated
      };

      mockKeys.list.mockResolvedValue(mockResponse as unknown);

      // Act
      const result = await service.listKeys({
        project_id: "test_project",
        pagination: "cursor"
      });

      // Assert
      expect(result.responseTooBig).toBe(true);
      // Should handle by reducing limit or filtering
    });
  });

  describe("bulk operations", () => {
    it("should handle bulk key creation with partial failures", async () => {
      // Arrange
      const keysToCreate = [
        {
          key_name: { web: "new.key.1" },
          translations: { en: "Translation 1" }
        },
        {
          key_name: { web: "new.key.2" },
          translations: { en: "Translation 2" }
        },
        {
          key_name: { web: "duplicate.key" },
          translations: { en: "Duplicate" }
        }
      ];

      const mockResponse = {
        items: [
          { key_id: 1001, key_name: { web: "new.key.1" } },
          { key_id: 1002, key_name: { web: "new.key.2" } }
        ],
        errors: [
          {
            key_name: { web: "duplicate.key" },
            error: { message: "Key already exists" }
          }
        ]
      };

      mockKeys.create.mockResolvedValue(mockResponse as unknown);

      // Act
      const result = await service.createKeys(
        "test_project",
        keysToCreate
      );

      // Assert
      expect(result.items).toHaveLength(2);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0].error.message).toBe("Key already exists");
    });

    it("should handle bulk key deletion", async () => {
      // Arrange
      const keyIds = [1001, 1002, 1003, 1004, 1005];
      const mockResponse = {
        keys_removed: true,
        keys_locked: 0
      };

      mockKeys.bulk_delete.mockResolvedValue(mockResponse);

      // Act
      const result = await service.bulkDeleteKeys(
        "test_project",
        keyIds
      );

      // Assert
      expect(result.keys_removed).toBe(true);
      expect(mockKeys.bulk_delete).toHaveBeenCalledWith(
        keyIds,
        { project_id: "test_project" }
      );
    });

    it("should handle bulk update with validation", async () => {
      // Arrange
      const updates = [
        { key_id: 1001, description: "Updated description 1" },
        { key_id: 1002, description: "Updated description 2" }
      ];

      const mockResponse = {
        items: updates.map(u => ({
          ...u,
          key_name: { web: `key_${u.key_id}` }
        })),
        errors: []
      };

      mockKeys.bulk_update.mockResolvedValue(mockResponse as unknown);

      // Act
      const result = await service.bulkUpdateKeys(
        "test_project",
        updates
      );

      // Assert
      expect(result.items).toHaveLength(2);
      expect(result.errors).toHaveLength(0);
    });
  });
});
```

## Error Handling Mock Examples

```typescript
// src/test-utils/error-mocks.test.ts
import { describe, it, expect, jest } from "@jest/globals";
import { LokaliseApi } from "@lokalise/node-api";
import { McpError } from "../shared/utils/error.util";

jest.mock("@lokalise/node-api");

describe("Error Handling Examples", () => {
  let mockApi: jest.Mocked<LokaliseApi>;

  beforeEach(() => {
    mockApi = new LokaliseApi({ apiKey: "test" }) as jest.Mocked<LokaliseApi>;
  });

  it("should handle 401 Unauthorized", async () => {
    // Arrange
    const error = new Error("Unauthorized");
    (error as unknown).response = {
      status: 401,
      data: { error: { message: "Invalid API token", code: 401 } }
    };

    const mockProjects = {
      list: jest.fn().mockRejectedValue(error)
    };
    mockApi.projects = jest.fn(() => mockProjects) as unknown;

    // Act & Assert
    await expect(mockApi.projects().list())
      .rejects
      .toThrow("Unauthorized");

    try {
      await mockApi.projects().list();
    } catch (err) {
      const mcpError = McpError.fromError(err);
      expect(mcpError.code).toBe("AUTHENTICATION_ERROR");
      expect(mcpError.details.status).toBe(401);
    }
  });

  it("should handle 403 Forbidden", async () => {
    // Arrange
    const error = new Error("Forbidden");
    (error as unknown).response = {
      status: 403,
      data: {
        error: {
          message: "You don't have permission to perform this action",
          code: 403
        }
      }
    };

    const mockProjects = {
      delete: jest.fn().mockRejectedValue(error)
    };
    mockApi.projects = jest.fn(() => mockProjects) as unknown;

    // Act & Assert
    await expect(mockApi.projects().delete("protected_project"))
      .rejects
      .toThrow("Forbidden");
  });

  it("should handle 404 Not Found", async () => {
    // Arrange
    const error = new Error("Not Found");
    (error as unknown).response = {
      status: 404,
      data: { error: { message: "Project not found", code: 404 } }
    };

    const mockProjects = {
      get: jest.fn().mockRejectedValue(error)
    };
    mockApi.projects = jest.fn(() => mockProjects) as unknown;

    // Act & Assert
    await expect(mockApi.projects().get("non_existent"))
      .rejects
      .toThrow("Not Found");
  });

  it("should handle 429 Rate Limiting with retry", async () => {
    // Arrange
    const rateLimitError = new Error("Too Many Requests");
    (rateLimitError as unknown).response = {
      status: 429,
      data: { error: { message: "Rate limit exceeded", code: 429 } },
      headers: {
        "x-rate-limit-limit": "6000",
        "x-rate-limit-remaining": "0",
        "x-rate-limit-reset": String(Date.now() / 1000 + 60) // Reset in 60 seconds
      }
    };

    const mockProjects = {
      list: jest.fn()
        .mockRejectedValueOnce(rateLimitError) // First call fails
        .mockResolvedValueOnce({ items: [] })  // Retry succeeds
    };
    mockApi.projects = jest.fn(() => mockProjects) as unknown;

    // Act - First attempt fails
    await expect(mockApi.projects().list())
      .rejects
      .toThrow("Too Many Requests");

    // Act - Retry after delay succeeds
    const result = await mockApi.projects().list();
    expect(result.items).toEqual([]);
    expect(mockProjects.list).toHaveBeenCalledTimes(2);
  });

  it("should handle 500 Server Error", async () => {
    // Arrange
    const serverError = new Error("Internal Server Error");
    (serverError as unknown).response = {
      status: 500,
      data: { error: { message: "An unexpected error occurred", code: 500 } }
    };

    const mockProjects = {
      create: jest.fn().mockRejectedValue(serverError)
    };
    mockApi.projects = jest.fn(() => mockProjects) as unknown;

    // Act & Assert
    await expect(mockApi.projects().create({ name: "Test" }))
      .rejects
      .toThrow("Internal Server Error");
  });

  it("should handle validation errors with details", async () => {
    // Arrange
    const validationError = new Error("Bad Request");
    (validationError as unknown).response = {
      status: 400,
      data: {
        error: {
          message: "Validation failed",
          code: 400,
          errors: [
            { field: "name", message: "Name is required" },
            { field: "base_language_iso", message: "Invalid language code" },
            { field: "description", message: "Description too long (max 1000 chars)" }
          ]
        }
      }
    };

    const mockProjects = {
      create: jest.fn().mockRejectedValue(validationError)
    };
    mockApi.projects = jest.fn(() => mockProjects) as unknown;

    // Act & Assert
    try {
      await mockApi.projects().create({});
    } catch (err: unknown) {
      expect(err.response.status).toBe(400);
      expect(err.response.data.error.errors).toHaveLength(3);
      expect(err.response.data.error.errors[0].field).toBe("name");
    }
  });
});
```

## Rate Limiting Mock Implementation

```typescript
// src/test-utils/rate-limiting.test.ts
import { describe, it, expect, beforeEach, jest } from "@jest/globals";

class RateLimitedApiMock {
  private requestCount = 0;
  private readonly limit = 10; // Low limit for testing
  private resetTime = Date.now() + 60000;

  async makeRequest<T>(
    mockFn: jest.Mock,
    successResponse: T
  ): Promise<T> {
    this.requestCount++;

    if (this.requestCount > this.limit) {
      const error = new Error("Rate limit exceeded");
      (error as unknown).response = {
        status: 429,
        headers: {
          "x-rate-limit-limit": String(this.limit),
          "x-rate-limit-remaining": "0",
          "x-rate-limit-reset": String(this.resetTime / 1000)
        }
      };
      throw error;
    }

    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 10));

    return successResponse;
  }

  reset(): void {
    this.requestCount = 0;
    this.resetTime = Date.now() + 60000;
  }

  getRemaining(): number {
    return Math.max(0, this.limit - this.requestCount);
  }
}

describe("Rate Limiting Simulation", () => {
  let rateLimiter: RateLimitedApiMock;
  let mockApi: jest.Mock;

  beforeEach(() => {
    rateLimiter = new RateLimitedApiMock();
    mockApi = jest.fn();
  });

  it("should allow requests within rate limit", async () => {
    // Make 10 requests (within limit)
    const promises = Array.from({ length: 10 }, (_, i) =>
      rateLimiter.makeRequest(mockApi, { id: i })
    );

    const results = await Promise.all(promises);
    expect(results).toHaveLength(10);
    expect(rateLimiter.getRemaining()).toBe(0);
  });

  it("should reject requests exceeding rate limit", async () => {
    // Make 10 requests to exhaust limit
    await Promise.all(
      Array.from({ length: 10 }, () =>
        rateLimiter.makeRequest(mockApi, {})
      )
    );

    // 11th request should fail
    await expect(rateLimiter.makeRequest(mockApi, {}))
      .rejects
      .toThrow("Rate limit exceeded");
  });

  it("should reset after time window", async () => {
    // Exhaust limit
    await Promise.all(
      Array.from({ length: 10 }, () =>
        rateLimiter.makeRequest(mockApi, {})
      )
    );

    // Reset manually (simulating time passage)
    rateLimiter.reset();

    // Should work again
    const result = await rateLimiter.makeRequest(mockApi, { success: true });
    expect(result).toEqual({ success: true });
  });
});
```

## Bulk Operations Mock Example

```typescript
// src/domains/keys/keys.bulk.test.ts
import { describe, it, expect, beforeEach, jest } from "@jest/globals";
import { KeysService } from "./keys.service";
import { LokaliseApi } from "@lokalise/node-api";

jest.mock("@lokalise/node-api");

describe("Bulk Key Operations", () => {
  let service: KeysService;
  let mockKeys: jest.Mocked<any>;

  beforeEach(() => {
    mockKeys = {
      create: jest.fn(),
      bulk_update: jest.fn(),
      bulk_delete: jest.fn()
    };

    const mockApi = {
      keys: jest.fn(() => mockKeys)
    } as unknown;

    (LokaliseApi as jest.MockedClass<typeof LokaliseApi>).mockImplementation(
      () => mockApi
    );

    service = new KeysService();
  });

  it("should create 1000 keys in batches", async () => {
    // Arrange - Create 1000 keys
    const keysToCreate = Array.from({ length: 1000 }, (_, i) => ({
      key_name: { web: `key_${i + 1}` },
      translations: {
        en: `Translation ${i + 1}`,
        fr: `Traduction ${i + 1}`
      },
      platforms: ["web"],
      description: `Key number ${i + 1}`
    }));

    // Mock responses for 10 batches of 100 keys each
    const batchResponses = Array.from({ length: 10 }, (_, batchIndex) => ({
      items: keysToCreate
        .slice(batchIndex * 100, (batchIndex + 1) * 100)
        .map((key, i) => ({
          key_id: batchIndex * 100 + i + 1,
          ...key
        })),
      errors: []
    }));

    batchResponses.forEach(response => {
      mockKeys.create.mockResolvedValueOnce(response as unknown);
    });

    // Act - Process in batches
    const results = [];
    const batchSize = 100;

    for (let i = 0; i < keysToCreate.length; i += batchSize) {
      const batch = keysToCreate.slice(i, i + batchSize);
      const result = await service.createKeys("test_project", batch);
      results.push(result);
    }

    // Assert
    expect(results).toHaveLength(10);
    expect(mockKeys.create).toHaveBeenCalledTimes(10);

    const totalCreated = results.reduce(
      (sum, r) => sum + r.items.length,
      0
    );
    expect(totalCreated).toBe(1000);
  });

  it("should handle partial failures in bulk operations", async () => {
    // Arrange
    const keysToUpdate = Array.from({ length: 100 }, (_, i) => ({
      key_id: i + 1,
      description: `Updated description ${i + 1}`
    }));

    // Simulate 90% success rate
    const mockResponse = {
      items: keysToUpdate.slice(0, 90).map(k => ({
        ...k,
        key_name: { web: `key_${k.key_id}` }
      })),
      errors: keysToUpdate.slice(90).map(k => ({
        key_id: k.key_id,
        error: {
          message: "Key is locked and cannot be updated",
          code: "KEY_LOCKED"
        }
      }))
    };

    mockKeys.bulk_update.mockResolvedValue(mockResponse as unknown);

    // Act
    const result = await service.bulkUpdateKeys(
      "test_project",
      keysToUpdate
    );

    // Assert
    expect(result.items).toHaveLength(90);
    expect(result.errors).toHaveLength(10);
    expect(result.errors[0].error.code).toBe("KEY_LOCKED");
  });

  it("should handle bulk deletion with locked keys", async () => {
    // Arrange
    const keyIds = Array.from({ length: 500 }, (_, i) => i + 1);

    const mockResponse = {
      keys_removed: true,
      keys_locked: 25 // Some keys were locked and not deleted
    };

    mockKeys.bulk_delete.mockResolvedValue(mockResponse);

    // Act
    const result = await service.bulkDeleteKeys("test_project", keyIds);

    // Assert
    expect(result.keys_removed).toBe(true);
    expect(result.keys_locked).toBe(25);
    expect(mockKeys.bulk_delete).toHaveBeenCalledWith(
      keyIds,
      { project_id: "test_project" }
    );
  });
});
```

## Performance Testing Mock

```typescript
// src/test-utils/performance.test.ts
import { describe, it, expect, beforeEach, jest } from "@jest/globals";
import { performance } from "perf_hooks";

describe("Performance Testing", () => {
  it("should handle large datasets efficiently", async () => {
    // Arrange - Create large dataset
    const largeDataset = Array.from({ length: 10000 }, (_, i) => ({
      id: i + 1,
      name: `Item ${i + 1}`,
      data: {
        value: Math.random(),
        timestamp: Date.now()
      }
    }));

    const mockApi = {
      process: jest.fn().mockImplementation(async (data) => {
        // Simulate processing time
        await new Promise(resolve => setTimeout(resolve, 1));
        return { processed: data.length };
      })
    };

    // Act - Measure performance
    const startTime = performance.now();

    // Process in chunks for better performance
    const chunkSize = 1000;
    const results = [];

    for (let i = 0; i < largeDataset.length; i += chunkSize) {
      const chunk = largeDataset.slice(i, i + chunkSize);
      const result = await mockApi.process(chunk);
      results.push(result);
    }

    const endTime = performance.now();
    const duration = endTime - startTime;

    // Assert
    expect(results).toHaveLength(10);
    expect(duration).toBeLessThan(1000); // Should complete in < 1 second

    // Memory check
    const memoryUsage = process.memoryUsage();
    expect(memoryUsage.heapUsed).toBeLessThan(200 * 1024 * 1024); // < 200MB
  });

  it("should handle concurrent requests efficiently", async () => {
    // Arrange
    const mockApi = {
      fetch: jest.fn().mockImplementation(async (id) => {
        await new Promise(resolve => setTimeout(resolve, 10));
        return { id, data: `Data for ${id}` };
      })
    };

    // Act - Make 100 concurrent requests
    const startTime = performance.now();

    const promises = Array.from({ length: 100 }, (_, i) =>
      mockApi.fetch(i + 1)
    );

    const results = await Promise.all(promises);

    const endTime = performance.now();
    const duration = endTime - startTime;

    // Assert
    expect(results).toHaveLength(100);
    expect(duration).toBeLessThan(100); // Should parallelize well
    expect(mockApi.fetch).toHaveBeenCalledTimes(100);
  });
});
```

## Best Practices Summary

1. **Always mock at the module level** for unit tests
2. **Use realistic data structures** from API documentation
3. **Test error scenarios** comprehensively
4. **Include performance tests** for bulk operations
5. **Mock pagination headers** accurately
6. **Handle partial failures** in bulk operations
7. **Test rate limiting** behavior
8. **Verify memory usage** for large datasets
9. **Test concurrent operations** for scalability
10. **Keep mocks type-safe** with TypeScript

---

**Document Version**: 1.0.0
**Last Updated**: 2025-08-24
**Related**: API_MOCKING_GUIDE.md, TEST_FIXTURES_SPECIFICATION.md, DOMAIN_TEST_SPECIFICATIONS.md