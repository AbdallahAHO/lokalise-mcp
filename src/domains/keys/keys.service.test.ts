import type {
	ApiError,
	CursorPaginatedResult,
	Key,
	LokaliseApi,
} from "@lokalise/node-api";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { McpError } from "../../shared/utils/error.util.js";
import {
	createNotFoundError,
	createRateLimitedError,
	createServerError,
	createUnauthorizedError,
	createValidationError,
} from "../../test-utils/error-simulator.js";
import { KeysMockBuilder } from "../../test-utils/mock-builders/keys.mock.js";
import { createMockLokaliseApi } from "../../test-utils/mock-factory.js";

// Mock the lokalise-api.util module
vi.mock("../../shared/utils/lokalise-api.util.js");

import { getLokaliseApi } from "../../shared/utils/lokalise-api.util.js";
// Import the service
import * as keysService from "./keys.service.js";

// Get the mocked function for type safety
const mockGetLokaliseApi = vi.mocked(getLokaliseApi);

describe("KeysService", () => {
	let mockApi: ReturnType<typeof createMockLokaliseApi>;
	// biome-ignore lint/suspicious/noExplicitAny: its a mock
	let mockKeys: any;

	beforeEach(() => {
		// Clear all mocks
		vi.clearAllMocks();

		// Create mock API
		mockApi = createMockLokaliseApi();
		mockKeys = mockApi.keys();

		// Configure the mock to return our API
		mockGetLokaliseApi.mockReturnValue(mockApi as unknown as LokaliseApi);
	});

	afterEach(() => {
		vi.clearAllMocks();
	});

	describe("Pagination", () => {
		describe("Standard Pagination", () => {
			it("should fetch keys with default pagination", async () => {
				// Arrange
				const mockBuilder = new KeysMockBuilder();
				const mockResponse = mockBuilder
					.withKey({ key_name: { web: "key.one" }, key_id: 123 })
					.withKey({ key_name: { web: "key.two" }, key_id: 456 })
					.withPagination(1, 100)
					.build();

				mockKeys.list.mockResolvedValue(mockResponse);

				// Act
				const result = await keysService.getKeys({
					project_id: "test-project-123",
				});

				// Assert
				expect(result.items).toHaveLength(2);
				expect(result.items[0].key_id).toBe(123);
				expect(result.items[1].key_id).toBe(456);
				expect(result.currentPage).toBe(1);
				expect(result.resultsPerPage).toBe(100);
				expect(mockKeys.list).toHaveBeenCalledWith({
					project_id: "test-project-123",
					limit: 100,
					pagination: "cursor",
				});
			});

			it("should fetch keys with custom page and limit", async () => {
				// Arrange
				const mockBuilder = new KeysMockBuilder();
				const mockResponse = mockBuilder
					.withKey({ key_name: { web: "key.three" }, key_id: 789 })
					.withPagination(2, 50)
					.build();

				mockKeys.list.mockResolvedValue(mockResponse);

				// Act
				const result = await keysService.getKeys({
					project_id: "test-project-123",
					page: 2,
					limit: 50,
					pagination: "offset",
				});

				// Assert
				expect(result.items).toHaveLength(1);
				expect(result.currentPage).toBe(2);
				expect(result.resultsPerPage).toBe(50);
				expect(mockKeys.list).toHaveBeenCalledWith({
					project_id: "test-project-123",
					page: 2,
					limit: 50,
					pagination: "offset",
				});
			});

			it("should handle first page of multiple pages", async () => {
				// Arrange
				const mockBuilder = new KeysMockBuilder();
				// Create 10 keys to simulate pagination
				for (let i = 1; i <= 10; i++) {
					mockBuilder.withKey({
						key_name: { web: `key.item${i}` },
						key_id: i,
					});
				}
				const mockResponse = mockBuilder.withPagination(1, 10).build();
				// Manually override pagination properties for the test
				Object.assign(mockResponse, {
					totalResults: 100,
					totalPages: 10,
					hasNextPage: () => true,
					hasPrevPage: () => false,
					isFirstPage: () => true,
					isLastPage: () => false,
				});

				mockKeys.list.mockResolvedValue(mockResponse);

				// Act
				const result = await keysService.getKeys({
					project_id: "test-project-123",
					page: 1,
					limit: 10,
					pagination: "offset",
				});

				// Assert
				expect(result.items).toHaveLength(10);
				expect(result.hasNextPage()).toBe(true);
				expect(result.hasPrevPage()).toBe(false);
				expect(result.isFirstPage()).toBe(true);
				expect(result.isLastPage()).toBe(false);
			});

			it("should handle middle page navigation", async () => {
				// Arrange
				const mockBuilder = new KeysMockBuilder();
				for (let i = 21; i <= 30; i++) {
					mockBuilder.withKey({
						key_name: { web: `key.item${i}` },
						key_id: i,
					});
				}
				const mockResponse = mockBuilder.withPagination(3, 10).build();
				// Manually override pagination properties for the test
				Object.assign(mockResponse, {
					totalResults: 100,
					totalPages: 10,
					currentPage: 3,
					hasNextPage: () => true,
					hasPrevPage: () => true,
					isFirstPage: () => false,
					isLastPage: () => false,
					nextPage: () => 4,
					prevPage: () => 2,
				});

				mockKeys.list.mockResolvedValue(mockResponse);

				// Act
				const result = await keysService.getKeys({
					project_id: "test-project-123",
					page: 3,
					limit: 10,
					pagination: "offset",
				});

				// Assert
				expect(result.items).toHaveLength(10);
				expect(result.hasNextPage()).toBe(true);
				expect(result.hasPrevPage()).toBe(true);
				expect(result.isFirstPage()).toBe(false);
				expect(result.isLastPage()).toBe(false);
				expect(result.nextPage()).toBe(4);
				expect(result.prevPage()).toBe(2);
			});

			it("should handle last page detection", async () => {
				// Arrange
				const mockBuilder = new KeysMockBuilder();
				for (let i = 91; i <= 100; i++) {
					mockBuilder.withKey({
						key_name: { web: `key.item${i}` },
						key_id: i,
					});
				}
				const mockResponse = mockBuilder.withPagination(10, 10).build();
				// Manually override pagination properties for the test
				Object.assign(mockResponse, {
					totalResults: 100,
					totalPages: 10,
					currentPage: 10,
					hasNextPage: () => false,
					hasPrevPage: () => true,
					isFirstPage: () => false,
					isLastPage: () => true,
				});

				mockKeys.list.mockResolvedValue(mockResponse);

				// Act
				const result = await keysService.getKeys({
					project_id: "test-project-123",
					page: 10,
					limit: 10,
					pagination: "offset",
				});

				// Assert
				expect(result.items).toHaveLength(10);
				expect(result.hasNextPage()).toBe(false);
				expect(result.hasPrevPage()).toBe(true);
				expect(result.isFirstPage()).toBe(false);
				expect(result.isLastPage()).toBe(true);
			});

			it("should handle empty results", async () => {
				// Arrange
				const mockBuilder = new KeysMockBuilder();
				const mockResponse = mockBuilder.withPagination(1, 100).build();
				// Override for empty results case
				Object.assign(mockResponse, {
					totalResults: 0,
					totalPages: 0,
					hasNextPage: () => false,
					isFirstPage: () => true,
					isLastPage: () => true,
				});

				mockKeys.list.mockResolvedValue(mockResponse);

				// Act
				const result = await keysService.getKeys({
					project_id: "empty-project",
				});

				// Assert
				expect(result.items).toHaveLength(0);
				expect(result.totalResults).toBe(0);
				expect(result.hasNextPage()).toBe(false);
				expect(result.isFirstPage()).toBe(true);
				expect(result.isLastPage()).toBe(true);
			});

			it("should handle invalid page numbers gracefully", async () => {
				// Arrange
				const mockBuilder = new KeysMockBuilder();
				const mockResponse = mockBuilder.withPagination(1, 100).build();

				mockKeys.list.mockResolvedValue(mockResponse);

				// Act - request page 999 which doesn't exist
				const result = await keysService.getKeys({
					project_id: "test-project-123",
					page: 999,
					limit: 100,
					pagination: "offset",
				});

				// Assert - should return empty but valid response
				expect(result.items).toHaveLength(0);
				expect(mockKeys.list).toHaveBeenCalledWith({
					project_id: "test-project-123",
					page: 999,
					limit: 100,
					pagination: "offset",
				});
			});
		});

		describe("Cursor Pagination", () => {
			it("should fetch keys with cursor pagination (initial request)", async () => {
				// Arrange
				const mockBuilder = new KeysMockBuilder();
				const nextCursor = "eyIxIjo1MjcyNjU2MTd9";
				const mockResponse = mockBuilder
					.withKey({ key_name: { web: "cursor.key1" }, key_id: 1001 })
					.withKey({ key_name: { web: "cursor.key2" }, key_id: 1002 })
					.withCursorPagination(nextCursor, 100)
					.build();

				mockKeys.list.mockResolvedValue(mockResponse);

				// Act
				const result = await keysService.getKeys({
					project_id: "test-project-123",
					pagination: "cursor",
					limit: 100,
				});

				// Assert
				expect(result.items).toHaveLength(2);
				expect(result.nextCursor).toBe(nextCursor);
				expect(result.hasNextCursor?.()).toBe(true);
				expect(mockKeys.list).toHaveBeenCalledWith({
					project_id: "test-project-123",
					limit: 100,
					pagination: "cursor",
				});
			});

			it("should fetch keys with cursor pagination (subsequent request)", async () => {
				// Arrange
				const currentCursor = "eyIxIjo1MjcyNjU2MTd9";
				const nextCursor = "eyIyIjoxMDU0NTMyMjEwfQ";
				const mockBuilder = new KeysMockBuilder();
				const mockResponse = mockBuilder
					.withKey({ key_name: { web: "cursor.key3" }, key_id: 1003 })
					.withKey({ key_name: { web: "cursor.key4" }, key_id: 1004 })
					.withCursorPagination(nextCursor, 100)
					.build();

				mockKeys.list.mockResolvedValue(mockResponse);

				// Act
				const result = await keysService.getKeys({
					project_id: "test-project-123",
					pagination: "cursor",
					cursor: currentCursor,
					limit: 100,
				});

				// Assert
				expect(result.items).toHaveLength(2);
				expect(result.nextCursor).toBe(nextCursor);
				expect(result.hasNextCursor?.()).toBe(true);
				expect(mockKeys.list).toHaveBeenCalledWith({
					project_id: "test-project-123",
					limit: 100,
					pagination: "cursor",
					cursor: currentCursor,
				});
			});

			it("should handle last page with cursor pagination (no next cursor)", async () => {
				// Arrange
				const currentCursor = "eyIzIjoyMTA5MDY0NDIxfQ";
				const mockBuilder = new KeysMockBuilder();
				const mockResponse = mockBuilder
					.withKey({ key_name: { web: "cursor.key.last" }, key_id: 9999 })
					.withCursorPagination(null, 100) // null indicates no more pages
					.build();

				mockKeys.list.mockResolvedValue(mockResponse);

				// Act
				const result = await keysService.getKeys({
					project_id: "test-project-123",
					pagination: "cursor",
					cursor: currentCursor,
					limit: 100,
				});

				// Assert
				expect(result.items).toHaveLength(1);
				expect(result.nextCursor).toBeNull();
				expect(result.hasNextCursor?.()).toBe(false);
			});

			it("should handle empty results with cursor pagination", async () => {
				// Arrange
				const mockBuilder = new KeysMockBuilder();
				const mockResponse = mockBuilder
					.withCursorPagination(null, 100)
					.build();

				mockKeys.list.mockResolvedValue(mockResponse);

				// Act
				const result = await keysService.getKeys({
					project_id: "empty-project",
					pagination: "cursor",
				});

				// Assert
				expect(result.items).toHaveLength(0);
				expect(result.nextCursor).toBeNull();
				expect(result.hasNextCursor?.()).toBe(false);
			});

			it("should handle invalid cursor gracefully", async () => {
				// Arrange
				const invalidCursor = "invalid-cursor-format";
				const error = createValidationError("Invalid cursor format");

				mockKeys.list.mockRejectedValue(error);

				// Act & Assert
				await expect(
					keysService.getKeys({
						project_id: "test-project-123",
						pagination: "cursor",
						cursor: invalidCursor,
					}),
				).rejects.toThrow(McpError);
			});

			it("should handle expired cursor", async () => {
				// Arrange
				const expiredCursor = "eyJleHBpcmVkIjp0cnVlfQ";
				const error = createValidationError("Cursor has expired");

				mockKeys.list.mockRejectedValue(error);

				// Act & Assert
				await expect(
					keysService.getKeys({
						project_id: "test-project-123",
						pagination: "cursor",
						cursor: expiredCursor,
					}),
				).rejects.toThrow(McpError);
			});
		});

		describe("Error Handling - Pagination Specific", () => {
			it('should handle "Response too big" error', async () => {
				// Arrange
				const error = createServerError(
					"Response too big. Please use cursor pagination or reduce the limit",
				);
				error.code = 413; // Payload Too Large

				mockKeys.list.mockRejectedValue(error);

				// Act & Assert
				await expect(
					keysService.getKeys({
						project_id: "huge-project",
						limit: 1000,
						pagination: "offset",
					}),
				).rejects.toThrow(McpError);

				try {
					await keysService.getKeys({
						project_id: "huge-project",
						limit: 1000,
						pagination: "offset",
					});
				} catch (err) {
					const mcpError = err as McpError;
					expect(mcpError.message).toContain("Failed to fetch keys");
				}
			});

			it("should handle rate limiting during pagination", async () => {
				// Arrange
				const error = createRateLimitedError();

				mockKeys.list.mockRejectedValue(error);

				// Act & Assert
				await expect(
					keysService.getKeys({
						project_id: "test-project-123",
						page: 5,
						limit: 100,
					}),
				).rejects.toThrow(McpError);
			});

			it("should handle network timeout during large pagination", async () => {
				// Arrange
				const error = new Error("ETIMEDOUT");
				(error as ApiError).code = 408; // Request Timeout

				mockKeys.list.mockRejectedValue(error);

				// Act & Assert
				await expect(
					keysService.getKeys({
						project_id: "test-project-123",
						limit: 500,
					}),
				).rejects.toThrow(McpError);
			});
		});

		describe("Performance Tests", () => {
			it("should handle bulk retrieval of 100 items efficiently", async () => {
				// Arrange
				const mockBuilder = new KeysMockBuilder();
				for (let i = 1; i <= 100; i++) {
					mockBuilder.withKey({
						key_name: { web: `perf.key${i}` },
						key_id: i,
					});
				}
				const mockResponse = mockBuilder.withPagination(1, 100).build();

				mockKeys.list.mockResolvedValue(mockResponse);

				// Act
				const startTime = Date.now();
				const result = await keysService.getKeys({
					project_id: "perf-test-project",
					limit: 100,
					pagination: "offset",
				});
				const endTime = Date.now();

				// Assert
				expect(result.items).toHaveLength(100);
				expect(endTime - startTime).toBeLessThan(1000); // Should complete within 1 second
			});

			it("should handle bulk retrieval of 1000 items with cursor pagination", async () => {
				// Arrange
				const mockBuilder = new KeysMockBuilder();
				for (let i = 1; i <= 1000; i++) {
					mockBuilder.withKey({
						key_name: { web: `bulk.key${i}` },
						key_id: i,
					});
				}
				const mockResponse = mockBuilder
					.withCursorPagination("next-cursor-1000", 1000)
					.build();

				mockKeys.list.mockResolvedValue(mockResponse);

				// Act
				const startTime = Date.now();
				const result = await keysService.getKeys({
					project_id: "bulk-test-project",
					limit: 1000,
					pagination: "cursor",
				});
				const endTime = Date.now();

				// Assert
				expect(result.items).toHaveLength(1000);
				expect(endTime - startTime).toBeLessThan(2000); // Should complete within 2 seconds
			});

			it("should efficiently handle multiple pagination requests in sequence", async () => {
				// Arrange - simulate fetching 300 items across 3 pages
				const page1Builder = new KeysMockBuilder();
				const page2Builder = new KeysMockBuilder();
				const page3Builder = new KeysMockBuilder();

				for (let i = 1; i <= 100; i++) {
					page1Builder.withKey({
						key_name: { web: `seq.key${i}` },
						key_id: i,
					});
				}
				for (let i = 101; i <= 200; i++) {
					page2Builder.withKey({
						key_name: { web: `seq.key${i}` },
						key_id: i,
					});
				}
				for (let i = 201; i <= 300; i++) {
					page3Builder.withKey({
						key_name: { web: `seq.key${i}` },
						key_id: i,
					});
				}

				const page1Response = page1Builder.withPagination(1, 100).build();
				page1Response.totalResults = 300;
				page1Response.totalPages = 3;

				const page2Response = page2Builder.withPagination(2, 100).build();
				page2Response.totalResults = 300;
				page2Response.totalPages = 3;

				const page3Response = page3Builder.withPagination(3, 100).build();
				page3Response.totalResults = 300;
				page3Response.totalPages = 3;

				mockKeys.list
					.mockResolvedValueOnce(page1Response)
					.mockResolvedValueOnce(page2Response)
					.mockResolvedValueOnce(page3Response);

				// Act
				const startTime = Date.now();
				const results: CursorPaginatedResult<Key>[] = [];

				for (let page = 1; page <= 3; page++) {
					const result = await keysService.getKeys({
						project_id: "sequential-test-project",
						page,
						limit: 100,
						pagination: "offset",
					});
					results.push(result);
				}
				const endTime = Date.now();

				// Assert
				expect(results).toHaveLength(3);
				expect(results[0].items).toHaveLength(100);
				expect(results[1].items).toHaveLength(100);
				expect(results[2].items).toHaveLength(100);
				expect(endTime - startTime).toBeLessThan(3000); // Should complete within 3 seconds
			});

			it("should measure memory efficiency with large datasets", async () => {
				// This is more of a conceptual test to ensure the structure is efficient
				// In real scenarios, you'd use actual memory profiling tools

				// Arrange
				const mockBuilder = new KeysMockBuilder();
				const keyCount = 5000;

				for (let i = 1; i <= keyCount; i++) {
					mockBuilder.withKey({
						key_name: { web: `memory.test.key${i}` },
						key_id: i,
						description: `Description for key ${i}`,
						tags: [`tag${i % 10}`, `category${i % 5}`],
					});
				}

				const mockResponse = mockBuilder
					.withCursorPagination("memory-test-cursor", keyCount)
					.build();

				mockKeys.list.mockResolvedValue(mockResponse);

				// Act
				const result = await keysService.getKeys({
					project_id: "memory-test-project",
					limit: keyCount,
					pagination: "cursor",
				});

				// Assert
				expect(result.items).toHaveLength(keyCount);
				// Ensure the response structure is as expected
				expect(result.nextCursor).toBe("memory-test-cursor");
				expect(result.hasNextCursor?.()).toBe(true);
			});
		});

		describe("Filtering with Pagination", () => {
			it("should apply filters with standard pagination", async () => {
				// Arrange
				const mockBuilder = new KeysMockBuilder();
				const mockResponse = mockBuilder
					.withKey({
						key_name: { web: "filtered.key1" },
						key_id: 1,
						platforms: ["ios", "android"],
						tags: ["mobile"],
					})
					.withKey({
						key_name: { web: "filtered.key2" },
						key_id: 2,
						platforms: ["ios"],
						tags: ["mobile", "priority"],
					})
					.withPagination(1, 50)
					.build();

				mockKeys.list.mockResolvedValue(mockResponse);

				// Act
				const result = await keysService.getKeys({
					project_id: "test-project-123",
					filter_platforms: ["ios", "android"],
					filter_tags: ["mobile"],
					page: 1,
					limit: 50,
					pagination: "offset",
				});

				// Assert
				expect(result.items).toHaveLength(2);
				expect(mockKeys.list).toHaveBeenCalledWith({
					project_id: "test-project-123",
					filter_platforms: "ios,android",
					filter_tags: "mobile",
					page: 1,
					limit: 50,
					pagination: "offset",
				});
			});

			it("should apply filters with cursor pagination", async () => {
				// Arrange
				const mockBuilder = new KeysMockBuilder();
				const mockResponse = mockBuilder
					.withKey({
						key_name: { web: "cursor.filtered.key1" },
						key_id: 101,
						platforms: ["web"],
					})
					.withCursorPagination("filter-cursor-123", 100)
					.build();

				mockKeys.list.mockResolvedValue(mockResponse);

				// Act
				const result = await keysService.getKeys({
					project_id: "test-project-123",
					filter_keys: ["cursor.filtered.key1"],
					filter_filenames: ["en.json", "de.json"],
					pagination: "cursor",
					limit: 100,
				});

				// Assert
				expect(result.items).toHaveLength(1);
				expect(mockKeys.list).toHaveBeenCalledWith({
					project_id: "test-project-123",
					filter_keys: "cursor.filtered.key1",
					filter_filenames: "en.json,de.json",
					limit: 100,
					pagination: "cursor",
				});
			});

			it("should include translations with pagination", async () => {
				// Arrange
				const mockBuilder = new KeysMockBuilder();
				const mockResponse = mockBuilder
					.withKey({ key_name: { web: "translated.key" }, key_id: 500 })
					.withTranslations([
						{ language_iso: "en", translation: "Hello" },
						{ language_iso: "de", translation: "Hallo" },
					])
					.withPagination(1, 10)
					.build();

				mockKeys.list.mockResolvedValue(mockResponse);

				// Act
				const result = await keysService.getKeys({
					project_id: "test-project-123",
					include_translations: true,
					page: 1,
					limit: 10,
					pagination: "offset",
				});

				// Assert
				expect(result.items).toHaveLength(1);
				expect(result.items[0].translations).toHaveLength(2);
				expect(mockKeys.list).toHaveBeenCalledWith({
					project_id: "test-project-123",
					include_translations: 1,
					page: 1,
					limit: 10,
					pagination: "offset",
				});
			});
		});

		describe("Edge Cases", () => {
			it("should handle switching between pagination modes", async () => {
				// First request with standard pagination
				const standardMockBuilder = new KeysMockBuilder();
				const standardResponse = standardMockBuilder
					.withKey({ key_name: { web: "standard.key" }, key_id: 1 })
					.withPagination(1, 50)
					.build();

				// Second request with cursor pagination
				const cursorMockBuilder = new KeysMockBuilder();
				const cursorResponse = cursorMockBuilder
					.withKey({ key_name: { web: "cursor.key" }, key_id: 2 })
					.withCursorPagination("switch-cursor", 50)
					.build();

				mockKeys.list
					.mockResolvedValueOnce(standardResponse)
					.mockResolvedValueOnce(cursorResponse);

				// Act
				const standardResult = await keysService.getKeys({
					project_id: "test-project-123",
					page: 1,
					limit: 50,
					pagination: "offset",
				});

				const cursorResult = await keysService.getKeys({
					project_id: "test-project-123",
					limit: 50,
					pagination: "cursor",
				});

				// Assert
				expect(standardResult.currentPage).toBe(1);
				expect(standardResult.nextCursor).toBeNull();

				expect(cursorResult.nextCursor).toBe("switch-cursor");
				expect(cursorResult.hasNextCursor?.()).toBe(true);
			});

			it("should handle single item result", async () => {
				// Arrange
				const mockBuilder = new KeysMockBuilder();
				const mockResponse = mockBuilder
					.withKey({ key_name: { web: "single.key" }, key_id: 999 })
					.withPagination(1, 100)
					.build();

				mockKeys.list.mockResolvedValue(mockResponse);

				// Act
				const result = await keysService.getKeys({
					project_id: "single-key-project",
					limit: 100,
				});

				// Assert
				expect(result.items).toHaveLength(1);
				expect(result.items[0].key_id).toBe(999);
			});

			it("should handle maximum limit boundaries", async () => {
				// Arrange
				const mockBuilder = new KeysMockBuilder();
				const mockResponse = mockBuilder
					.withKey({ key_name: { web: "max.limit.key" }, key_id: 1 })
					.withPagination(1, 5000) // Maximum allowed limit
					.build();

				mockKeys.list.mockResolvedValue(mockResponse);

				// Act
				const result = await keysService.getKeys({
					project_id: "max-limit-project",
					limit: 5000,
					pagination: "offset",
				});

				// Assert
				expect(result.resultsPerPage).toBe(5000);
				expect(mockKeys.list).toHaveBeenCalledWith({
					project_id: "max-limit-project",
					limit: 5000,
					pagination: "offset",
				});
			});

			it("should handle project not found during pagination", async () => {
				// Arrange
				const error = createNotFoundError("Project");
				// Set the code property as the service expects
				(error as ApiError).code = 404;

				mockKeys.list.mockRejectedValue(error);

				// Act & Assert
				await expect(
					keysService.getKeys({
						project_id: "non-existent-project",
						page: 1,
						limit: 100,
					}),
				).rejects.toThrow(McpError);

				try {
					await keysService.getKeys({
						project_id: "non-existent-project",
						page: 1,
						limit: 100,
					});
				} catch (err) {
					const mcpError = err as McpError;
					expect(mcpError.message).toContain("Project not found");
				}
			});

			it("should handle unauthorized access during pagination", async () => {
				// Arrange
				const error = createUnauthorizedError();
				// Set the code property as the service expects
				(error as ApiError).code = 401;

				mockKeys.list.mockRejectedValue(error);

				// Act & Assert
				await expect(
					keysService.getKeys({
						project_id: "protected-project",
						pagination: "cursor",
					}),
				).rejects.toThrow(McpError);

				try {
					await keysService.getKeys({
						project_id: "protected-project",
						pagination: "cursor",
					});
				} catch (err) {
					const mcpError = err as McpError;
					expect(mcpError.message).toContain("Invalid API key");
				}
			});
		});
	});
});
