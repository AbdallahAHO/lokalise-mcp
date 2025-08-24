import { jest } from "@jest/globals";
import type { LokaliseApi } from "@lokalise/node-api";

export interface MockLokaliseApiOptions {
	failOnMethod?: string;
	errorCode?: number;
	errorMessage?: string;
	delay?: number;
}

export function createMockLokaliseApi(
	options: MockLokaliseApiOptions = {},
): jest.Mocked<LokaliseApi> {
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
		glossary: jest.fn(() => ({
			list: jest.fn(),
			get: jest.fn(),
			create: jest.fn(),
			update: jest.fn(),
			delete: jest.fn(),
		})),
	} as unknown;

	// Apply error simulation if specified
	if (options.failOnMethod) {
		const [domain, method] = options.failOnMethod.split(".");
		const apiAny = mockApi as Record<string, unknown>;
		if (apiAny[domain]) {
			const domainMock = (apiAny[domain] as () => Record<string, unknown>)();
			if (domainMock?.[method]) {
				const error = new Error(
					options.errorMessage || `API Error: ${options.errorCode || 500}`,
				);
				domainMock[method] = jest.fn(() => Promise.reject(error));
			}
		}
	}

	// Apply delay if specified
	if (options.delay) {
		const apiAny = mockApi as Record<string, () => Record<string, unknown>>;
		for (const domain of Object.keys(apiAny)) {
			const domainMethods = apiAny[domain]();
			for (const method of Object.keys(domainMethods)) {
				const original = domainMethods[method] as (
					...args: unknown[]
				) => unknown;
				domainMethods[method] = jest.fn(async (...args: unknown[]) => {
					await new Promise((resolve) => setTimeout(resolve, options.delay));
					return original(...args);
				});
			}
		}
	}

	return mockApi as unknown as jest.Mocked<LokaliseApi>;
}

// Helper function to create paginated responses
export function createPaginatedResponse<T>(
	items: T[],
	page = 1,
	limit = 100,
	total: number = items.length,
) {
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

// Helper function for cursor pagination
export function createCursorPaginatedResponse<T>(
	items: T[],
	nextCursor: string | null = null,
	limit = 100,
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
		prevPage: () => 0,
	};
}

// Mock bulk operation response
export function mockBulkOperation<T>(
	successItems: T[],
	failedItems: Array<{ item: unknown; error: string }>,
) {
	return {
		items: successItems,
		errors: failedItems.map((f) => ({
			...(typeof f.item === "object" && f.item !== null ? f.item : {}),
			error: { message: f.error },
		})),
	};
}
