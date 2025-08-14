import { afterAll, beforeAll, describe, expect, it } from "@jest/globals";
import type { PaginatedResult, Task, TaskDeleted } from "@lokalise/node-api";
import {
	taskCreateFixture,
	taskDeleteFixture,
	taskPaginationFixture,
	taskRetrieveFixture,
	tasksEmptyListFixture,
	tasksListFixture,
} from "./__fixtures__/tasks.fixtures.js";
import {
	formatCreateTaskResult,
	formatDeleteTaskResult,
	formatTaskDetails,
	formatTasksList,
	formatUpdateTaskResult,
} from "./tasks.formatter.js";

// Helper function to create a properly typed PaginatedResult
function createPaginatedResult<T>(
	items: T[],
	options: {
		totalResults?: number;
		totalPages?: number;
		resultsPerPage?: number;
		currentPage?: number;
		hasNext?: boolean;
		hasPrev?: boolean;
	} = {},
): PaginatedResult<T> {
	const {
		totalResults = items.length,
		totalPages = 1,
		resultsPerPage = 100,
		currentPage = 1,
		hasNext = false,
		hasPrev = false,
	} = options;

	return {
		items,
		totalResults,
		totalPages,
		resultsPerPage,
		currentPage,
		responseTooBig: false,
		hasNextPage: () => hasNext,
		hasPrevPage: () => hasPrev,
		isLastPage: () => !hasNext,
		isFirstPage: () => !hasPrev,
		nextPage: () => (hasNext ? currentPage + 1 : currentPage),
		prevPage: () => (hasPrev ? currentPage - 1 : currentPage),
	};
}

describe("TasksFormatter", () => {
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

	describe("formatTasksList", () => {
		it("should format a list of tasks with rich metadata", () => {
			const response = createPaginatedResult(tasksListFixture, {
				totalResults: 3,
				totalPages: 1,
				resultsPerPage: 500,
				currentPage: 1,
			});

			const result = formatTasksList(response, projectId);

			expect(result).toMatchSnapshot();
		});

		it("should handle empty task list", () => {
			const response = createPaginatedResult(tasksEmptyListFixture, {
				totalResults: 0,
				totalPages: 0,
				resultsPerPage: 100,
				currentPage: 1,
			});

			const result = formatTasksList(response, projectId);

			expect(result).toMatchSnapshot();
		});

		it("should handle pagination information", () => {
			const response = createPaginatedResult([taskPaginationFixture], {
				totalResults: 3,
				totalPages: 2,
				resultsPerPage: 2,
				currentPage: 2,
				hasNext: true,
				hasPrev: true,
			});

			const result = formatTasksList(response, projectId);

			expect(result).toMatchSnapshot();
		});

		it("should format task with language assignments correctly", () => {
			const response = createPaginatedResult([taskPaginationFixture], {
				totalResults: 1,
				totalPages: 1,
				resultsPerPage: 100,
				currentPage: 1,
			});

			const result = formatTasksList(response, projectId);

			expect(result).toMatchSnapshot();
		});

		it("should handle due dates and overdue status", () => {
			const overdueTask: Task = {
				...taskPaginationFixture,
				due_date: "2019-04-29 22:00:00 (Etc/UTC)",
				due_date_timestamp: 1556575200,
			};

			const response = createPaginatedResult([overdueTask], {
				totalResults: 1,
				totalPages: 1,
				resultsPerPage: 100,
				currentPage: 1,
			});

			const result = formatTasksList(response, projectId);

			expect(result).toMatchSnapshot();
		});
	});

	describe("formatTaskDetails", () => {
		const task = taskRetrieveFixture;

		it("should format detailed task information", () => {
			const result = formatTaskDetails(task, projectId);

			expect(result).toMatchSnapshot();
		});

		it("should handle tasks without languages", () => {
			const taskNoLang: Task = {
				...task,
				languages: [],
			};

			const result = formatTaskDetails(taskNoLang, projectId);

			expect(result).toMatchSnapshot();
		});

		it("should handle tasks with TM leverage data", () => {
			const result = formatTaskDetails(taskRetrieveFixture, projectId);

			expect(result).toMatchSnapshot();
		});

		it("should format schedule information correctly", () => {
			const result = formatTaskDetails(task, projectId);

			expect(result).toMatchSnapshot();
		});

		it("should handle overdue tasks", () => {
			const overdueTask: Task = {
				...task,
				due_date: "2019-04-29 22:00:00 (Etc/UTC)",
				due_date_timestamp: 1556575200,
			};

			const result = formatTaskDetails(overdueTask, projectId);

			expect(result).toMatchSnapshot();
		});
	});

	describe("formatCreateTaskResult", () => {
		const createdTask = taskCreateFixture;

		it("should format task creation result", () => {
			const result = formatCreateTaskResult(createdTask, projectId);

			expect(result).toMatchSnapshot();
		});

		it("should handle language coverage in created task", () => {
			const result = formatCreateTaskResult(createdTask, projectId);

			expect(result).toMatchSnapshot();
		});

		it("should suggest setting due date if not provided", () => {
			const taskNoDueDate: Task = {
				...createdTask,
				due_date: undefined,
				due_date_timestamp: undefined,
			};

			const result = formatCreateTaskResult(taskNoDueDate, projectId);

			expect(result).toMatchSnapshot();
		});

		it("should warn about approaching deadlines", () => {
			const tomorrow = new Date();
			tomorrow.setDate(tomorrow.getDate() + 1);

			const urgentTask: Task = {
				...createdTask,
				due_date: tomorrow.toISOString(),
				due_date_timestamp: Math.floor(tomorrow.getTime() / 1000),
			};

			const result = formatCreateTaskResult(urgentTask, projectId);

			expect(result).toMatchSnapshot();
		});
	});

	describe("formatUpdateTaskResult", () => {
		const updatedTask = taskRetrieveFixture;

		it("should format task update result", () => {
			const result = formatUpdateTaskResult(updatedTask, projectId);

			expect(result).toMatchSnapshot();
		});

		it("should handle completed status", () => {
			const completedTask: Task = {
				...updatedTask,
				status: "completed",
			};

			const result = formatUpdateTaskResult(completedTask, projectId);

			expect(result).toMatchSnapshot();
		});

		it("should handle closed status", () => {
			const closedTask: Task = {
				...updatedTask,
				status: "closed",
			};

			const result = formatUpdateTaskResult(closedTask, projectId);

			expect(result).toMatchSnapshot();
		});
	});

	describe("formatDeleteTaskResult", () => {
		const deleteResult = taskDeleteFixture;
		const taskId = 1927993;

		it("should format task deletion result", () => {
			const result = formatDeleteTaskResult(deleteResult, projectId, taskId);

			expect(result).toMatchSnapshot();
		});

		it("should handle false deletion result", () => {
			const failedDelete: TaskDeleted = {
				task_deleted: false,
				project_id: "test-project-id",
			};

			const result = formatDeleteTaskResult(failedDelete, projectId, taskId);

			expect(result).toMatchSnapshot();
		});
	});

	describe("Edge Cases", () => {
		it("should handle null and undefined values gracefully", () => {
			const taskWithNulls = {
				...taskRetrieveFixture,
				task_id: 123,
				title: "Null Test Task",
				description: "",
				due_date: null,
				due_date_timestamp: null,
				completed_at: null,
				completed_at_timestamp: null,
				completed_by: null,
				completed_by_email: null,
			} as Task;

			const result = formatTaskDetails(taskWithNulls, projectId);

			expect(result).toMatchSnapshot();
		});

		it("should handle invalid date formats", () => {
			const taskWithBadDate: Task = {
				...taskRetrieveFixture,
				due_date: "invalid-date-string",
				created_at: "not-a-date",
			};

			const result = formatTaskDetails(taskWithBadDate, projectId);

			expect(result).toMatchSnapshot();
		});

		it("should escape markdown special characters", () => {
			const taskWithSpecialChars: Task = {
				...taskRetrieveFixture,
				title: "Task with **markdown** and _underscores_",
				description: "Contains | pipes | and [links](http://example.com)",
			};

			const result = formatTaskDetails(taskWithSpecialChars, projectId);

			expect(result).toMatchSnapshot();
		});

		it("should handle very long content appropriately", () => {
			const longTitle = "A".repeat(1000);
			const taskWithLongContent: Task = {
				...taskRetrieveFixture,
				title: longTitle,
			};

			const response = createPaginatedResult([taskWithLongContent], {
				totalResults: 1,
				totalPages: 1,
				resultsPerPage: 100,
				currentPage: 1,
			});

			const result = formatTasksList(response, projectId);

			expect(result).toMatchSnapshot();
		});
	});
});
