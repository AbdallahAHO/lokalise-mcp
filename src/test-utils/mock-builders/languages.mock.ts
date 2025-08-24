import type { Language, PaginatedResult } from "@lokalise/node-api";

export class LanguagesMockBuilder {
	private languages: Language[] = [];
	private totalCount = 0;
	private page = 1;
	private limit = 100;

	withLanguage(language: Partial<Language>): this {
		this.languages.push({
			lang_id: language.lang_id || 640,
			lang_iso: language.lang_iso || "en",
			lang_name: language.lang_name || "English",
			is_rtl: language.is_rtl || false,
			plural_forms: language.plural_forms || ["zero", "one", "other"],
			...language,
		} as Language);
		this.totalCount++;
		return this;
	}

	withPagination(page: number, limit: number): this {
		this.page = page;
		this.limit = limit;
		return this;
	}

	build(): PaginatedResult<Language> {
		return {
			items: this.languages,
			totalResults: this.totalCount,
			totalPages: Math.ceil(this.totalCount / this.limit),
			resultsPerPage: this.limit,
			currentPage: this.page,
			hasNextPage: () => this.page < Math.ceil(this.totalCount / this.limit),
			hasPrevPage: () => this.page > 1,
			nextPage: () => this.page + 1,
			prevPage: () => this.page - 1,
		} as PaginatedResult<Language>;
	}
}

export class SystemLanguagesMockBuilder {
	private languages: Language[] = [];
	private totalCount = 0;
	private page = 1;
	private limit = 100;

	withSystemLanguage(language: Partial<Language>): this {
		this.languages.push({
			lang_id: language.lang_id || 640,
			lang_iso: language.lang_iso || "en",
			lang_name: language.lang_name || "English",
			is_rtl: language.is_rtl || false,
			plural_forms: language.plural_forms || ["zero", "one", "other"],
			...language,
		} as Language);
		this.totalCount++;
		return this;
	}

	withPagination(page: number, limit: number): this {
		this.page = page;
		this.limit = limit;
		return this;
	}

	build(): PaginatedResult<Language> {
		return {
			items: this.languages,
			totalResults: this.totalCount,
			totalPages: Math.ceil(this.totalCount / this.limit),
			resultsPerPage: this.limit,
			currentPage: this.page,
			hasNextPage: () => this.page < Math.ceil(this.totalCount / this.limit),
			hasPrevPage: () => this.page > 1,
			nextPage: () => this.page + 1,
			prevPage: () => this.page - 1,
		} as PaginatedResult<Language>;
	}
}
