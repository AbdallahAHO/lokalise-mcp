import { afterAll, beforeAll, describe, expect, it } from "vitest";
import type { PaginatedResult, Task, TaskDeleted } from "@lokalise/node-api";
import { generators } from "../../test-utils/fixture-helpers/generators.js";
import { TasksMockBuilder } from "../../test-utils/mock-builders/tasks.mock.js";
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
				if (args.length) {
					super(...args);
				} else {
					super(mockDate.getTime());
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

		it("should format tasks using mock builder", () => {
			// Using our new mock builder
			const mockBuilder = new TasksMockBuilder();
			const response = mockBuilder
				.withTask({
					task_id: generators.task.id(),
					title: generators.task.title(),
					description: generators.task.description(),
					status: "in_progress",
					progress: 45,
				})
				.withTask({
					task_id: generators.task.id(),
					title: `Urgent: ${generators.task.title()}`,
					status: "completed",
					progress: 100,
				})
				.withPagination(1, 100)
				.build();

			const result = formatTasksList(response, projectId);
			expect(result).toContain("2 tasks");
			expect(result).toContain("in_progress");
			expect(result).toContain("completed");
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
				due_date: "2019-04-29T22:00:00.000Z",
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

		it("should handle task generated with mock builder", () => {
			const mockBuilder = new TasksMockBuilder();
			const generatedTask = mockBuilder.withTask({
				task_id: generators.task.id(),
				title: generators.task.title(),
				description: "High priority translation task",
				status: "in_progress",
				progress: 75,
				keys_count: 50,
				words_count: 500,
				created_at: generators.timestamp().formatted,
				created_at_timestamp: generators.timestamp().timestamp,
			}).tasks[0];

			const result = formatTaskDetails(generatedTask, projectId);
			expect(result).toContain("High priority translation task");
			expect(result).toContain("75%");
			expect(result).toContain("Total Keys**: 50");
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

		it("should format task with language assignments using mock builder", () => {
			const mockBuilder = new TasksMockBuilder();
			const taskWithLanguages = mockBuilder
				.withTask({
					task_id: generators.task.id(),
					title: "Multi-language task",
				})
				.withLanguageAssignments(
					[
						{ user_id: generators.user.id(), email: generators.user.email() },
						{ user_id: generators.user.id(), email: generators.user.email() },
					],
					[
						{ language_iso: generators.languageCode(0), language_id: 1 },
						{ language_iso: generators.languageCode(1), language_id: 2 },
					],
				).tasks[0];

			const result = formatTaskDetails(taskWithLanguages, projectId);
			expect(result).toContain("Multi-language task");
			expect(result).toContain(generators.languageCode(0));
			expect(result).toContain(generators.languageCode(1));
		});

		it("should format schedule information correctly", () => {
			const result = formatTaskDetails(task, projectId);

			expect(result).toMatchSnapshot();
		});

		it("should handle overdue tasks", () => {
			const overdueTask: Task = {
				...task,
				due_date: "2019-04-29T22:00:00.000Z",
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

		it("should format created task with generated data", () => {
			const mockBuilder = new TasksMockBuilder();
			const newTask = mockBuilder.withTask({
				task_id: generators.task.id(),
				title: "New Translation Task",
				status: "new",
				created_at: generators.timestamp().formatted,
			}).tasks[0];

			const result = formatCreateTaskResult(newTask, projectId);
			expect(result).toContain("New Translation Task");
			expect(result.toLowerCase()).toContain("success");
		});

		it("should handle language coverage in created task", () => {
			const result = formatCreateTaskResult(createdTask, projectId);

			expect(result).toMatchSnapshot();
		});

		it("should suggest setting due date if not provided", () => {
			const taskNoDueDate: Task = {
				...createdTask,
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
		it("should use generated test data for edge cases", () => {
			const mockBuilder = new TasksMockBuilder();

			// Test with generated timestamps
			const taskWithGeneratedDate = mockBuilder.withTask({
				due_date: generators.timestamp(7).formatted,
				due_date_timestamp: generators.timestamp(7).timestamp,
			}).tasks[0];

			const result1 = formatTaskDetails(taskWithGeneratedDate, projectId);
			expect(result1).toContain("Due Date");

			// Test with generated IDs and emails
			const taskWithGeneratedUsers = mockBuilder.withTask({
				task_id: generators.task.id(),
				title: generators.task.title(),
				created_by: generators.user.id(),
				created_by_email: generators.user.email(),
			}).tasks[0];

			const result2 = formatTaskDetails(taskWithGeneratedUsers, projectId);
			expect(result2).toContain("Created By");
		});

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
			} as unknown as Task;

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
