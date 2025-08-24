import type { BulkResult, Key, PaginatedResult } from "@lokalise/node-api";
import { generators } from "../fixture-helpers/generators.js";

export class KeysMockBuilder {
	public keys: Key[] = [];
	private totalCount = 0;
	private page = 1;
	private limit = 100;
	private nextCursor: string | null = null;
	private useCursor = false;

	withKey(overrides: Partial<Key> = {}): this {
		const timestamp = generators.timestamp();
		const keyName = generators.key.name();
		const defaultKey: Key = {
			key_id: overrides.key_id ?? generators.key.id(),
			created_at: overrides.created_at ?? timestamp.formatted,
			created_at_timestamp:
				overrides.created_at_timestamp ?? timestamp.timestamp,
			key_name: overrides.key_name ?? {
				ios: keyName.replace(/\./g, "_"),
				android: keyName.toLowerCase().replace(/\./g, "_"),
				web: keyName.toUpperCase().replace(/\./g, "_"),
				other: keyName,
			},
			filenames: overrides.filenames ?? {
				ios: "Localizable.strings",
				android: "strings.xml",
				web: "en.json",
				other: "translations.yml",
			},
			description: overrides.description ?? "",
			platforms: overrides.platforms ?? ["web"],
			tags: overrides.tags ?? [],
			comments: overrides.comments ?? [],
			screenshots: overrides.screenshots ?? [],
			translations: overrides.translations ?? [],
			is_plural: overrides.is_plural ?? false,
			plural_name: overrides.plural_name ?? "",
			is_hidden: overrides.is_hidden ?? false,
			is_archived: overrides.is_archived ?? false,
			context: overrides.context ?? "",
			base_words: overrides.base_words ?? 5,
			char_limit: overrides.char_limit ?? 0,
			custom_attributes: overrides.custom_attributes ?? "",
			modified_at: overrides.modified_at ?? timestamp.formatted,
			modified_at_timestamp:
				overrides.modified_at_timestamp ?? timestamp.timestamp,
			translations_modified_at:
				overrides.translations_modified_at ?? timestamp.formatted,
			translations_modified_at_timestamp:
				overrides.translations_modified_at_timestamp ?? timestamp.timestamp,
		};

		this.keys.push({ ...defaultKey, ...overrides });
		this.totalCount++;
		return this;
	}

	withTranslations(
		translations: Array<{
			language_iso: string;
			translation: string;
			is_reviewed?: boolean;
			is_fuzzy?: boolean;
		}>,
	): this {
		if (this.keys.length === 0) {
			this.withKey();
		}

		const lastKey = this.keys[this.keys.length - 1];
		lastKey.translations = translations.map((t) => ({
			translation_id: 100000000 + Math.floor(Math.random() * 900000000),
			key_id: lastKey.key_id,
			language_iso: t.language_iso,
			translation: t.translation,
			modified_at: generators.timestamp().formatted,
			modified_at_timestamp: generators.timestamp().timestamp,
			modified_by: generators.user.id(),
			modified_by_email: generators.user.email(),
			is_reviewed: t.is_reviewed ?? false,
			reviewed_by: t.is_reviewed ? generators.user.id() : 0,
			is_unverified: false,
			is_fuzzy: t.is_fuzzy ?? false,
			words: t.translation.split(" ").length,
			custom_translation_statuses: [],
			task_id: 0,
			segment_number: 1,
		}));

		return this;
	}

	withPagination(page: number, limit: number): this {
		this.page = page;
		this.limit = limit;
		this.useCursor = false;
		return this;
	}

	withCursorPagination(nextCursor: string | null, limit: number): this {
		this.nextCursor = nextCursor;
		this.limit = limit;
		this.useCursor = true;
		return this;
	}

	build(): PaginatedResult<Key> & {
		nextCursor?: string | null;
		hasNextCursor?: () => boolean;
	} {
		if (this.useCursor) {
			return {
				items: this.keys,
				totalResults: 0,
				totalPages: 0,
				resultsPerPage: this.limit,
				currentPage: 0,
				nextCursor: this.nextCursor,
				hasNextCursor: () => this.nextCursor !== null,
				hasNextPage: () => false,
				hasPrevPage: () => false,
				isFirstPage: () => true,
				isLastPage: () => this.nextCursor === null,
				nextPage: () => 0,
				prevPage: () => 0,
			} as PaginatedResult<Key> & {
				nextCursor?: string | null;
				hasNextCursor?: () => boolean;
			};
		}

		const totalPages = Math.ceil(this.totalCount / this.limit);
		return {
			items: this.keys,
			totalResults: this.totalCount,
			totalPages,
			resultsPerPage: this.limit,
			currentPage: this.page,
			hasNextPage: () => this.page < totalPages,
			hasPrevPage: () => this.page > 1,
			isFirstPage: () => this.page === 1,
			isLastPage: () => this.page === totalPages,
			nextPage: () => (this.page < totalPages ? this.page + 1 : this.page),
			prevPage: () => (this.page > 1 ? this.page - 1 : this.page),
			// Add cursor methods even for standard pagination
			nextCursor: null,
			hasNextCursor: () => false,
		} as PaginatedResult<Key> & {
			nextCursor?: string | null;
			hasNextCursor?: () => boolean;
		};
	}

	buildBulkResult(
		errors: Array<{ key: unknown; message: string }> = [],
	): BulkResult<Key> {
		return {
			items: this.keys,
			errors: errors.map((e) => {
				const baseObj =
					typeof e.key === "object" && e.key !== null ? e.key : {};
				return {
					...baseObj,
					message: e.message,
					code: 400,
				};
			}),
		} as unknown as BulkResult<Key>;
	}
}
