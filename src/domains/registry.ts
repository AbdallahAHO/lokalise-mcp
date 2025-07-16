import { readdir } from "node:fs/promises";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { Command } from "commander";
import type {
	DomainDiscoveryResult,
	DomainModule,
	DomainRegistryEntry,
} from "../shared/types/domain.types.js";
import { Logger } from "../shared/utils/logger.util.js";

/**
 * Domain Registry class for managing domain discovery and registration
 */
export class DomainRegistry {
	private logger: ReturnType<typeof Logger.forContext> | null = null;

	private getLogger() {
		if (!this.logger) {
			this.logger = Logger.forContext("domains/registry.ts");
		}
		return this.logger;
	}
	private readonly domainsPath: string;
	private readonly registryMap = new Map<string, DomainRegistryEntry>();
	private discoveredDomains: DomainDiscoveryResult[] = [];

	constructor() {
		// Get the current file's directory and resolve domains path
		const currentDir = fileURLToPath(new URL(".", import.meta.url));
		this.domainsPath = currentDir; // We're already in the domains directory
	}

	/**
	 * Discover all domains in the domains directory
	 */
	async discoverDomains(): Promise<DomainDiscoveryResult[]> {
		const methodLogger = this.getLogger().forMethod("discoverDomains");
		methodLogger.debug("Starting domain discovery", {
			domainsPath: this.domainsPath,
		});

		try {
			const entries = await readdir(this.domainsPath, { withFileTypes: true });
			const domainDirs = entries.filter(
				(entry) => entry.isDirectory() && !entry.name.startsWith("."),
			);

			const results: DomainDiscoveryResult[] = [];

			for (const dir of domainDirs) {
				const domainPath = join(this.domainsPath, dir.name);
				const result = await this.analyzeDomain(dir.name, domainPath);
				results.push(result);
			}

			this.discoveredDomains = results;
			methodLogger.info(`Discovered ${results.length} domains`, {
				domains: results.map((r) => r.name),
			});
			return results;
		} catch (error) {
			methodLogger.error("Error discovering domains", { error });
			throw error;
		}
	}

	/**
	 * Analyze a domain directory to check if it's a valid domain
	 */
	private async analyzeDomain(
		name: string,
		domainPath: string,
	): Promise<DomainDiscoveryResult> {
		const methodLogger = this.getLogger().forMethod("analyzeDomain");
		methodLogger.debug(`Analyzing domain: ${name}`, { domainPath });

		try {
			const files = await readdir(domainPath);
			const hasTools = files.some(
				(file) => file.endsWith(".tool.ts") || file.endsWith(".tool.js"),
			);
			const hasCli = files.some(
				(file) => file.endsWith(".cli.ts") || file.endsWith(".cli.js"),
			);
			const hasResources = files.some(
				(file) =>
					file.endsWith(".resource.ts") || file.endsWith(".resource.js"),
			);
			const hasIndex = files.includes("index.ts") || files.includes("index.js");

			const isValid = hasIndex && (hasTools || hasCli || hasResources);

			return {
				name,
				path: domainPath,
				hasTools,
				hasCli,
				hasResources,
				isValid,
			};
		} catch (error) {
			methodLogger.error(`Error analyzing domain ${name}`, { error });
			return {
				name,
				path: domainPath,
				hasTools: false,
				hasCli: false,
				hasResources: false,
				isValid: false,
				error: error instanceof Error ? error.message : String(error),
			};
		}
	}

	/**
	 * Load a specific domain module
	 */
	async loadDomain(name: string): Promise<DomainModule | null> {
		const methodLogger = this.getLogger().forMethod("loadDomain");
		methodLogger.debug(`Loading domain: ${name}`);

		try {
			const domainPath = join(this.domainsPath, name);
			const indexPath = join(domainPath, "index.js");

			// Check if the domain exists in our discovered domains
			const discoveredDomain = this.discoveredDomains.find(
				(d) => d.name === name,
			);
			if (!discoveredDomain || !discoveredDomain.isValid) {
				methodLogger.warn(`Domain ${name} not found or invalid`);
				return null;
			}

			// Dynamic import of the domain module
			const domainModule = await import(indexPath);

			// Extract tool, CLI, and resource exports based on naming convention
			const tool = domainModule[`${name}Tool`];
			const cli = domainModule[`${name}Cli`];
			const resource = domainModule[`${name}Resource`];

			const module: DomainModule = {
				tool,
				cli,
				resource,
				meta: {
					name,
					description: `${name.charAt(0).toUpperCase() + name.slice(1)} domain`,
					version: "1.0.0",
				},
			};

			// Update registry
			this.registryMap.set(name, {
				name,
				path: domainPath,
				module,
				loaded: true,
			});

			methodLogger.info(`Successfully loaded domain: ${name}`, {
				hasTools: !!tool,
				hasCli: !!cli,
				hasResources: !!resource,
			});
			return module;
		} catch (error) {
			methodLogger.error(`Failed to load domain ${name}`, { error });

			// Update registry with error
			this.registryMap.set(name, {
				name,
				path: join(this.domainsPath, name),
				module: {},
				loaded: false,
				error: error instanceof Error ? error.message : String(error),
			});

			return null;
		}
	}

	/**
	 * Load all valid domains
	 */
	async loadAllDomains(): Promise<DomainModule[]> {
		const methodLogger = this.getLogger().forMethod("loadAllDomains");
		methodLogger.debug("Loading all domains");

		if (this.discoveredDomains.length === 0) {
			await this.discoverDomains();
		}

		const validDomains = this.discoveredDomains.filter((d) => d.isValid);
		const loadedModules: DomainModule[] = [];

		for (const domain of validDomains) {
			const module = await this.loadDomain(domain.name);
			if (module) {
				loadedModules.push(module);
			}
		}

		methodLogger.info(`Loaded ${loadedModules.length} domains successfully`);
		return loadedModules;
	}

	/**
	 * Register all domain tools with the MCP server
	 */
	async registerAllTools(server: McpServer): Promise<void> {
		const methodLogger = this.getLogger().forMethod("registerAllTools");
		methodLogger.debug("Registering all domain tools");

		const domains = await this.loadAllDomains();
		let registeredCount = 0;

		for (const domain of domains) {
			if (domain.tool && typeof domain.tool.registerTools === "function") {
				try {
					domain.tool.registerTools(server);
					registeredCount++;
					methodLogger.debug(
						`Registered tools for domain: ${domain.meta?.name}`,
					);
				} catch (error) {
					methodLogger.error(
						`Failed to register tools for domain: ${domain.meta?.name}`,
						{ error },
					);
				}
			}
		}

		methodLogger.info(`Registered tools for ${registeredCount} domains`);
	}

	/**
	 * Register all domain CLI commands with the Commander program
	 */
	async registerAllCli(program: Command): Promise<void> {
		const methodLogger = this.getLogger().forMethod("registerAllCli");
		methodLogger.debug("Registering all domain CLI commands");

		const domains = await this.loadAllDomains();
		let registeredCount = 0;

		for (const domain of domains) {
			if (domain.cli && typeof domain.cli.register === "function") {
				try {
					domain.cli.register(program);
					registeredCount++;
					methodLogger.debug(
						`Registered CLI commands for domain: ${domain.meta?.name}`,
					);
				} catch (error) {
					methodLogger.error(
						`Failed to register CLI commands for domain: ${domain.meta?.name}`,
						{ error },
					);
				}
			}
		}

		methodLogger.info(`Registered CLI commands for ${registeredCount} domains`);
	}

	/**
	 * Register all domain resources with the MCP server
	 */
	async registerAllResources(server: McpServer): Promise<void> {
		const methodLogger = this.getLogger().forMethod("registerAllResources");
		methodLogger.debug("Registering all domain resources");

		const domains = await this.loadAllDomains();
		let registeredCount = 0;

		for (const domain of domains) {
			if (
				domain.resource &&
				typeof domain.resource.registerResources === "function"
			) {
				try {
					domain.resource.registerResources(server);
					registeredCount++;
					methodLogger.debug(
						`Registered resources for domain: ${domain.meta?.name}`,
					);
				} catch (error) {
					methodLogger.error(
						`Failed to register resources for domain: ${domain.meta?.name}`,
						{ error },
					);
				}
			}
		}

		methodLogger.info(`Registered resources for ${registeredCount} domains`);
	}

	/**
	 * Get registry status and health information
	 */
	getRegistryStatus(): {
		discovered: number;
		loaded: number;
		failed: number;
		entries: DomainRegistryEntry[];
	} {
		const entries = Array.from(this.registryMap.values());
		return {
			discovered: this.discoveredDomains.length,
			loaded: entries.filter((e) => e.loaded).length,
			failed: entries.filter((e) => !e.loaded).length,
			entries,
		};
	}
}

// Export singleton instance
export const domainRegistry = new DomainRegistry();
