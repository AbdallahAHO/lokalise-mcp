import { TextDecoder, TextEncoder } from "node:util";
import { afterAll, afterEach, beforeAll, beforeEach, expect, vi } from "vitest";

if (typeof global.TextEncoder === "undefined") {
	// Polyfill for TextEncoder/TextDecoder if not available
	(global as unknown as { TextEncoder: typeof TextEncoder }).TextEncoder =
		TextEncoder;
	(global as unknown as { TextDecoder: typeof TextDecoder }).TextDecoder =
		TextDecoder;
}

// Set test environment variables
process.env.NODE_ENV = "test";
process.env.TZ = "UTC";

// Mock console methods to reduce test output noise
const originalConsole = {
	log: console.log,
	error: console.error,
	warn: console.warn,
	info: console.info,
	debug: console.debug,
};

// Restore console for debugging when needed
export function restoreConsole() {
	console.log = originalConsole.log;
	console.error = originalConsole.error;
	console.warn = originalConsole.warn;
	console.info = originalConsole.info;
	console.debug = originalConsole.debug;
}

// Suppress console output in tests by default
beforeAll(() => {
	console.log = vi.fn();
	console.error = vi.fn();
	console.warn = vi.fn();
	console.info = vi.fn();
	console.debug = vi.fn();
});

// Clear all mocks after each test
afterEach(() => {
	vi.clearAllMocks();
});

// Restore console after all tests
afterAll(() => {
	restoreConsole();
});

// Custom matchers
expect.extend({
	toBeValidLokaliseId(received: unknown) {
		const pass =
			typeof received === "string" &&
			/^[a-f0-9]{8,}(\.[a-f0-9]+)?$/i.test(received);
		return {
			pass,
			message: () =>
				pass
					? `expected ${received} not to be a valid Lokalise ID`
					: `expected ${received} to be a valid Lokalise ID`,
		};
	},

	toBeISODate(received: unknown) {
		const pass =
			typeof received === "string" &&
			/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2} \(Etc\/UTC\)$/.test(received);
		return {
			pass,
			message: () =>
				pass
					? `expected ${received} not to be a valid ISO date`
					: `expected ${received} to be a valid ISO date in format "YYYY-MM-DD HH:mm:ss (Etc/UTC)"`,
		};
	},

	toHavePaginationMethods(received: unknown) {
		const expectedMethods = [
			"hasNextPage",
			"hasPrevPage",
			"nextPage",
			"prevPage",
		];
		const hasMethods = expectedMethods.every(
			(method) =>
				typeof (received as Record<string, unknown>)?.[method] === "function",
		);
		return {
			pass: hasMethods,
			message: () =>
				hasMethods
					? "expected object not to have pagination methods"
					: `expected object to have pagination methods: ${expectedMethods.join(
							", ",
						)}`,
		};
	},

	toHaveCursorPagination(received: unknown) {
		const hasNextCursor =
			received && typeof received === "object" && "nextCursor" in received;
		const hasMethod =
			typeof (received as Record<string, unknown>)?.hasNextCursor ===
			"function";
		const pass = !!(hasNextCursor && hasMethod);
		return {
			pass,
			message: () =>
				pass
					? "expected object not to have cursor pagination"
					: "expected object to have cursor pagination with nextCursor and hasNextCursor()",
		};
	},

	toBeWithinRange(received: number, floor: number, ceiling: number) {
		const pass = received >= floor && received <= ceiling;
		return {
			pass,
			message: () =>
				pass
					? `expected ${received} not to be within range ${floor} - ${ceiling}`
					: `expected ${received} to be within range ${floor} - ${ceiling}`,
		};
	},
});

// Extend Vitest matchers TypeScript definitions
declare module "vitest" {
	interface Assertion {
		toBeValidLokaliseId(): void;
		toBeISODate(): void;
		toHavePaginationMethods(): void;
		toHaveCursorPagination(): void;
		toBeWithinRange(floor: number, ceiling: number): void;
	}
	interface AsymmetricMatchersContaining {
		toBeValidLokaliseId(): unknown;
		toBeISODate(): unknown;
		toHavePaginationMethods(): unknown;
		toHaveCursorPagination(): unknown;
		toBeWithinRange(floor: number, ceiling: number): unknown;
	}
}

// Helper to create mock timers
export function useMockTimers() {
	beforeEach(() => {
		vi.useFakeTimers();
	});

	afterEach(() => {
		vi.useRealTimers();
	});

	return {
		advanceTime: (ms: number) => vi.advanceTimersByTime(ms),
		runAllTimers: () => vi.runAllTimers(),
		runOnlyPendingTimers: () => vi.runOnlyPendingTimers(),
	};
}

// Helper to mock environment variables
export function mockEnv(variables: Record<string, string>) {
	const original = { ...process.env };

	beforeEach(() => {
		for (const [key, value] of Object.entries(variables)) {
			process.env[key] = value;
		}
	});

	afterEach(() => {
		// Restore original env
		for (const key of Object.keys(variables)) {
			if (original[key] !== undefined) {
				process.env[key] = original[key];
			} else {
				delete process.env[key];
			}
		}
	});
}

// Helper to capture console output
export function captureConsole() {
	const captured = {
		log: [] as unknown[],
		error: [] as unknown[],
		warn: [] as unknown[],
		info: [] as unknown[],
		debug: [] as unknown[],
	};

	beforeEach(() => {
		console.log = vi.fn((...args) => captured.log.push(args));
		console.error = vi.fn((...args) => captured.error.push(args));
		console.warn = vi.fn((...args) => captured.warn.push(args));
		console.info = vi.fn((...args) => captured.info.push(args));
		console.debug = vi.fn((...args) => captured.debug.push(args));
	});

	return captured;
}

// Export test utilities
export { vi };

// Create Jest compatibility layer
export const jest = vi;
