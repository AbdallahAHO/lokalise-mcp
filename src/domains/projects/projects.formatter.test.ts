import { afterAll, beforeAll, describe, expect, it } from "@jest/globals";
import type { Project } from "@lokalise/node-api";
import { generators } from "../../test-utils/fixture-helpers/generators.js";
import { ProjectsMockBuilder } from "../../test-utils/mock-builders/projects.mock.js";
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

		it("should format projects using mock builder", () => {
			// Using our new mock builder
			const mockBuilder = new ProjectsMockBuilder();
			const projects = [
				mockBuilder.withProject({
					project_id: generators.id.project(1),
					name: generators.projectName(0),
					created_at: generators.timestamp(5).formatted,
				}).projects[0],
				mockBuilder.withProject({
					project_id: generators.id.project(2),
					name: generators.projectName(1),
					created_at: generators.timestamp(10).formatted,
				}).projects[1],
			];

			const result = formatProjectsList(projects);
			expect(result).toContain(generators.projectName(0));
			expect(result).toContain(generators.projectName(1));
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

		it("should handle project generated with mock builder", () => {
			const mockBuilder = new ProjectsMockBuilder();
			const project = mockBuilder.withProject({
				project_id: generators.id.project(1),
				name: generators.projectName(0),
				description: "Test project description",
				created_at: generators.timestamp().formatted,
				created_at_timestamp: generators.timestamp().timestamp,
				base_language_iso: generators.languageCode(0),
			}).projects[0];

			const result = formatProjectDetails(project);
			expect(result).toContain(generators.projectName(0));
			expect(result).toContain("Test project description");
			expect(result).toContain(generators.languageCode(0));
		});
	});

	describe("formatCreateProjectResult", () => {
		it("should format project creation result", () => {
			const result = formatCreateProjectResult(projectCreateFixture);
			expect(result).toMatchSnapshot();
		});

		it("should format created project with generated data", () => {
			const mockBuilder = new ProjectsMockBuilder();
			const createdProject = mockBuilder.withProject({
				project_id: generators.id.project(1),
				name: "New Project",
				created_at: generators.timestamp().formatted,
			}).projects[0];

			const result = formatCreateProjectResult(createdProject);
			expect(result).toContain("New Project");
			expect(result.toLowerCase()).toContain("success");
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
			const result = formatDeleteProjectResult("test-project-id");
			expect(result).toMatchSnapshot();
		});

		it("should handle failed deletion", () => {
			// Note: The formatter doesn't actually use the delete result
			// It only shows a success message based on the projectId
			const result = formatDeleteProjectResult("test-project");
			expect(result).toMatchSnapshot();
		});
	});

	describe("formatEmptyProjectResult", () => {
		it("should format project empty result", () => {
			const result = formatEmptyProjectResult("test-project-id");
			expect(result).toMatchSnapshot();
		});

		it("should handle large number of deleted keys", () => {
			// Note: The formatter doesn't actually use the empty result
			// It only shows a success message based on the projectId
			const result = formatEmptyProjectResult("test-project");
			expect(result).toMatchSnapshot();
		});
	});

	describe("Edge Cases", () => {
		it("should handle null and undefined values gracefully", () => {
			const projectWithNulls = {
				project_id: "test-id",
				name: null,
				description: undefined,
				project_type: "",
				created_at: null,
				created_by: null,
				created_by_email: undefined,
				team_id: null,
				base_language_id: null,
				base_language_iso: "",
				settings: null,
				statistics: undefined,
				created_at_timestamp: 0,
			} as unknown as Project;

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
			const projectWithBadDate = {
				...projectRetrieveFixture,
				created_at: "invalid-date-string",
				created_at_timestamp: null,
			} as unknown as Project;

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

		it("should use generated test data for edge cases", () => {
			// Test with generated timestamps
			const mockBuilder1 = new ProjectsMockBuilder();
			const projectWithGeneratedDate = mockBuilder1.withProject({
				created_at: generators.timestamp(30).formatted,
				created_at_timestamp: generators.timestamp(30).timestamp,
			}).projects[0];

			const result1 = formatProjectDetails(projectWithGeneratedDate);
			expect(result1).toContain("Created");

			// Test with generated IDs - use a new builder instance
			const mockBuilder2 = new ProjectsMockBuilder();
			const projectWithGeneratedId = mockBuilder2.withProject({
				project_id: generators.id.project(999),
				name: generators.projectName(5),
			}).projects[0];

			const result2 = formatProjectDetails(projectWithGeneratedId);
			expect(result2).toContain(generators.projectName(5));
		});
	});
});
