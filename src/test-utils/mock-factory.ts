import { vi } from "vitest";

export interface MockLokaliseApiOptions {
	failOnMethod?: string;
	errorCode?: number;
	errorMessage?: string;
	delay?: number;
}

interface MockLokaliseApi {
	projects: () => {
		list: ReturnType<typeof vi.fn>;
		get: ReturnType<typeof vi.fn>;
		create: ReturnType<typeof vi.fn>;
		update: ReturnType<typeof vi.fn>;
		delete: ReturnType<typeof vi.fn>;
		empty: ReturnType<typeof vi.fn>;
	};
	keys: () => {
		list: ReturnType<typeof vi.fn>;
		get: ReturnType<typeof vi.fn>;
		create: ReturnType<typeof vi.fn>;
		update: ReturnType<typeof vi.fn>;
		bulk_update: ReturnType<typeof vi.fn>;
		delete: ReturnType<typeof vi.fn>;
		bulk_delete: ReturnType<typeof vi.fn>;
	};
	languages: () => {
		system_languages: ReturnType<typeof vi.fn>;
		list: ReturnType<typeof vi.fn>;
		get: ReturnType<typeof vi.fn>;
		create: ReturnType<typeof vi.fn>;
		update: ReturnType<typeof vi.fn>;
		delete: ReturnType<typeof vi.fn>;
	};
	tasks: () => ReturnType<typeof vi.fn> &
		Record<string, ReturnType<typeof vi.fn>>;
	comments: () => ReturnType<typeof vi.fn> &
		Record<string, ReturnType<typeof vi.fn>>;
	translations: () => ReturnType<typeof vi.fn> &
		Record<string, ReturnType<typeof vi.fn>>;
	contributors: () => ReturnType<typeof vi.fn> &
		Record<string, ReturnType<typeof vi.fn>>;
	glossary: () => ReturnType<typeof vi.fn> &
		Record<string, ReturnType<typeof vi.fn>>;
}

export function createMockLokaliseApi(
	options: MockLokaliseApiOptions = {},
): MockLokaliseApi {
	// Create mock methods once and reuse them
	const projectsMock = {
		list: vi.fn(),
		get: vi.fn(),
		create: vi.fn(),
		update: vi.fn(),
		delete: vi.fn(),
		empty: vi.fn(),
	};

	const keysMock = {
		list: vi.fn(),
		get: vi.fn(),
		create: vi.fn(),
		update: vi.fn(),
		bulk_update: vi.fn(),
		delete: vi.fn(),
		bulk_delete: vi.fn(),
	};

	const languagesMock = {
		system_languages: vi.fn(),
		list: vi.fn(),
		get: vi.fn(),
		create: vi.fn(),
		update: vi.fn(),
		delete: vi.fn(),
	};

	const tasksMock = {
		list: vi.fn(),
		get: vi.fn(),
		create: vi.fn(),
		update: vi.fn(),
		delete: vi.fn(),
	};

	const commentsMock = {
		list_project_comments: vi.fn(),
		list_key_comments: vi.fn(),
		get: vi.fn(),
		create: vi.fn(),
		delete: vi.fn(),
	};

	const translationsMock = {
		list: vi.fn(),
		get: vi.fn(),
		update: vi.fn(),
	};

	const contributorsMock = {
		list: vi.fn(),
		get: vi.fn(),
		create: vi.fn(),
		update: vi.fn(),
		delete: vi.fn(),
	};

	const glossaryMock = {
		list: vi.fn(),
		get: vi.fn(),
		create: vi.fn(),
		update: vi.fn(),
		delete: vi.fn(),
	};

	const mockApi = {
		projects: vi.fn(() => projectsMock),
		keys: vi.fn(() => keysMock),
		languages: vi.fn(() => languagesMock),
		tasks: vi.fn(() => tasksMock),
		comments: vi.fn(() => commentsMock),
		translations: vi.fn(() => translationsMock),
		contributors: vi.fn(() => contributorsMock),
		glossary: vi.fn(() => glossaryMock),
	} as unknown as MockLokaliseApi;

	// Apply error simulation if specified
	if (options.failOnMethod) {
		const [domain, method] = options.failOnMethod.split(".");
		const apiAny = mockApi as unknown as Record<string, unknown>;
		if (apiAny[domain]) {
			const domainMock = (apiAny[domain] as () => Record<string, unknown>)();
			if (domainMock?.[method]) {
				const error = new Error(
					options.errorMessage || `API Error: ${options.errorCode || 500}`,
				);
				domainMock[method] = vi.fn(() => Promise.reject(error));
			}
		}
	}

	// Apply delay if specified
	if (options.delay) {
		const apiAny = mockApi as unknown as Record<
			string,
			() => Record<string, unknown>
		>;
		for (const domain of Object.keys(apiAny)) {
			const domainMethods = apiAny[domain]();
			for (const method of Object.keys(domainMethods)) {
				const original = domainMethods[method] as (
					...args: unknown[]
				) => unknown;
				domainMethods[method] = vi.fn(async (...args: unknown[]) => {
					await new Promise((resolve) => setTimeout(resolve, options.delay));
					return original(...args);
				});
			}
		}
	}

	return mockApi;
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
