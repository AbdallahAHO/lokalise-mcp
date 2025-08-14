import type {
	BulkResult,
	CursorPaginatedResult,
	Key,
	KeyDeleted,
	KeysBulkDeleted,
	PaginatedResult,
} from "@lokalise/node-api";

/**
 * Test fixtures for Keys domain
 * These are TypeScript objects based on actual API responses
 */

// Helper to create a base key object with default values
const createBaseKey = (overrides: Partial<Key> = {}): Key =>
	({
		key_id: 0,
		created_at: "",
		created_at_timestamp: 0,
		key_name: {
			ios: "",
			android: "",
			web: "",
			other: "",
		},
		filenames: {
			ios: "",
			android: "",
			web: "",
			other: "",
		},
		description: "",
		platforms: [],
		tags: [],
		is_plural: false,
		plural_name: "",
		is_hidden: false,
		is_archived: false,
		context: "",
		base_words: 0,
		char_limit: 0,
		custom_attributes: "",
		comments: [],
		...overrides,
	}) as Key;

// Helper to create a base key with translations object
const createBaseKeyWithTranslations = (overrides: Partial<Key> = {}): Key => ({
	...createBaseKey(),
	comments: [],
	screenshots: [],
	translations: [],
	modified_at: "",
	modified_at_timestamp: 0,
	translations_modified_at: "",
	translations_modified_at_timestamp: 0,
	...overrides,
});

// List fixture - multiple keys (from list.json)
export const keysListFixture: Key[] = [
	createBaseKey({
		key_id: 15519786,
		created_at: "2018-12-09 18:39:20 (Etc/UTC)",
		created_at_timestamp: 1544380760,
		key_name: {
			ios: "another_k",
			android: "another_k",
			web: "another_k",
			other: "another_k",
		},
		filenames: {
			ios: "",
			android: "",
			web: "",
			other: "",
		},
		description: "",
		platforms: ["ios"],
		tags: [],
		is_plural: false,
		plural_name: "",
		is_hidden: false,
		is_archived: false,
		context: "",
		base_words: 3,
		char_limit: 0,
		custom_attributes: "",
	}),
	createBaseKey({
		key_id: 15571975,
		created_at: "2018-12-10 17:35:34 (Etc/UTC)",
		created_at_timestamp: 1544463334,
		key_name: {
			ios: "rspec k",
			android: "rspec k",
			web: "rspec k",
			other: "rspec k",
		},
		filenames: {
			ios: "",
			android: "",
			web: "",
			other: "",
		},
		description: "My description",
		platforms: ["web"],
		tags: [],
		is_plural: false,
		plural_name: "",
		is_hidden: false,
		is_archived: false,
		context: "",
		base_words: 5,
		char_limit: 0,
		custom_attributes: "",
	}),
];

// Cursor pagination fixture (from list_cursor_pagination.json)
export const keysCursorPaginationFixture: Key[] = [
	createBaseKey({
		key_id: 15519786,
		created_at: "2018-12-09 18:39:20 (Etc/UTC)",
		created_at_timestamp: 1544380760,
		key_name: {
			ios: "another_k",
			android: "another_k",
			web: "another_k",
			other: "another_k",
		},
		filenames: {
			ios: "",
			android: "",
			web: "",
			other: "",
		},
		description: "",
		platforms: ["ios"],
		tags: [],
		is_plural: false,
		plural_name: "",
		is_hidden: false,
		is_archived: false,
		context: "",
		base_words: 3,
		char_limit: 0,
		custom_attributes: "",
	}),
	createBaseKey({
		key_id: 15571975,
		created_at: "2018-12-10 17:35:34 (Etc/UTC)",
		created_at_timestamp: 1544463334,
		key_name: {
			ios: "rspec k",
			android: "rspec k",
			web: "rspec k",
			other: "rspec k",
		},
		filenames: {
			ios: "",
			android: "",
			web: "",
			other: "",
		},
		description: "My description",
		platforms: ["web"],
		tags: [],
		is_plural: false,
		plural_name: "",
		is_hidden: false,
		is_archived: false,
		context: "",
		base_words: 5,
		char_limit: 0,
		custom_attributes: "",
	}),
];

// Retrieve fixture - single key with full details (from retrieve.json)
export const keyRetrieveFixture: Key = createBaseKeyWithTranslations({
	key_id: 74189435,
	created_at: "2021-01-29 17:34:16 (Etc/UTC)",
	created_at_timestamp: 1611941656,
	key_name: {
		ios: "callback",
		android: "callback",
		web: "callback",
		other: "callback",
	},
	filenames: {
		ios: "",
		android: "",
		web: "",
		other: "",
	},
	description: "",
	platforms: ["web"],
	tags: [],
	comments: [
		{
			comment_id: 20421626,
			key_id: 74189435,
			comment: "Single",
			added_by: 20181,
			added_by_email: "bodrovis@protonmail.com",
			added_at: "2023-09-19 13:26:15 (Etc/UTC)",
			added_at_timestamp: 1695129975,
		},
	],
	screenshots: [],
	translations: [
		{
			translation_id: 527556580,
			segment_number: 1,
			key_id: 74189435,
			language_iso: "ru",
			translation: "",
			modified_by: 20181,
			modified_by_email: "bodrovis@protonmail.com",
			modified_at: "2021-01-29 17:34:16 (Etc/UTC)",
			modified_at_timestamp: 1611941656,
			is_reviewed: false,
			reviewed_by: 0,
			is_unverified: true,
			is_fuzzy: true,
			words: 0,
			custom_translation_statuses: [],
			task_id: null,
		},
	],
	is_plural: false,
	plural_name: "",
	is_hidden: false,
	is_archived: false,
	context: "",
	base_words: 5,
	char_limit: 0,
	custom_attributes: "",
	modified_at: "2023-09-19 13:26:15 (Etc/UTC)",
	modified_at_timestamp: 1695129975,
	translations_modified_at: "2021-07-27 10:42:09 (Etc/UTC)",
	translations_modified_at_timestamp: 1627382529,
});

// Create fixture - BulkResult for key creation (from create.json)
export const keyCreateFixture: BulkResult<Key> = {
	items: [
		createBaseKeyWithTranslations({
			key_id: 378217831,
			created_at: "2023-09-21 12:18:47 (Etc/UTC)",
			created_at_timestamp: 1695298727,
			key_name: {
				ios: "welcome_web_new",
				android: "welcome_web_new",
				web: "welcome_web_new",
				other: "welcome_web_new",
			},
			filenames: {
				ios: "",
				android: "",
				web: "my_filename.json",
				other: "",
			},
			description: "Index app welcome",
			platforms: ["web"],
			tags: [],
			comments: [],
			screenshots: [],
			translations: [
				{
					translation_id: 3047612639,
					segment_number: 1,
					key_id: 378217831,
					language_iso: "en",
					translation: "Welcome",
					modified_by: 20181,
					modified_by_email: "bodrovis@protonmail.com",
					modified_at: "2023-09-21 12:18:47 (Etc/UTC)",
					modified_at_timestamp: 1695298727,
					is_reviewed: false,
					reviewed_by: 0,
					is_unverified: false,
					is_fuzzy: false,
					words: 1,
					custom_translation_statuses: [],
					task_id: null,
				},
				{
					translation_id: 3047612635,
					segment_number: 1,
					key_id: 378217831,
					language_iso: "ar_001",
					translation: "",
					modified_by: 20181,
					modified_by_email: "bodrovis@protonmail.com",
					modified_at: "2023-09-21 12:18:47 (Etc/UTC)",
					modified_at_timestamp: 1695298727,
					is_reviewed: false,
					reviewed_by: 0,
					is_unverified: true,
					is_fuzzy: true,
					words: 0,
					custom_translation_statuses: [],
					task_id: null,
				},
				{
					translation_id: 3047612636,
					segment_number: 1,
					key_id: 378217831,
					language_iso: "sq",
					translation: "",
					modified_by: 20181,
					modified_by_email: "bodrovis@protonmail.com",
					modified_at: "2023-09-21 12:18:47 (Etc/UTC)",
					modified_at_timestamp: 1695298727,
					is_reviewed: false,
					reviewed_by: 0,
					is_unverified: true,
					is_fuzzy: true,
					words: 0,
					custom_translation_statuses: [],
					task_id: null,
				},
			],
			is_plural: false,
			plural_name: "",
			is_hidden: false,
			is_archived: false,
			context: "",
			base_words: 1,
			char_limit: 0,
			custom_attributes: "",
			modified_at: "2023-09-21 12:18:47 (Etc/UTC)",
			modified_at_timestamp: 1695298727,
			translations_modified_at: "2023-09-21 12:18:47 (Etc/UTC)",
			translations_modified_at_timestamp: 1695298727,
		}),
		createBaseKeyWithTranslations({
			key_id: 378217832,
			created_at: "2023-09-21 12:18:47 (Etc/UTC)",
			created_at_timestamp: 1695298727,
			key_name: {
				ios: "welcome_ios_new",
				android: "welcome_ios_new",
				web: "welcome_ios_new",
				other: "welcome_ios_new",
			},
			filenames: {
				ios: "",
				android: "",
				web: "",
				other: "",
			},
			description: "Welcome apple",
			platforms: ["ios"],
			tags: [],
			comments: [],
			screenshots: [],
			translations: [
				{
					translation_id: 3047612640,
					segment_number: 1,
					key_id: 378217832,
					language_iso: "en",
					translation:
						'{"one":"I have one apple","other":"I have a lot of apples"}',
					modified_by: 20181,
					modified_by_email: "bodrovis@protonmail.com",
					modified_at: "2023-09-21 12:18:47 (Etc/UTC)",
					modified_at_timestamp: 1695298727,
					is_reviewed: false,
					reviewed_by: 0,
					is_unverified: false,
					is_fuzzy: false,
					words: 10,
					custom_translation_statuses: [],
					task_id: null,
				},
				{
					translation_id: 3047612637,
					segment_number: 1,
					key_id: 378217832,
					language_iso: "ar_001",
					translation:
						'{"zero":"","one":"","two":"","few":"","many":"","other":""}',
					modified_by: 20181,
					modified_by_email: "bodrovis@protonmail.com",
					modified_at: "2023-09-21 12:18:47 (Etc/UTC)",
					modified_at_timestamp: 1695298727,
					is_reviewed: false,
					reviewed_by: 0,
					is_unverified: true,
					is_fuzzy: true,
					words: 0,
					custom_translation_statuses: [],
					task_id: null,
				},
				{
					translation_id: 3047612638,
					segment_number: 1,
					key_id: 378217832,
					language_iso: "sq",
					translation: '{"one":"","other":""}',
					modified_by: 20181,
					modified_by_email: "bodrovis@protonmail.com",
					modified_at: "2023-09-21 12:18:47 (Etc/UTC)",
					modified_at_timestamp: 1695298727,
					is_reviewed: false,
					reviewed_by: 0,
					is_unverified: true,
					is_fuzzy: true,
					words: 0,
					custom_translation_statuses: [],
					task_id: null,
				},
			],
			is_plural: true,
			plural_name: "",
			is_hidden: false,
			is_archived: false,
			context: "",
			base_words: 10,
			char_limit: 0,
			custom_attributes: "",
			modified_at: "2023-09-21 12:18:47 (Etc/UTC)",
			modified_at_timestamp: 1695298727,
			translations_modified_at: "2023-09-21 12:18:47 (Etc/UTC)",
			translations_modified_at_timestamp: 1695298727,
		}),
	],
	errors: [],
};

// Update fixture - single key for update operations
export const keyUpdateFixture: Key = createBaseKey({
	key_id: 378217831,
	created_at: "2023-09-21 12:18:47 (Etc/UTC)",
	created_at_timestamp: 1695298727,
	key_name: {
		ios: "welcome_web_updated",
		android: "welcome_web_updated",
		web: "welcome_web_updated",
		other: "welcome_web_updated",
	},
	filenames: {
		ios: "",
		android: "",
		web: "my_filename.json",
		other: "",
	},
	description: "Updated description for welcome key",
	platforms: ["web", "ios"],
	tags: ["updated", "welcome"],
	is_plural: false,
	plural_name: "",
	is_hidden: false,
	is_archived: false,
	context: "",
	base_words: 1,
	char_limit: 0,
	custom_attributes: "",
});

// Delete fixture - single key deletion result
export const keyDeleteFixture: KeyDeleted = {
	project_id: "803826145ba90b42d5d860.46800099",
	key_removed: true,
};

// Bulk delete fixture - multiple keys deletion result
export const keysBulkDeleteFixture: KeysBulkDeleted = {
	project_id: "803826145ba90b42d5d860.46800099",
	keys_removed: true,
	keys_locked: 0,
};

// Bulk update fixture - BulkResult for key updates
export const keysBulkUpdateFixture: BulkResult<Key> = {
	items: [
		createBaseKey({
			key_id: 378217831,
			created_at: "2023-09-21 12:18:47 (Etc/UTC)",
			created_at_timestamp: 1695298727,
			key_name: {
				ios: "welcome_web_bulk_updated",
				android: "welcome_web_bulk_updated",
				web: "welcome_web_bulk_updated",
				other: "welcome_web_bulk_updated",
			},
			filenames: {
				ios: "",
				android: "",
				web: "my_filename.json",
				other: "",
			},
			description: "Bulk updated description",
			platforms: ["web", "android"],
			tags: ["bulk-updated"],
			is_plural: false,
			plural_name: "",
			is_hidden: false,
			is_archived: false,
			context: "",
			base_words: 1,
			char_limit: 0,
			custom_attributes: "",
		}),
		createBaseKey({
			key_id: 378217832,
			created_at: "2023-09-21 12:18:47 (Etc/UTC)",
			created_at_timestamp: 1695298727,
			key_name: {
				ios: "welcome_ios_bulk_updated",
				android: "welcome_ios_bulk_updated",
				web: "welcome_ios_bulk_updated",
				other: "welcome_ios_bulk_updated",
			},
			filenames: {
				ios: "",
				android: "",
				web: "",
				other: "",
			},
			description: "Bulk updated iOS key",
			platforms: ["ios", "web"],
			tags: ["bulk-updated", "ios"],
			is_plural: true,
			plural_name: "",
			is_hidden: false,
			is_archived: false,
			context: "",
			base_words: 10,
			char_limit: 0,
			custom_attributes: "",
		}),
	],
	errors: [],
};

// Helper function to create mock PaginatedResult
export const createMockPaginatedResult = <T>(
	items: T[],
	options: {
		totalResults?: number;
		totalPages?: number;
		currentPage?: number;
		resultsPerPage?: number;
	} = {},
): PaginatedResult<T> => {
	const {
		totalResults = items.length,
		totalPages = 1,
		currentPage = 1,
		resultsPerPage = items.length,
	} = options;

	return {
		items,
		totalResults,
		totalPages,
		currentPage,
		resultsPerPage,
		hasNextPage: () => currentPage < totalPages,
		hasPrevPage: () => currentPage > 1,
		responseTooBig: false,
		isLastPage: () => currentPage >= totalPages,
		isFirstPage: () => currentPage <= 1,
		nextPage: () => (currentPage < totalPages ? currentPage + 1 : currentPage),
		prevPage: () => (currentPage > 1 ? currentPage - 1 : currentPage),
	};
};

// Helper function to create mock CursorPaginatedResult
export const createMockCursorPaginatedResult = <T>(
	items: T[],
	options: {
		nextCursor?: string;
		prevCursor?: string;
	} = {},
): CursorPaginatedResult<T> => {
	const { nextCursor, prevCursor } = options;

	return {
		items,
		nextCursor: nextCursor ?? null,
		hasNextCursor: () => !!nextCursor,
		hasPrevCursor: () => !!prevCursor,
	};
};
