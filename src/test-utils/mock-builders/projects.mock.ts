import type { PaginatedResult, Project } from "@lokalise/node-api";

export class ProjectsMockBuilder {
	public projects: Project[] = [];
	private totalCount = 0;
	private page = 1;
	private limit = 100;

	withProject(project: Partial<Project>): this {
		const defaultProject: Project = {
			project_id: project.project_id || "test_project_id",
			name: project.name || "Test Project",
			description: project.description || "",
			created_at: project.created_at || "2024-01-01 00:00:00 (Etc/UTC)",
			created_at_timestamp: project.created_at_timestamp || 1704067200,
			created_by: project.created_by || 12345,
			created_by_email: project.created_by_email || "test@example.com",
			team_id: project.team_id || 100,
			team_uuid: project.team_uuid || "test-team-uuid",
			base_language_id: project.base_language_id || 640,
			base_language_iso: project.base_language_iso || "en",
			project_type: project.project_type || "localization_files",
			settings: project.settings || ({} as Project["settings"]),
			statistics:
				project.statistics ||
				({
					progress_total: 0,
					keys_total: 0,
					team: 0,
					base_words: 0,
					qa_issues_total: 0,
					qa_issues: {} as Project["statistics"]["qa_issues"],
					languages: [],
				} as Project["statistics"]),
		};
		this.projects.push({ ...defaultProject, ...project });
		this.totalCount++;
		return this;
	}

	withPagination(page: number, limit: number): this {
		this.page = page;
		this.limit = limit;
		return this;
	}

	build(): PaginatedResult<Project> {
		const totalPages = Math.ceil(this.totalCount / this.limit);
		return {
			items: this.projects,
			totalResults: this.totalCount,
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
