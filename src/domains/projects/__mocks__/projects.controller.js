import { vi } from "vitest";

export default {
	listProjects: vi.fn(),
	getProjectDetails: vi.fn(),
	createProject: vi.fn(),
	updateProject: vi.fn(),
	deleteProject: vi.fn(),
	emptyProject: vi.fn(),
};
