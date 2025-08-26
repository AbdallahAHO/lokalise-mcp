# API Mocking Guide

## Overview

This guide provides comprehensive instructions for mocking the Lokalise API in the lokalise-mcp project. Based on analysis of the official Lokalise SDK testing patterns, we use Vitest module mocking rather than HTTP-level mocking for better type safety and simpler test setup.

## Mocking Strategy

### Approach Comparison

| Approach | Pros | Cons | When to Use |
|----------|------|------|-------------|
| **Vitest Module Mocking** (Recommended) | Type-safe, Simple setup, Fast execution | Not testing HTTP layer | Unit/Integration tests |
| **HTTP Mocking (undici)** | Tests full stack, Realistic | Complex setup, Slower | E2E tests only |
| **Service Mocking** | Focused testing, Fast | Limited scope | Controller tests |

### Our Strategy
We mock at the **module level** using Vitest to mock the `@lokalise/node-api` package. This provides:
- Full type safety with TypeScript
- Simple, maintainable test code
- Fast test execution
- Easy error simulation

## Three-Tier Mocking Architecture

Our testing infrastructure uses three distinct mocking approaches:

### 1. Module Mocks (`__mocks__/`)
**Purpose**: Replace entire modules with mock implementations for unit testing
**Location**: `src/domains/{domain}/__mocks__/{module}.js`
**Usage**: Testing tools, resources, and CLI layers in isolation

### 2. Mock Builders (`mock-builders/`)
**Purpose**: Create realistic test data with a fluent API
**Location**: `src/test-utils/mock-builders/{domain}.mock.ts`
**Usage**: Testing controllers and formatters with realistic data

### 3. Mock Factory (`mock-factory.ts`)
**Purpose**: Create mock Lokalise API client for service layer testing
**Location**: `src/test-utils/mock-factory.ts`
**Usage**: Testing service layer with simulated API responses

## Mock Factory Architecture

### Core Mock Factory

```typescript
// src/test-utils/mock-factory.ts
import { vi } from "vitest";
import type { LokaliseApi } from "@lokalise/node-api";
import type {
  PaginatedResult,
  Project,
  Key,
  Language,
  Task,
  Comment,
  Translation,
  Contributor
} from "@lokalise/node-api";

export interface MockLokaliseApiOptions {
  failOnMethod?: string;
  errorCode?: number;
  errorMessage?: string;
  delay?: number;
}

export function createMockLokaliseApi(options: MockLokaliseApiOptions = {}) {
  const mockApi = {
    projects: vi.fn(() => ({
      list: vi.fn(),
      get: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      empty: vi.fn(),
    })),
    keys: vi.fn(() => ({
      list: vi.fn(),
      get: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      bulk_update: vi.fn(),
      delete: vi.fn(),
      bulk_delete: vi.fn(),
    })),
    languages: vi.fn(() => ({
      system_languages: vi.fn(),
      list: vi.fn(),
      get: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    })),
    tasks: vi.fn(() => ({
      list: vi.fn(),
      get: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    })),
    comments: vi.fn(() => ({
      list_project_comments: vi.fn(),
      list_key_comments: vi.fn(),
      get: vi.fn(),
      create: vi.fn(),
      delete: vi.fn(),
    })),
    translations: vi.fn(() => ({
      list: vi.fn(),
      get: vi.fn(),
      update: vi.fn(),
    })),
    contributors: vi.fn(() => ({
      list: vi.fn(),
      get: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    })),
  };

  // Apply error simulation if specified
  if (options.failOnMethod) {
    const [domain, method] = options.failOnMethod.split('.');
    if (mockApi[domain]) {
      mockApi[domain]()[method] = vi.fn().mockRejectedValue(
        new Error(options.errorMessage || `API Error: ${options.errorCode || 500}`)
      );
    }
  }

  // Apply delay if specified
  if (options.delay) {
    Object.keys(mockApi).forEach(domain => {
      const domainMethods = mockApi[domain]();
      Object.keys(domainMethods).forEach(method => {
        const original = domainMethods[method];
        domainMethods[method] = vi.fn(async (...args) => {
          await new Promise(resolve => setTimeout(resolve, options.delay));
          return original(...args);
        });
      });
    });
  }

  return mockApi as unknown as LokaliseApi;
}
```

### Domain-Specific Mock Builders

```typescript
// src/test-utils/mock-builders/projects.mock.ts
import type { Project, PaginatedResult } from "@lokalise/node-api";

export class ProjectsMockBuilder {
  private projects: Project[] = [];
  private totalCount = 0;
  private page = 1;
  private limit = 100;

  withProject(project: Partial<Project>): this {
    this.projects.push({
      project_id: project.project_id || "test_project_id",
      name: project.name || "Test Project",
      description: project.description || "",
      created_at: project.created_at || "2024-01-01 00:00:00 (Etc/UTC)",
      created_at_timestamp: project.created_at_timestamp || 1704067200,
      created_by: project.created_by || 12345,
      created_by_email: project.created_by_email || "test@example.com",
      team_id: project.team_id || 100,
      base_language_id: project.base_language_id || 640,
      base_language_iso: project.base_language_iso || "en",
      project_type: project.project_type || "localization_files",
      settings: project.settings || {},
      statistics: project.statistics || {
        progress_total: 0,
        keys_total: 0,
        team: 0,
        base_words: 0,
        qa_issues_total: 0,
        qa_issues: {},
        languages: []
      },
      ...project
    });
    this.totalCount++;
    return this;
  }

  withPagination(page: number, limit: number): this {
    this.page = page;
    this.limit = limit;
    return this;
  }

  build(): PaginatedResult<Project> {
    const totalPages = Math.ceil(this.totalCount / this.limit);
    return {
      items: this.projects,
      totalResults: this.totalCount,
      totalPages,
      resultsPerPage: this.limit,
      currentPage: this.page,
      hasNextPage: () => this.page < totalPages,
      hasPrevPage: () => this.page > 1,
      isFirstPage: () => this.page === 1,
      isLastPage: () => this.page === totalPages,
      nextPage: () => this.page + 1,
      prevPage: () => this.page - 1
    };
  }
}
```

## Module Mocking Patterns

### Module Mock Example

```javascript
// src/domains/projects/__mocks__/projects.controller.js
import { vi } from "vitest";

export default {
  listProjects: vi.fn(),
  getProjectDetails: vi.fn(),
  createProject: vi.fn(),
  updateProject: vi.fn(),
  deleteProject: vi.fn(),
  emptyProject: vi.fn(),
};
```

### Using Module Mocks in Tests

```typescript
// src/domains/projects/projects.tool.test.ts
import { vi, describe, it, expect, beforeEach } from "vitest";

// This loads __mocks__/projects.controller.js automatically
vi.mock("./projects.controller.js");

import projectsController from "./projects.controller.js";
import projectsTool from "./projects.tool.js";

describe("ProjectsTool", () => {
  const mockedController = vi.mocked(projectsController);

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should call controller with correct arguments", async () => {
    const mockResponse = {
      content: "Projects list",
      data: []
    };
    mockedController.listProjects.mockResolvedValue(mockResponse);

    // Test implementation...
  });
});
```

## Error Simulation Patterns

```typescript
// src/test-utils/error-simulator.ts
export class ApiErrorSimulator {
  static unauthorized() {
    const error = new Error("Unauthorized");
    (error as any).response = {
      status: 401,
      data: { error: { message: "Invalid API token", code: 401 } }
    };
    return error;
  }

  static forbidden() {
    const error = new Error("Forbidden");
    (error as any).response = {
      status: 403,
      data: { error: { message: "Permission denied", code: 403 } }
    };
    return error;
  }

  static notFound() {
    const error = new Error("Not Found");
    (error as any).response = {
      status: 404,
      data: { error: { message: "Resource not found", code: 404 } }
    };
    return error;
  }

  static rateLimited() {
    const error = new Error("Too Many Requests");
    (error as any).response = {
      status: 429,
      data: { error: { message: "Rate limit exceeded", code: 429 } },
      headers: {
        "x-rate-limit-limit": "6000",
        "x-rate-limit-remaining": "0",
        "x-rate-limit-reset": String(Date.now() / 1000 + 60)
      }
    };
    return error;
  }

  static serverError() {
    const error = new Error("Internal Server Error");
    (error as any).response = {
      status: 500,
      data: { error: { message: "An unexpected error occurred" } }
    };
    return error;
  }
}
```

## Rate Limiting Simulation

```typescript
// src/test-utils/rate-limiter.mock.ts
import { vi } from "vitest";

export class RateLimiterMock {
  private requestCount = 0;
  private resetTime = Date.now() + 3600000; // 1 hour from now
  private limit = 6000;

  async simulateRequest<T>(
    mockFn: ReturnType<typeof vi.fn>,
    response: T
  ): Promise<T> {
    this.requestCount++;

    if (this.requestCount > this.limit) {
      throw ApiErrorSimulator.rateLimited();
    }

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 10));

    return response;
  }

  reset(): void {
    this.requestCount = 0;
    this.resetTime = Date.now() + 3600000;
  }

  getRemainingRequests(): number {
    return Math.max(0, this.limit - this.requestCount);
  }
}
```

## Authentication Mocking

```typescript
// src/test-utils/auth.mock.ts
import { vi } from "vitest";

export function mockAuthentication(isValid: boolean = true) {
  if (!isValid) {
    return vi.fn().mockRejectedValue(ApiErrorSimulator.unauthorized());
  }

  return vi.fn().mockImplementation((config) => {
    // Verify API key is present
    if (!config.apiKey) {
      throw ApiErrorSimulator.unauthorized();
    }
    return config;
  });
}
```

## Complete Test Setup Example

```typescript
// src/domains/projects/projects.service.test.ts
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { createMockLokaliseApi } from "../../test-utils/mock-factory";
import { ProjectsMockBuilder } from "../../test-utils/mock-builders/projects.mock";
import { ApiErrorSimulator } from "../../test-utils/error-simulator";

// Mock the service's getLokaliseApi function
vi.mock("../../shared/utils/lokalise-api.util.js");

import projectsService from "./projects.service.js";
import { getLokaliseApi } from "../../shared/utils/lokalise-api.util.js";

describe("ProjectsService", () => {
  const mockGetLokaliseApi = vi.mocked(getLokaliseApi);
  let mockApi: ReturnType<typeof createMockLokaliseApi>;
  let mockProjects: any;

  beforeEach(() => {
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
    it("should fetch projects with pagination", async () => {
      // Arrange
      const mockBuilder = new ProjectsMockBuilder();
      const mockResponse = mockBuilder
        .withProject({ name: "Test Project", project_id: "123.45" })
        .withProject({ name: "Another Project", project_id: "678.90" })
        .withPagination(1, 100)
        .build();

      mockProjects.list.mockResolvedValue(mockResponse);

      // Act
      const result = await projectsService.getProjects({
        page: 1,
        limit: 100
      });

      // Assert
      expect(result).toEqual(mockResponse);
      expect(mockProjects.list).toHaveBeenCalledWith({
        page: 1,
        limit: 100
      });
    });

    it("should handle API errors", async () => {
      // Arrange
      mockProjects.list.mockRejectedValue(ApiErrorSimulator.serverError());

      // Act & Assert
      await expect(projectsService.getProjects({}))
        .rejects
        .toThrow("Internal Server Error");
    });

    it("should handle rate limiting", async () => {
      // Arrange
      mockProjects.list.mockRejectedValue(ApiErrorSimulator.rateLimited());

      // Act & Assert
      await expect(projectsService.getProjects({}))
        .rejects
        .toThrow("Too Many Requests");
    });
  });
});
```

## Pagination Mocking Helpers

```typescript
// src/test-utils/pagination.helpers.ts
export function mockPaginatedResponse<T>(
  items: T[],
  page = 1,
  limit = 100,
  total?: number
) {
  const totalResults = total || items.length;
  const totalPages = Math.ceil(totalResults / limit);
  
  return {
    items,
    totalResults,
    totalPages,
    resultsPerPage: limit,
    currentPage: page,
    hasNextPage: () => page < totalPages,
    hasPrevPage: () => page > 1,
    isFirstPage: () => page === 1,
    isLastPage: () => page === totalPages,
    nextPage: () => page + 1,
    prevPage: () => page - 1
  };
}

export function mockCursorPaginatedResponse<T>(
  items: T[],
  nextCursor: string | null = null,
  limit = 100
) {
  return {
    items,
    totalResults: 0, // Not provided in cursor pagination
    totalPages: 0,
    resultsPerPage: limit,
    currentPage: 0,
    nextCursor,
    hasNextCursor: () => nextCursor !== null,
    hasNextPage: () => false,
    hasPrevPage: () => false,
    nextPage: () => 0,
    prevPage: () => 0
  };
}
```

## Bulk Operation Mocking

```typescript
// src/test-utils/bulk-operations.helpers.ts
export function mockBulkOperation<T>(
  successItems: T[],
  failedItems: Array<{ item: T; error: string }>
) {
  return {
    items: successItems,
    errors: failedItems.map(f => ({
      ...f.item,
      error: { message: f.error }
    }))
  };
}

// Usage
mockApi.keys().bulk_update.mockResolvedValue(
  mockBulkOperation(
    [{ key_id: 1, key_name: "updated.key" }],
    [{ item: { key_id: 2 }, error: "Key is locked" }]
  )
);
```

## Integration with Vitest Configuration

```typescript
// vitest.config.ts
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    globals: true,
    environment: "node",
    setupFiles: ["./src/test-utils/setup.ts"],
    clearMocks: true,
    restoreMocks: true,
    mockReset: true,
  },
});
```

## Best Practices

### 1. Always Reset Mocks
```typescript
afterEach(() => {
  vi.clearAllMocks();
});
```

### 2. Use Type-Safe Builders
Always use the mock builders to ensure type safety and realistic data.

### 3. Test Error Scenarios
Every test suite should include error handling tests.

### 4. Mock at the Right Level
- Service tests: Mock LokaliseApi with Mock Factory
- Controller tests: Mock services with Module Mocks
- Tool tests: Mock controllers with Module Mocks

### 5. Keep Fixtures Realistic
Use actual API response structures from the SDK fixtures as reference.

## Common Patterns

### Testing with Different API Keys
```typescript
it("should handle invalid API key", async () => {
  mockGetLokaliseApi.mockImplementation(() => {
    throw ApiErrorSimulator.unauthorized();
  });

  await expect(service.getProjects({}))
    .rejects
    .toThrow("Unauthorized");
});
```

### Testing with Network Delays
```typescript
it("should handle network delays", async () => {
  const mockApi = createMockLokaliseApi({ delay: 1000 });
  mockGetLokaliseApi.mockReturnValue(mockApi as unknown as LokaliseApi);

  const start = Date.now();
  await service.getProjects({});
  const duration = Date.now() - start;

  expect(duration).toBeGreaterThanOrEqual(1000);
});
```

### Testing Concurrent Operations
```typescript
it("should handle concurrent requests", async () => {
  const promises = Array.from({ length: 10 }, (_, i) =>
    service.getProject(`project_${i}`)
  );

  const results = await Promise.all(promises);
  expect(results).toHaveLength(10);
  expect(mockProjects.get).toHaveBeenCalledTimes(10);
});
```

## Troubleshooting

### Common Issues

1. **Mock Not Working**
   - Check if using correct mock type for layer
   - Module mocks must be in `__mocks__/` directory
   - Verify vi.mock() placement (before imports)
   - Ensure `.js` extension in mock path

2. **Type Errors**
   - NEVER use `any` - it's forbidden
   - Use `unknown` as intermediate type
   - Create proper interfaces for mocks
   - Cast through `unknown`: `mockApi as unknown as LokaliseApi`

3. **Async Issues**
   - Always await async operations
   - Use mockResolvedValue for async success
   - Use mockRejectedValue for async errors

---

**Document Version**: 2.0.0
**Last Updated**: 2025-08-26
**Framework**: Vitest
**Related**: TESTING-GUIDE.md, NEW-DOMAIN-TESTING.md, TEST-TROUBLESHOOTING.md