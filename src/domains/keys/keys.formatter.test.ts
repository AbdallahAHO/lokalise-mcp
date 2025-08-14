import { afterAll, beforeAll, describe, expect, it } from "@jest/globals";
import type {
	BulkResult,
	Key,
	KeyDeleted,
	KeysBulkDeleted,
} from "@lokalise/node-api";
import {
	formatBulkDeleteKeysResult,
	formatBulkUpdateKeysResult,
	formatCreateKeysResult,
	formatDeleteKeyResult,
	formatKeyDetails,
	formatKeysList,
	formatUpdateKeyResult,
} from "./keys.formatter.js";

// Load fixtures
import {
	createMockCursorPaginatedResult,
	keyCreateFixture,
	keyDeleteFixture,
	keyRetrieveFixture,
	keysBulkDeleteFixture,
	keysBulkUpdateFixture,
	keysListFixture,
	keysCursorPaginationFixture,
	keyUpdateFixture,
} from "./__fixtures__/keys.fixtures.js";

describe("KeysFormatter", () => {
	// Mock Date to ensure consistent timestamps in snapshots
	const mockDate = new Date("2024-01-15T10:30:00.000Z");
	let originalDate: DateConstructor;

	beforeAll(() => {
		originalDate = global.Date;
		// Mock Date constructor and static methods
		global.Date = class extends originalDate {
			constructor(...args: ConstructorParameters<DateConstructor>) {
				if (args.length === 0) {
					super(mockDate.getTime());
				} else {
					super(...args);
				}
			}
			static now() {
				return mockDate.getTime();
			}
		} as DateConstructor;
		// Preserve original static methods
		global.Date.UTC = originalDate.UTC;
		global.Date.parse = originalDate.parse;
	});

	afterAll(() => {
		global.Date = originalDate;
	});
	const projectId = "803826145ba90b42d5d860.46800099";

	describe("formatKeysList", () => {
		it("should format a list of keys with standard pagination", () => {
			const response = createMockCursorPaginatedResult(keysListFixture);

			const result = formatKeysList(response, projectId);

			expect(result).toMatchSnapshot();
		});

		it("should format a list with cursor pagination", () => {
			const response = createMockCursorPaginatedResult(
				keysCursorPaginationFixture,
				{
					nextCursor: "eyIxIjo1MjcyNjU2MTd9",
				},
			);

			const result = formatKeysList(response, projectId);

			expect(result).toMatchSnapshot();
		});

		it("should handle empty key list", () => {
			const response = createMockCursorPaginatedResult([]);

			const result = formatKeysList(response, projectId);

			expect(result).toMatchSnapshot();
		});

		it("should format keys with translations", () => {
			const keyWithTranslations: Key = {
				...keysListFixture[0],
				translations: [
					{
						translation_id: 123,
						segment_number: 1,
						language_iso: "en",
						translation: "Hello World",
						modified_at: "2023-01-01",
						modified_at_timestamp: 1672531200,
						modified_by: 12345,
						modified_by_email: "user@example.com",
						is_reviewed: true,
						is_unverified: false,
						is_fuzzy: false,
						reviewed_by: 12345,
						words: 2,
						custom_translation_statuses: [],
						task_id: 0,
					},
					{
						translation_id: 124,
						segment_number: 1,
						language_iso: "fr",
						translation: "Bonjour le monde",
						modified_at: "2023-01-01",
						modified_at_timestamp: 1672531200,
						modified_by: 12345,
						modified_by_email: "user@example.com",
						is_reviewed: false,
						is_unverified: true,
						is_fuzzy: true,
						reviewed_by: 0,
						words: 3,
						custom_translation_statuses: [],
						task_id: 0,
					},
				],
			};

			const response = createMockCursorPaginatedResult([keyWithTranslations]);

			const result = formatKeysList(response, projectId);

			expect(result).toMatchSnapshot();
		});

		it("should handle keys with tags", () => {
			const keyWithTags: Key = {
				...keysListFixture[0],
				tags: ["urgent", "homepage", "marketing"],
			};

			const response = createMockCursorPaginatedResult([keyWithTags]);

			const result = formatKeysList(response, projectId);

			expect(result).toMatchSnapshot();
		});

		it("should format platform-specific key names", () => {
			const keyWithPlatforms: Key = {
				...keysListFixture[0],
				key_name: {
					ios: "ios.specific.key",
					android: "android.specific.key",
					web: "web.specific.key",
					other: "generic.key",
				},
				platforms: ["ios", "android", "web"],
			};

			const response = createMockCursorPaginatedResult([keyWithPlatforms]);

			const result = formatKeysList(response, projectId);

			expect(result).toMatchSnapshot();
		});
	});

	describe("formatKeyDetails", () => {
		const key = keyRetrieveFixture;

		it("should format detailed key information", () => {
			const result = formatKeyDetails(key, projectId);

			expect(result).toMatchSnapshot();
		});

		it("should format key with translations", () => {
			const keyWithTranslations: Key = {
				...key,
				translations: [
					{
						translation_id: 123,
						segment_number: 1,
						language_iso: "en",
						translation: "Test translation",
						modified_at: "2023-01-01",
						modified_at_timestamp: 1672531200,
						modified_by: 12345,
						modified_by_email: "user@example.com",
						is_reviewed: true,
						is_unverified: false,
						reviewed_by: 12345,
						words: 2,
						custom_translation_statuses: [],
						task_id: 0,
					},
				],
			};

			const result = formatKeyDetails(keyWithTranslations, projectId);

			expect(result).toMatchSnapshot();
		});

		it("should handle screenshots", () => {
			const keyWithScreenshots: Key = {
				...key,
				screenshots: [
					{
						screenshot_id: 123,
						title: "Homepage Screenshot",
						description: "Shows the key on homepage",
						screenshot_tags: ["homepage"],
						url: "https://example.com/screenshot.png",
						width: 1920,
						height: 1080,
						created_at: "2023-01-01",
						created_at_timestamp: 1672531200,
					},
				],
			};

			const result = formatKeyDetails(keyWithScreenshots, projectId);

			expect(result).toMatchSnapshot();
		});

		it("should handle comments", () => {
			const keyWithComments: Key = {
				...key,
				comments: [
					{
						comment_id: 456,
						comment: "This needs review",
						added_by: 123,
						added_by_email: "reviewer@example.com",
						added_at: "2023-01-01",
						added_at_timestamp: 1672531200,
					},
				],
			};

			const result = formatKeyDetails(keyWithComments, projectId);

			expect(result).toMatchSnapshot();
		});
	});

	describe("formatCreateKeysResult", () => {
		it("should format key creation result", () => {
			const result = formatCreateKeysResult(keyCreateFixture, projectId);

			expect(result).toMatchSnapshot();
		});

		it("should handle creation errors", () => {
			const resultWithErrors: BulkResult<Key> = {
				...keyCreateFixture,
				errors: [{ message: "Key already exists", code: 400 }],
			};

			const result = formatCreateKeysResult(resultWithErrors, projectId);

			expect(result).toMatchSnapshot();
		});

		it("should show next steps", () => {
			const result = formatCreateKeysResult(keyCreateFixture, projectId);

			expect(result).toMatchSnapshot();
		});
	});

	describe("formatUpdateKeyResult", () => {
		it("should format key update result", () => {
			const result = formatUpdateKeyResult(keyUpdateFixture, projectId);

			expect(result).toMatchSnapshot();
		});
	});

	describe("formatBulkUpdateKeysResult", () => {
		it("should format bulk update result", () => {
			const result = formatBulkUpdateKeysResult(
				keysBulkUpdateFixture,
				projectId,
			);

			expect(result).toMatchSnapshot();
		});

		it("should handle partial failures", () => {
			const bulkResult: BulkResult<Key> = {
				...keysBulkUpdateFixture,
				items: [keysBulkUpdateFixture.items[0]],
				errors: [{ message: "Key not found", code: 404 }],
			};

			const result = formatBulkUpdateKeysResult(bulkResult, projectId);

			expect(result).toMatchSnapshot();
		});
	});

	describe("formatDeleteKeyResult", () => {
		it("should format key deletion result", () => {
			const result = formatDeleteKeyResult(keyDeleteFixture, projectId, 12345);

			expect(result).toMatchSnapshot();
		});

		it("should handle locked keys", () => {
			const deleteResult: KeyDeleted = {
				project_id: projectId,
				key_removed: false,
			};

			const result = formatDeleteKeyResult(deleteResult, projectId, 12345);

			expect(result).toMatchSnapshot();
		});
	});

	describe("formatBulkDeleteKeysResult", () => {
		it("should format bulk deletion result", () => {
			const result = formatBulkDeleteKeysResult(
				keysBulkDeleteFixture,
				projectId,
				5,
			);

			expect(result).toMatchSnapshot();
		});

		it("should handle partial deletion with locked keys", () => {
			const partialResult: KeysBulkDeleted = {
				project_id: projectId,
				keys_removed: false,
				keys_locked: 2,
			};

			const result = formatBulkDeleteKeysResult(partialResult, projectId, 5);

			expect(result).toMatchSnapshot();
		});
	});

	describe("Edge Cases", () => {
		it("should handle null and undefined values gracefully", () => {
			const keyWithNulls: Key = {
				...keysListFixture[0],
				key_id: 123,
				key_name: {
					ios: "",
					android: "",
					web: "",
					other: "fallback.key",
				},
				description: null as string | null,
				platforms: null as string[] | null,
				tags: undefined as string[] | undefined,
				is_plural: null as boolean | null,
				base_words: null as number | null,
				char_limit: undefined as number | undefined,
			};

			const result = formatKeyDetails(keyWithNulls, projectId);

			expect(result).toMatchSnapshot();
		});

		it("should handle very long key names", () => {
			const longKeyName =
				"a.very.long.key.name.that.exceeds.normal.length.".repeat(10);
			const keyWithLongName: Key = {
				...keysListFixture[0],
				key_name: {
					web: longKeyName,
					ios: longKeyName,
					android: longKeyName,
					other: longKeyName,
				},
			};

			const response = createMockCursorPaginatedResult([keyWithLongName]);

			const result = formatKeysList(response, projectId);

			expect(result).toMatchSnapshot();
		});

		it("should handle special characters in translations", () => {
			const keyWithSpecialChars: Key = {
				...keyRetrieveFixture,
				translations: [
					{
						translation_id: 123,
						segment_number: 1,
						language_iso: "en",
						translation: "Hello <b>World</b> & \"friends\" with 'quotes'",
						modified_at: "2023-01-01",
						modified_at_timestamp: 1672531200,
						modified_by: 12345,
						modified_by_email: "user@example.com",
						is_reviewed: true,
						is_unverified: false,
						is_fuzzy: false,
						reviewed_by: 12345,
						words: 5,
						custom_translation_statuses: [],
						task_id: 0,
					},
				],
			};

			const result = formatKeyDetails(keyWithSpecialChars, projectId);

			expect(result).toMatchSnapshot();
		});
	});
});
