# API Mocking Guide

## Overview

This guide provides comprehensive instructions for mocking the Lokalise API in the lokalise-mcp project. Based on analysis of the official Lokalise SDK testing patterns, we use Jest module mocking rather than HTTP-level mocking for better type safety and simpler test setup.

## Mocking Strategy

### Approach Comparison

| Approach | Pros | Cons | When to Use |
|----------|------|------|-------------|
| **Jest Module Mocking** (Recommended) | Type-safe, Simple setup, Fast execution | Not testing HTTP layer | Unit/Integration tests |
| **HTTP Mocking (undici)** | Tests full stack, Realistic | Complex setup, Slower | E2E tests only |
| **Service Mocking** | Focused testing, Fast | Limited scope | Controller tests |

### Our Strategy
We mock at the **module level** using Jest to mock the `@lokalise/node-api` package. This provides:
- Full type safety with TypeScript
- Simple, maintainable test code
- Fast test execution
- Easy error simulation

## Mock Factory Architecture

### Core Mock Factory

```typescript
// src/test-utils/mock-factory.ts
import { LokaliseApi } from "@lokalise/node-api";
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
    projects: jest.fn(() => ({
      list: jest.fn(),
      get: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      empty: jest.fn(),
    })),
    keys: jest.fn(() => ({
      list: jest.fn(),
      get: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      bulk_update: jest.fn(),
      delete: jest.fn(),
      bulk_delete: jest.fn(),
    })),
    languages: jest.fn(() => ({
      system_languages: jest.fn(),
      list: jest.fn(),
      get: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    })),
    tasks: jest.fn(() => ({
      list: jest.fn(),
      get: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    })),
    comments: jest.fn(() => ({
      list_project_comments: jest.fn(),
      list_key_comments: jest.fn(),
      get: jest.fn(),
      create: jest.fn(),
      delete: jest.fn(),
    })),
    translations: jest.fn(() => ({
      list: jest.fn(),
      get: jest.fn(),
      update: jest.fn(),
    })),
    contributors: jest.fn(() => ({
      list: jest.fn(),
      get: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    })),
  };

  // Apply error simulation if specified
  if (options.failOnMethod) {
    const [domain, method] = options.failOnMethod.split('.');
    if (mockApi[domain]) {
      mockApi[domain]()[method] = jest.fn().mockRejectedValue(
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
        domainMethods[method] = jest.fn(async (...args) => {
          await new Promise(resolve => setTimeout(resolve, options.delay));
          return original(...args);
        });
      });
    });
  }

  return mockApi as unknown as jest.Mocked<LokaliseApi>;
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
      ...project
    } as Project);
    this.totalCount++;
    return this;
  }

  withPagination(page: number, limit: number): this {
    this.page = page;
    this.limit = limit;
    return this;
  }

  build(): PaginatedResult<Project> {
    return {
      items: this.projects,
      totalResults: this.totalCount,
      totalPages: Math.ceil(this.totalCount / this.limit),
      resultsPerPage: this.limit,
      currentPage: this.page,
      hasNextPage: () => this.page < Math.ceil(this.totalCount / this.limit),
      hasPrevPage: () => this.page > 1,
      nextPage: () => this.page + 1,
      prevPage: () => this.page - 1,
    } as PaginatedResult<Project>;
  }
}
```

## Pagination Mocking

### Standard Pagination

```typescript
// Standard pagination with headers
export function createPaginatedResponse<T>(
  items: T[],
  page: number = 1,
  limit: number = 100,
  total: number = items.length
): PaginatedResult<T> {
  return {
    items,
    totalResults: total,
    totalPages: Math.ceil(total / limit),
    resultsPerPage: limit,
    currentPage: page,
    hasNextPage: () => page < Math.ceil(total / limit),
    hasPrevPage: () => page > 1,
    nextPage: () => page + 1,
    prevPage: () => page - 1,
  };
}
```

### Cursor Pagination

```typescript
// Cursor pagination for keys and translations
export function createCursorPaginatedResponse<T>(
  items: T[],
  nextCursor: string | null = null,
  limit: number = 100
): PaginatedResult<T> & { nextCursor: string | null; hasNextCursor: () => boolean } {
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
    prevPage: () => 0,
  };
}
```

## Error Response Mocking

### Error Simulation

```typescript
// src/test-utils/error-simulator.ts
export class ApiErrorSimulator {
  static unauthorized(): Error {
    const error = new Error("Unauthorized");
    (error as unknown).response = {
      status: 401,
      data: { error: { message: "Invalid API token" } }
    };
    return error;
  }

  static forbidden(): Error {
    const error = new Error("Forbidden");
    (error as unknown).response = {
      status: 403,
      data: { error: { message: "Access denied" } }
    };
    return error;
  }

  static notFound(resource: string): Error {
    const error = new Error("Not Found");
    (error as unknown).response = {
      status: 404,
      data: { error: { message: `${resource} not found` } }
    };
    return error;
  }

  static rateLimited(): Error {
    const error = new Error("Too Many Requests");
    (error as unknown).response = {
      status: 429,
      data: { error: { message: "Rate limit exceeded" } },
      headers: {
        'x-rate-limit-limit': '6000',
        'x-rate-limit-remaining': '0',
        'x-rate-limit-reset': String(Date.now() + 3600000)
      }
    };
    return error;
  }

  static serverError(): Error {
    const error = new Error("Internal Server Error");
    (error as unknown).response = {
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
export class RateLimiterMock {
  private requestCount = 0;
  private resetTime = Date.now() + 3600000; // 1 hour from now
  private limit = 6000;

  async simulateRequest<T>(
    mockFn: jest.Mock,
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
export function mockAuthentication(isValid: boolean = true) {
  if (!isValid) {
    return jest.fn().mockRejectedValue(ApiErrorSimulator.unauthorized());
  }

  return jest.fn().mockImplementation((config) => {
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
import { ProjectsService } from "./projects.service";
import { createMockLokaliseApi } from "../../test-utils/mock-factory";
import { ProjectsMockBuilder } from "../../test-utils/mock-builders/projects.mock";
import { ApiErrorSimulator } from "../../test-utils/error-simulator";

describe("ProjectsService", () => {
  let service: ProjectsService;
  let mockApi: ReturnType<typeof createMockLokaliseApi>;

  beforeEach(() => {
    mockApi = createMockLokaliseApi();
    service = new ProjectsService();

    // Replace the real API with mock
    (service as unknown).lokaliseApi = mockApi;
  });

  describe("listProjects", () => {
    it("should successfully list projects with pagination", async () => {
      // Arrange
      const mockResponse = new ProjectsMockBuilder()
        .withProject({
          project_id: "proj_1",
          name: "Project 1"
        })
        .withProject({
          project_id: "proj_2",
          name: "Project 2"
        })
        .withPagination(1, 10)
        .build();

      mockApi.projects().list.mockResolvedValue(mockResponse);

      // Act
      const result = await service.listProjects({ page: 1, limit: 10 });

      // Assert
      expect(result.items).toHaveLength(2);
      expect(result.items[0].name).toBe("Project 1");
      expect(mockApi.projects().list).toHaveBeenCalledWith({
        page: 1,
        limit: 10
      });
    });

    it("should handle rate limiting gracefully", async () => {
      // Arrange
      mockApi.projects().list
        .mockRejectedValueOnce(ApiErrorSimulator.rateLimited())
        .mockResolvedValueOnce(new ProjectsMockBuilder().build());

      // Act & Assert
      await expect(service.listProjects({}))
        .rejects.toThrow("Rate limit exceeded");

      // Verify retry logic would work after delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      const result = await service.listProjects({});
      expect(result.items).toBeDefined();
    });

    it("should handle authentication errors", async () => {
      // Arrange
      mockApi.projects().list.mockRejectedValue(
        ApiErrorSimulator.unauthorized()
      );

      // Act & Assert
      await expect(service.listProjects({}))
        .rejects.toThrow("Invalid API token");
    });
  });
});
```

## Testing Bulk Operations

```typescript
// Mock bulk operations with partial failures
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

## Integration with Jest Configuration

```javascript
// jest.config.js additions
module.exports = {
  // ... existing config
  moduleNameMapper: {
    "^@lokalise/node-api$": "<rootDir>/src/test-utils/lokalise-api.mock.ts"
  },
  setupFilesAfterEnv: ["<rootDir>/src/test-utils/setup.ts"],
  clearMocks: true,
  restoreMocks: true,
};
```

## Best Practices

### 1. Always Reset Mocks
```typescript
afterEach(() => {
  jest.clearAllMocks();
});
```

### 2. Use Type-Safe Builders
Always use the mock builders to ensure type safety and realistic data.

### 3. Test Error Scenarios
Every test suite should include error handling tests.

### 4. Mock at the Right Level
- Service tests: Mock LokaliseApi
- Controller tests: Mock services
- Tool tests: Mock controllers

### 5. Keep Fixtures Realistic
Use actual API response structures from the SDK fixtures as reference.

## Common Patterns

### Testing with Different API Keys
```typescript
it("should handle different workspaces", async () => {
  const workspace1Api = createMockLokaliseApi();
  const workspace2Api = createMockLokaliseApi();

  // Set different responses for different workspaces
  workspace1Api.projects().list.mockResolvedValue(workspace1Projects);
  workspace2Api.projects().list.mockResolvedValue(workspace2Projects);
});
```

### Simulating Network Delays
```typescript
const mockApi = createMockLokaliseApi({ delay: 100 });
// All API calls will have 100ms delay
```

### Progressive Response Testing
```typescript
mockApi.keys().list
  .mockResolvedValueOnce(page1Response)
  .mockResolvedValueOnce(page2Response)
  .mockResolvedValueOnce(page3Response);
```

## Troubleshooting

### Issue: Types not matching
**Solution**: Ensure you're importing types from `@lokalise/node-api` package.

### Issue: Mock not being called
**Solution**: Verify the mock is properly injected into the service.

### Issue: Async tests timing out
**Solution**: Ensure promises are properly resolved/rejected in mocks.

---

**Document Version**: 1.0.0
**Last Updated**: 2025-08-24
**Related**: TEST_IMPLEMENTATION_GUIDE.md, MOCK_IMPLEMENTATION_EXAMPLES.md