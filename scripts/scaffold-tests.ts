#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import chalk from "chalk";
import { program } from "commander";
import inquirer from "inquirer";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

interface TestConfig {
	domain: string;
	layer: "service" | "controller" | "tool" | "resource" | "cli" | "formatter";
	includePerformance: boolean;
	includeMocks: boolean;
	includeIntegration: boolean;
}

class TestScaffolder {
	private config: TestConfig = {
		domain: "",
		layer: "service",
		includePerformance: false,
		includeMocks: true,
		includeIntegration: false,
	};

	async run(options?: Partial<TestConfig>) {
		if (options && Object.keys(options).length > 0) {
			// CLI mode
			this.config = { ...this.config, ...options };
			await this.generateTests();
		} else {
			// Interactive mode
			await this.runInteractive();
		}
	}

	private async runInteractive() {
		console.log(chalk.cyan.bold("\n🧪 Test Scaffolding Wizard\n"));

		const answers = await inquirer.prompt([
			{
				type: "input",
				name: "domain",
				message: "Domain name (e.g., projects, keys):",
				validate: (input) => {
					if (!input) return "Domain name is required";
					const domainPath = path.join(
						__dirname,
						"..",
						"src",
						"domains",
						input,
					);
					if (!fs.existsSync(domainPath)) {
						return `Domain '${input}' does not exist`;
					}
					return true;
				},
			},
			{
				type: "list",
				name: "layer",
				message: "Which layer to test?",
				choices: [
					{ name: "Service (API calls)", value: "service" },
					{ name: "Controller (business logic)", value: "controller" },
					{ name: "Tool (MCP tools)", value: "tool" },
					{ name: "Resource (MCP resources)", value: "resource" },
					{ name: "CLI (command line)", value: "cli" },
					{ name: "Formatter (output formatting)", value: "formatter" },
				],
			},
			{
				type: "confirm",
				name: "includeMocks",
				message: "Include mock setup?",
				default: true,
			},
			{
				type: "confirm",
				name: "includePerformance",
				message: "Include performance tests?",
				default: false,
			},
			{
				type: "confirm",
				name: "includeIntegration",
				message: "Include integration tests?",
				default: false,
			},
		]);

		this.config = answers;
		await this.generateTests();
	}

	private async generateTests() {
		const { domain, layer } = this.config;
		const testFilePath = path.join(
			__dirname,
			"..",
			"src",
			"domains",
			domain,
			`${domain}.${layer}.test.ts`,
		);

		if (fs.existsSync(testFilePath)) {
			const { overwrite } = await inquirer.prompt([
				{
					type: "confirm",
					name: "overwrite",
					message: "Test file already exists. Overwrite?",
					default: false,
				},
			]);

			if (!overwrite) {
				console.log(chalk.yellow("Test generation cancelled."));
				return;
			}
		}

		const template = this.generateTemplate();
		fs.writeFileSync(testFilePath, template);

		console.log(chalk.green(`\n✅ Test file created: ${testFilePath}`));
		console.log(chalk.gray("\nNext steps:"));
		console.log(chalk.gray("1. Review and customize the generated tests"));
		console.log(
			chalk.gray(`2. Run tests: npm test -- ${domain}.${layer}.test.ts`),
		);
		console.log(chalk.gray("3. Check coverage: npm run test:coverage"));
	}

	private generateTemplate(): string {
		const {
			domain,
			layer,
			includePerformance,
			includeMocks,
			includeIntegration,
		} = this.config;

		const domainCapitalized = domain.charAt(0).toUpperCase() + domain.slice(1);
		const layerCapitalized = layer.charAt(0).toUpperCase() + layer.slice(1);

		let template = "";

		// Generate based on layer type
		switch (layer) {
			case "service":
				template = this.generateServiceTemplate(
					domain,
					domainCapitalized,
					includeMocks,
					includePerformance,
					includeIntegration,
				);
				break;
			case "controller":
				template = this.generateControllerTemplate(
					domain,
					domainCapitalized,
					includeMocks,
				);
				break;
			case "tool":
				template = this.generateToolTemplate(domain, domainCapitalized);
				break;
			case "resource":
				template = this.generateResourceTemplate(domain, domainCapitalized);
				break;
			case "cli":
				template = this.generateCliTemplate(domain, domainCapitalized);
				break;
			case "formatter":
				template = this.generateFormatterTemplate(domain, domainCapitalized);
				break;
			default:
				template = this.generateGenericTemplate(
					domain,
					domainCapitalized,
					layerCapitalized,
				);
		}

		return template;
	}

	private generateServiceTemplate(
		domain: string,
		domainCap: string,
		includeMocks: boolean,
		includePerformance: boolean,
		includeIntegration: boolean,
	): string {
		return `import { describe, it, expect, beforeEach, jest } from "@jest/globals";
import { ${domainCap}Service } from "./${domain}.service.js";
${
	includeMocks
		? `import { createMockLokaliseApi } from "../../test-utils/mock-factory.js";
import { ${domainCap}MockBuilder } from "../../test-utils/mock-builders/${domain}.mock.js";
import { ApiErrorSimulator } from "../../test-utils/error-simulator.js";`
		: ""
}
${
	includePerformance
		? `import { measurePerformance, testBulkPerformance } from "../../test-utils/performance.util.js";`
		: ""
}
import type { LokaliseApi } from "@lokalise/node-api";

describe("${domainCap}Service", () => {
	let service: ${domainCap}Service;
	${includeMocks ? "let mockApi: ReturnType<typeof createMockLokaliseApi>;" : ""}

	beforeEach(() => {
		${
			includeMocks
				? `mockApi = createMockLokaliseApi();
		service = new ${domainCap}Service();
		(service as unknown).lokaliseApi = mockApi;`
				: `service = new ${domainCap}Service();`
		}
	});

	describe("list${domainCap}", () => {
		it("should successfully list ${domain} with pagination", async () => {
			${
				includeMocks
					? `// Arrange
			const mockResponse = new ${domainCap}MockBuilder()
				.withPagination(1, 10)
				.build();

			mockApi.${domain}().list.mockResolvedValue(mockResponse);

			// Act
			const result = await service.list${domainCap}({ page: 1, limit: 10 });

			// Assert
			expect(result).toBeDefined();
			expect(mockApi.${domain}().list).toHaveBeenCalledWith({ page: 1, limit: 10 });`
					: "// TODO: Implement test"
			}
		});

		it("should handle empty results", async () => {
			${
				includeMocks
					? `// Arrange
			const mockResponse = new ${domainCap}MockBuilder()
				.withPagination(1, 10)
				.build();
			mockResponse.items = [];

			mockApi.${domain}().list.mockResolvedValue(mockResponse);

			// Act
			const result = await service.list${domainCap}({ page: 1, limit: 10 });

			// Assert
			expect(result.items).toHaveLength(0);`
					: "// TODO: Implement test"
			}
		});

		it("should handle API errors gracefully", async () => {
			${
				includeMocks
					? `// Arrange
			mockApi.${domain}().list.mockRejectedValue(
				ApiErrorSimulator.unauthorized()
			);

			// Act & Assert
			await expect(service.list${domainCap}({}))
				.rejects.toThrow("Invalid API token");`
					: "// TODO: Implement test"
			}
		});

		${
			includePerformance
				? `it("should handle large datasets efficiently", async () => {
			const { metrics } = await measurePerformance(
				async () => {
					const mockResponse = new ${domainCap}MockBuilder();
					for (let i = 0; i < 1000; i++) {
						mockResponse.with${domainCap.slice(0, -1)}({ /* data */ });
					}
					mockApi.${domain}().list.mockResolvedValue(mockResponse.build());
					return await service.list${domainCap}({ limit: 1000 });
				},
				"List 1000 ${domain}"
			);

			expect(metrics.duration).toBeLessThan(1000); // Should complete within 1 second
			expect(metrics.memoryDelta).toBeLessThan(50 * 1024 * 1024); // Less than 50MB
		});`
				: ""
		}
	});

	describe("get${domainCap.slice(0, -1)}", () => {
		it("should fetch a single ${domain.slice(0, -1)} by ID", async () => {
			${
				includeMocks
					? `// Arrange
			const mock${domainCap.slice(0, -1)} = { /* mock data */ };
			mockApi.${domain}().get.mockResolvedValue(mock${domainCap.slice(0, -1)});

			// Act
			const result = await service.get${domainCap.slice(0, -1)}("test_id");

			// Assert
			expect(result).toEqual(mock${domainCap.slice(0, -1)});
			expect(mockApi.${domain}().get).toHaveBeenCalledWith("test_id");`
					: "// TODO: Implement test"
			}
		});

		it("should handle not found errors", async () => {
			${
				includeMocks
					? `// Arrange
			mockApi.${domain}().get.mockRejectedValue(
				ApiErrorSimulator.notFound("${domainCap.slice(0, -1)}")
			);

			// Act & Assert
			await expect(service.get${domainCap.slice(0, -1)}("invalid_id"))
				.rejects.toThrow("not found");`
					: "// TODO: Implement test"
			}
		});
	});

	${
		includeIntegration
			? `describe("Integration Tests", () => {
		it("should handle full CRUD workflow", async () => {
			// TODO: Implement integration test
			// 1. Create
			// 2. Read
			// 3. Update
			// 4. Delete
		});
	});`
			: ""
	}
});`;
	}

	private generateControllerTemplate(
		domain: string,
		domainCap: string,
		_includeMocks: boolean,
	): string {
		return `import { describe, it, expect, beforeEach, jest } from "@jest/globals";
import { ${domain}Controller } from "./${domain}.controller.js";
import { ${domainCap}Service } from "./${domain}.service.js";
import { McpError } from "../../shared/utils/error.util.js";

jest.mock("./${domain}.service.js");

describe("${domainCap}Controller", () => {
	let controller: typeof ${domain}Controller;
	let mockService: jest.Mocked<${domainCap}Service>;

	beforeEach(() => {
		jest.clearAllMocks();
		mockService = new ${domainCap}Service() as jest.Mocked<${domainCap}Service>;
		controller = ${domain}Controller;
	});

	describe("list${domainCap}", () => {
		it("should validate input parameters", async () => {
			// Test with invalid parameters
			await expect(controller.list${domainCap}({
				page: -1,
				limit: 0
			})).rejects.toThrow(McpError);
		});

		it("should format response correctly", async () => {
			// Arrange
			const mockData = { items: [], totalResults: 0 };
			mockService.list${domainCap}.mockResolvedValue(mockData);

			// Act
			const result = await controller.list${domainCap}({});

			// Assert
			expect(result).toHaveProperty("content");
			expect(result).toHaveProperty("data");
			expect(result.data).toEqual(mockData);
		});

		it("should handle service errors", async () => {
			// Arrange
			mockService.list${domainCap}.mockRejectedValue(
				new Error("Service error")
			);

			// Act & Assert
			await expect(controller.list${domainCap}({}))
				.rejects.toThrow("Service error");
		});
	});
});`;
	}

	private generateToolTemplate(domain: string, domainCap: string): string {
		return `import { describe, it, expect, beforeEach, jest } from "@jest/globals";
import { ${domain}Tool } from "./${domain}.tool.js";
import { ${domain}Controller } from "./${domain}.controller.js";
import { Server } from "@modelcontextprotocol/sdk/server/index.js";

jest.mock("./${domain}.controller.js");

describe("${domainCap}Tool", () => {
	let mockServer: unknown;

	beforeEach(() => {
		jest.clearAllMocks();
		mockServer = {
			tool: jest.fn(),
		};
	});

	describe("registerTools", () => {
		it("should register all ${domain} tools", () => {
			// Act
			${domain}Tool.registerTools(mockServer);

			// Assert
			expect(mockServer.tool).toHaveBeenCalled();
			const calls = mockServer.tool.mock.calls;

			// Verify tool names
			const toolNames = calls.map((call: unknown) => call[0]);
			expect(toolNames).toContain("lokalise_list_${domain}");
			expect(toolNames).toContain("lokalise_get_${domain.slice(0, -1)}");
		});

		it("should handle tool execution", async () => {
			// Register tools
			${domain}Tool.registerTools(mockServer);

			// Get the list handler
			const listHandler = mockServer.tool.mock.calls
				.find((call: unknown) => call[0] === "lokalise_list_${domain}")[3];

			// Mock controller response
			(${domain}Controller.list${domainCap} as jest.Mock).mockResolvedValue({
				content: "Mocked response",
				data: { items: [] }
			});

			// Execute handler
			const result = await listHandler({ page: 1, limit: 10 });

			// Assert
			expect(result).toHaveProperty("content");
			expect(${domain}Controller.list${domainCap}).toHaveBeenCalledWith({
				page: 1,
				limit: 10
			});
		});
	});

	describe("getMeta", () => {
		it("should return domain metadata", () => {
			const meta = ${domain}Tool.getMeta();

			expect(meta).toHaveProperty("name", "${domain}");
			expect(meta).toHaveProperty("description");
			expect(meta).toHaveProperty("toolsCount");
			expect(meta.toolsCount).toBeGreaterThan(0);
		});
	});
});`;
	}

	private generateResourceTemplate(domain: string, domainCap: string): string {
		return `import { describe, it, expect, beforeEach, jest } from "@jest/globals";
import { ${domain}Resource } from "./${domain}.resource.js";
import { ${domain}Controller } from "./${domain}.controller.js";
import { Server } from "@modelcontextprotocol/sdk/server/index.js";

jest.mock("./${domain}.controller.js");

describe("${domainCap}Resource", () => {
	let mockServer: unknown;

	beforeEach(() => {
		jest.clearAllMocks();
		mockServer = {
			resource: jest.fn(),
		};
	});

	describe("registerResources", () => {
		it("should register all ${domain} resources", () => {
			// Act
			${domain}Resource.registerResources(mockServer);

			// Assert
			expect(mockServer.resource).toHaveBeenCalled();
			const calls = mockServer.resource.mock.calls;

			// Verify resource names
			const resourceNames = calls.map((call: unknown) => call[0]);
			expect(resourceNames.length).toBeGreaterThan(0);
		});

		it("should handle resource URI parsing", async () => {
			// Register resources
			${domain}Resource.registerResources(mockServer);

			// Get the first resource handler
			const handler = mockServer.resource.mock.calls[0][2];

			// Test URI parsing
			const uri = "lokalise://${domain}/test_project?page=1&limit=10";

			// Mock controller response
			(${domain}Controller.list${domainCap} as jest.Mock).mockResolvedValue({
				content: "Resource content",
				data: { items: [] }
			});

			// Execute handler
			const result = await handler({ uri });

			// Assert
			expect(result).toHaveProperty("text");
		});
	});

	describe("getMeta", () => {
		it("should return resource metadata", () => {
			const meta = ${domain}Resource.getMeta();

			expect(meta).toHaveProperty("name", "${domain}");
			expect(meta).toHaveProperty("description");
			expect(meta).toHaveProperty("resourcesCount");
			expect(meta.resourcesCount).toBeGreaterThan(0);
		});
	});
});`;
	}

	private generateCliTemplate(domain: string, domainCap: string): string {
		return `import { describe, it, expect, beforeEach, jest } from "@jest/globals";
import { ${domain}Cli } from "./${domain}.cli.js";
import { ${domain}Controller } from "./${domain}.controller.js";
import { Command } from "commander";

jest.mock("./${domain}.controller.js");

describe("${domainCap}Cli", () => {
	let program: Command;

	beforeEach(() => {
		jest.clearAllMocks();
		program = new Command();
		program.exitOverride(); // Prevent process.exit in tests
	});

	describe("register", () => {
		it("should register all ${domain} CLI commands", () => {
			// Act
			${domain}Cli.register(program);

			// Assert
			const commands = program.commands.map(cmd => cmd.name());
			expect(commands).toContain("list-${domain}");
			expect(commands.length).toBeGreaterThan(0);
		});

		it("should execute list command", async () => {
			// Register commands
			${domain}Cli.register(program);

			// Mock controller
			(${domain}Controller.list${domainCap} as jest.Mock).mockResolvedValue({
				content: "CLI output",
				data: { items: [] }
			});

			// Spy on console.log
			const consoleSpy = jest.spyOn(console, "log").mockImplementation();

			// Execute command
			await program.parseAsync(["node", "test", "list-${domain}", "--page", "1"]);

			// Assert
			expect(${domain}Controller.list${domainCap}).toHaveBeenCalled();
			expect(consoleSpy).toHaveBeenCalledWith("CLI output");

			consoleSpy.mockRestore();
		});
	});

	describe("getMeta", () => {
		it("should return CLI metadata", () => {
			const meta = ${domain}Cli.getMeta();

			expect(meta).toHaveProperty("name", "${domain}");
			expect(meta).toHaveProperty("description");
			expect(meta).toHaveProperty("cliCommandsCount");
			expect(meta.cliCommandsCount).toBeGreaterThan(0);
		});
	});
});`;
	}

	private generateFormatterTemplate(domain: string, domainCap: string): string {
		return `import { describe, it, expect } from "@jest/globals";
import * as formatter from "./${domain}.formatter.js";
import { generators } from "../../test-utils/fixture-helpers/generators.js";

describe("${domainCap}Formatter", () => {
	describe("format${domainCap}List", () => {
		it("should format empty list", () => {
			const result = formatter.format${domainCap}List([]);

			expect(result).toContain("No ${domain} found");
		});

		it("should format single item", () => {
			const item = {
				// Add mock ${domain.slice(0, -1)} properties
				id: "test_id",
				name: "Test ${domainCap.slice(0, -1)}"
			};

			const result = formatter.format${domainCap}List([item]);

			expect(result).toContain("Test ${domainCap.slice(0, -1)}");
			expect(result).toContain("test_id");
		});

		it("should format multiple items", () => {
			const items = Array.from({ length: 5 }, (_, i) => ({
				id: \`test_id_\${i}\`,
				name: \`${domainCap.slice(0, -1)} \${i}\`
			}));

			const result = formatter.format${domainCap}List(items);

			expect(result).toContain("${domainCap} (5)");
			items.forEach(item => {
				expect(result).toContain(item.name);
			});
		});

		it("should handle special characters", () => {
			const item = {
				id: "test_id",
				name: "Test & ${domainCap.slice(0, -1)} <with> 'special' \\"chars\\""
			};

			const result = formatter.format${domainCap}List([item]);

			expect(result).toBeDefined();
			expect(result).not.toContain("undefined");
		});
	});

	describe("format${domainCap.slice(0, -1)}Detail", () => {
		it("should format detailed view", () => {
			const item = {
				id: "test_id",
				name: "Test ${domainCap.slice(0, -1)}",
				created_at: generators.timestamp().formatted,
				// Add more properties
			};

			const result = formatter.format${domainCap.slice(0, -1)}Detail(item);

			expect(result).toContain("test_id");
			expect(result).toContain("Test ${domainCap.slice(0, -1)}");
			expect(result).toContain("Created");
		});

		it("should handle null/undefined values", () => {
			const item = {
				id: "test_id",
				name: null,
				description: undefined
			};

			const result = formatter.format${domainCap.slice(0, -1)}Detail(item as unknown);

			expect(result).toBeDefined();
			expect(result).not.toContain("null");
			expect(result).not.toContain("undefined");
		});
	});
});`;
	}

	private generateGenericTemplate(
		domain: string,
		domainCap: string,
		layerCap: string,
	): string {
		return `import { describe, it, expect, beforeEach } from "@jest/globals";
import { ${domainCap}${layerCap} } from "./${domain}.${this.config.layer}.js";

describe("${domainCap}${layerCap}", () => {
	let instance: ${domainCap}${layerCap};

	beforeEach(() => {
		instance = new ${domainCap}${layerCap}();
	});

	describe("initialization", () => {
		it("should create instance successfully", () => {
			expect(instance).toBeDefined();
		});
	});

	// Add more test cases based on the specific layer functionality
});`;
	}
}

// CLI setup
program
	.name("scaffold-tests")
	.description("Generate test files for lokalise-mcp domains")
	.option("-d, --domain <domain>", "Domain name (e.g., projects, keys)")
	.option(
		"-l, --layer <layer>",
		"Layer to test (service, controller, tool, resource, cli, formatter)",
	)
	.option("--no-mocks", "Skip mock setup")
	.option("--performance", "Include performance tests")
	.option("--integration", "Include integration tests")
	.action(async (options) => {
		const scaffolder = new TestScaffolder();

		const config: Partial<TestConfig> = {};
		if (options.domain) config.domain = options.domain;
		if (options.layer) config.layer = options.layer;
		if (options.mocks === false) config.includeMocks = false;
		if (options.performance) config.includePerformance = true;
		if (options.integration) config.includeIntegration = true;

		await scaffolder.run(Object.keys(config).length > 0 ? config : undefined);
	});

program.parse();

export { TestScaffolder };
