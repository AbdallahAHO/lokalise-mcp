import { afterAll, beforeAll, describe, expect, it } from "@jest/globals";
import type {
	Project,
	ProjectDeleted,
	ProjectEmptied,
} from "@lokalise/node-api";
import {
	formatCreateProjectResult,
	formatDeleteProjectResult,
	formatEmptyProjectResult,
	formatProjectDetails,
	formatProjectsList,
	formatUpdateProjectResult,
} from "./projects.formatter.js";
import {
	projectCreateFixture,
	projectDeleteFixture,
	projectEmptyFixture,
	projectPaginationFixture,
	projectRetrieveFixture,
	projectUpdateFixture,
	projectsEmptyListFixture,
	projectsListFixture,
} from "./__fixtures__/projects.fixtures.js";

describe("ProjectsFormatter", () => {
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
	describe("formatProjectsList", () => {
		it("should format a list of projects with statistics", () => {
			const result = formatProjectsList(projectsListFixture, true);
			expect(result).toMatchSnapshot();
		});

		it("should handle project with statistics", () => {
			const result = formatProjectsList([projectPaginationFixture], true);
			expect(result).toMatchSnapshot();
		});

		it("should handle empty project list", () => {
			const result = formatProjectsList(projectsEmptyListFixture);
			expect(result).toMatchSnapshot();
		});

		it("should handle multiple projects", () => {
			const result = formatProjectsList(projectsListFixture);
			expect(result).toMatchSnapshot();
		});
	});

	describe("formatProjectDetails", () => {
		it("should format detailed project information", () => {
			const result = formatProjectDetails(projectRetrieveFixture);
			expect(result).toMatchSnapshot();
		});

		it("should format project with statistics", () => {
			const result = formatProjectDetails(projectPaginationFixture);
			expect(result).toMatchSnapshot();
		});

		it("should handle project without statistics", () => {
			const projectNoStats: Project = {
				...projectRetrieveFixture,
				statistics: undefined,
			};

			const result = formatProjectDetails(projectNoStats);
			expect(result).toMatchSnapshot();
		});

		it("should format branch information", () => {
			const projectWithBranch: Project = {
				...projectRetrieveFixture,
				branch: "feature-branch",
			};

			const result = formatProjectDetails(projectWithBranch);
			expect(result).toMatchSnapshot();
		});
	});

	describe("formatCreateProjectResult", () => {
		it("should format project creation result", () => {
			const result = formatCreateProjectResult(projectCreateFixture);
			expect(result).toMatchSnapshot();
		});
	});

	describe("formatUpdateProjectResult", () => {
		it("should format project update result", () => {
			const result = formatUpdateProjectResult(projectUpdateFixture);
			expect(result).toMatchSnapshot();
		});

		it("should include current statistics if available", () => {
			const result = formatUpdateProjectResult(projectPaginationFixture);
			expect(result).toMatchSnapshot();
		});
	});

	describe("formatDeleteProjectResult", () => {
		it("should format project deletion result", () => {
			const result = formatDeleteProjectResult(
				projectDeleteFixture,
				"test-project-id",
			);
			expect(result).toMatchSnapshot();
		});

		it("should handle failed deletion", () => {
			const failedDelete: ProjectDeleted = {
				project_deleted: false,
				project_id: "test-project-id",
			};

			const result = formatDeleteProjectResult(failedDelete, "test-project");
			expect(result).toMatchSnapshot();
		});
	});

	describe("formatEmptyProjectResult", () => {
		it("should format project empty result", () => {
			const result = formatEmptyProjectResult(
				projectEmptyFixture,
				"test-project-id",
			);
			expect(result).toMatchSnapshot();
		});

		it("should handle large number of deleted keys", () => {
			const largeEmpty: ProjectEmptied = {
				project_emptied: true,
				keys_deleted: 10000,
			};

			const result = formatEmptyProjectResult(largeEmpty, "test-project");
			expect(result).toMatchSnapshot();
		});
	});

	describe("Edge Cases", () => {
		it("should handle null and undefined values gracefully", () => {
			const projectWithNulls: Project = {
				project_id: "test-id",
				name: null as string | null,
				description: undefined as string | undefined,
				project_type: "",
				created_at: null as string | null,
				created_by: null as number | null,
				created_by_email: undefined as string | undefined,
				team_id: null as number | null,
				base_language_id: null as number | null,
				base_language_iso: "",
				settings: null as Project["settings"] | null,
				statistics: undefined,
				created_at_timestamp: 0,
			} as Project;

			const result = formatProjectDetails(projectWithNulls);
			expect(result).toMatchSnapshot();
		});

		it("should handle very long project names", () => {
			const longName = "Very Long Project Name ".repeat(20);
			const projectWithLongName: Project = {
				...projectsListFixture[0],
				name: longName,
			};

			const result = formatProjectsList([projectWithLongName]);
			expect(result).toMatchSnapshot();
		});

		it("should handle projects with zero statistics", () => {
			const projectZeroStats: Project = {
				...projectRetrieveFixture,
				statistics: {
					progress_total: 0,
					keys_total: 0,
					team: 0,
					base_words: 0,
					qa_issues_total: 0,
					qa_issues: {
						not_reviewed: 0,
						unverified: 0,
						spelling_grammar: 0,
						inconsistent_placeholders: 0,
						inconsistent_html: 0,
						different_number_of_urls: 0,
						different_urls: 0,
						leading_whitespace: 0,
						trailing_whitespace: 0,
						different_number_of_email_address: 0,
						different_email_address: 0,
						different_brackets: 0,
						different_numbers: 0,
						double_space: 0,
						special_placeholder: 0,
						unbalanced_brackets: 0,
					},
					languages: [],
				},
			};

			const result = formatProjectDetails(projectZeroStats);
			expect(result).toMatchSnapshot();
		});

		it("should handle invalid date formats", () => {
			const projectWithBadDate: Project = {
				...projectRetrieveFixture,
				created_at: "invalid-date-string",
				created_at_timestamp: null as number | null,
			};

			const result = formatProjectDetails(projectWithBadDate);
			expect(result).toMatchSnapshot();
		});

		it("should handle special characters in project names", () => {
			const projectWithSpecialChars: Project = {
				...projectRetrieveFixture,
				name: "Project with **markdown** & <html> tags",
				description: "Contains | pipes | and [links](http://example.com)",
			};

			const result = formatProjectDetails(projectWithSpecialChars);
			expect(result).toMatchSnapshot();
		});
	});
});
