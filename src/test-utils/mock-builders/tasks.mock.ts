import type { PaginatedResult, Task } from "@lokalise/node-api";
import { generators } from "../fixture-helpers/generators.js";

export class TasksMockBuilder {
	public tasks: Task[] = [];
	private page = 1;
	private limit = 100;
	private totalResults?: number;

	withTask(overrides: Partial<Task> = {}): this {
		const timestamp = generators.timestamp();
		const defaultTask: Task = {
			task_id: overrides.task_id ?? generators.task.id(),
			title: overrides.title ?? generators.task.title(),
			description: overrides.description ?? generators.task.description(),
			status: overrides.status ?? "in_progress",
			progress: overrides.progress ?? 0,
			due_date: overrides.due_date ?? "",
			due_date_timestamp: overrides.due_date_timestamp ?? 0,
			keys_count: overrides.keys_count ?? 10,
			words_count: overrides.words_count ?? 100,
			created_at: overrides.created_at ?? timestamp.formatted,
			created_at_timestamp:
				overrides.created_at_timestamp ?? timestamp.timestamp,
			created_by: overrides.created_by ?? generators.user.id(),
			created_by_email: overrides.created_by_email ?? generators.user.email(),
			can_be_parent: overrides.can_be_parent ?? false,
			task_type: overrides.task_type ?? "translation",
			parent_task_id: overrides.parent_task_id ?? 0,
			closing_tags: [],
			do_lock_translations: overrides.do_lock_translations ?? false,
			languages: overrides.languages ?? [],
			source_language_iso: overrides.source_language_iso ?? "en",
			auto_close_languages: overrides.auto_close_languages ?? true,
			auto_close_task: overrides.auto_close_task ?? true,
			auto_close_items: overrides.auto_close_items ?? true,
			completed_at: overrides.completed_at ?? "",
			completed_at_timestamp: overrides.completed_at_timestamp ?? 0,
			completed_by: overrides.completed_by ?? 0,
			completed_by_email: overrides.completed_by_email ?? "",
			custom_translation_status_ids:
				overrides.custom_translation_status_ids ?? [],
		};

		this.tasks.push({ ...defaultTask, ...overrides });
		return this;
	}

	withLanguageAssignments(
		_users: Array<{ user_id: number; email: string }>,
		_languages: Array<{ language_iso: string; language_id: number }>,
	): this {
		if (this.tasks.length === 0) {
			this.withTask();
		}

		const lastTask = this.tasks[this.tasks.length - 1];
		// Simplified language assignments - type incompatibilities with SDK
		(lastTask as unknown as { languages: unknown[] }).languages = [];

		return this;
	}

	withPagination(page: number, limit: number): this {
		this.page = page;
		this.limit = limit;
		return this;
	}

	setTotalResults(total: number): this {
		this.totalResults = total;
		return this;
	}

	build(): PaginatedResult<Task> {
		const total = this.totalResults ?? this.tasks.length;
		const totalPages = Math.ceil(total / this.limit);

		return {
			items: this.tasks,
			totalResults: total,
			totalPages,
			resultsPerPage: this.limit,
			currentPage: this.page,
			responseTooBig: false,
			hasNextPage: () => this.page < totalPages,
			hasPrevPage: () => this.page > 1,
			isFirstPage: () => this.page === 1,
			isLastPage: () => this.page === totalPages,
			nextPage: () => (this.page < totalPages ? this.page + 1 : this.page),
			prevPage: () => (this.page > 1 ? this.page - 1 : this.page),
		};
	}
}
