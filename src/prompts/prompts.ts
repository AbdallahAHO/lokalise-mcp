import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { Logger } from "../shared/utils/logger.util.js";
import * as schemas from "./prompts.types.js";

const logger = Logger.forContext("prompts/prompts.ts");

/**
 * Register all MCP prompts with the server
 * These prompts provide pre-built workflows for common Lokalise operations
 */
export function registerPrompts(server: McpServer): void {
	const methodLogger = logger.forMethod("registerPrompts");
	methodLogger.info("Registering MCP prompts");

	// Project Management Prompts
	server.registerPrompt(
		"project_portfolio_overview",
		{
			title: "Project Portfolio Overview",
			description: "Get a comprehensive overview of all your Lokalise projects",
		},
		() => ({
			messages: [
				{
					role: "user" as const,
					content: {
						type: "text" as const,
						text: "Show me all my Lokalise projects with their current status, team information, and key statistics. Highlight any projects that need immediate attention or have been inactive recently. Present this as a management dashboard summary.",
					},
				},
			],
		}),
	);

	server.registerPrompt(
		"project_deep_dive",
		{
			title: "Project Deep Dive Analysis",
			description:
				"Analyze a specific project in detail with languages and key statistics",
			argsSchema: schemas.ProjectDeepDiveArgs.shape,
		},
		({ projectId }: schemas.ProjectDeepDiveArgsType) => ({
			messages: [
				{
					role: "user" as const,
					content: {
						type: "text" as const,
						text: `Give me a comprehensive analysis of project '${projectId}'. Include: project details, all configured languages with progress percentages, key statistics, and recent activity. Identify any potential issues or optimization opportunities.`,
					},
				},
			],
		}),
	);

	server.registerPrompt(
		"new_project_setup",
		{
			title: "New Project Setup",
			description: "Create and configure a new localization project",
			argsSchema: schemas.NewProjectSetupArgs.shape,
		},
		({
			projectName,
			description,
			targetLanguages,
		}: schemas.NewProjectSetupArgsType) => ({
			messages: [
				{
					role: "user" as const,
					content: {
						type: "text" as const,
						text: `Create a new Lokalise project named '${projectName}' with description '${description}'. Then add support for these languages: ${targetLanguages}. Show me the created project details and confirm all languages are properly configured.`,
					},
				},
			],
		}),
	);

	server.registerPrompt(
		"project_cleanup",
		{
			title: "Project Cleanup",
			description: "Clean up unused or deprecated content from a project",
			argsSchema: schemas.ProjectCleanupArgs.shape,
		},
		({ projectId, cleanupScope }: schemas.ProjectCleanupArgsType) => ({
			messages: [
				{
					role: "user" as const,
					content: {
						type: "text" as const,
						text: `Help me clean up project '${projectId}' by ${cleanupScope}. Show me what will be removed, get my confirmation, then execute the cleanup. Provide a detailed summary of what was cleaned up and the current project state.`,
					},
				},
			],
		}),
	);

	// Language & Localization Prompts
	server.registerPrompt(
		"language_expansion",
		{
			title: "Language Expansion",
			description: "Add new languages to an existing project",
			argsSchema: schemas.LanguageExpansionArgs.shape,
		},
		({ projectId, newLanguages }: schemas.LanguageExpansionArgsType) => ({
			messages: [
				{
					role: "user" as const,
					content: {
						type: "text" as const,
						text: `Add these languages to project '${projectId}': ${newLanguages}. After adding them, show me the updated language list with current statistics and confirm everything is set up correctly for translation work to begin.`,
					},
				},
			],
		}),
	);

	server.registerPrompt(
		"translation_progress_check",
		{
			title: "Translation Progress Check",
			description: "Monitor translation status across languages",
			argsSchema: schemas.TranslationProgressCheckArgs.shape,
		},
		({ projectId, threshold }: schemas.TranslationProgressCheckArgsType) => ({
			messages: [
				{
					role: "user" as const,
					content: {
						type: "text" as const,
						text: `Show me the translation progress for all languages in project '${projectId}'.${threshold ? ` Highlight any languages below ${threshold}% completion.` : ""} Include word counts, completion percentages, and reviewer approval status. Suggest priorities for completing translations.`,
					},
				},
			],
		}),
	);

	server.registerPrompt(
		"multi_language_setup",
		{
			title: "Multi-Language Setup",
			description: "Set up multiple language groups at once",
			argsSchema: schemas.MultiLanguageSetupArgs.shape,
		},
		({ projectId, languageGroups }: schemas.MultiLanguageSetupArgsType) => ({
			messages: [
				{
					role: "user" as const,
					content: {
						type: "text" as const,
						text: `Set up language groups for project '${projectId}' as follows: ${languageGroups}. Add all languages in their respective groups, show me the complete language configuration, and suggest any additional languages commonly used in these regions.`,
					},
				},
			],
		}),
	);

	// Key Management Prompts
	server.registerPrompt(
		"key_inventory_analysis",
		{
			title: "Key Inventory Analysis",
			description:
				"Analyze translation keys in a project with filtering and insights",
			argsSchema: schemas.KeyInventoryAnalysisArgs.shape,
		},
		({ projectId, platformFilter }: schemas.KeyInventoryAnalysisArgsType) => ({
			messages: [
				{
					role: "user" as const,
					content: {
						type: "text" as const,
						text: `Analyze all translation keys in project '${projectId}'${platformFilter ? ` filtered for platform: ${platformFilter}` : ""}. Show me: total key count, platform distribution, keys with missing descriptions, and any organizational patterns. Suggest improvements for key management.`,
					},
				},
			],
		}),
	);

	server.registerPrompt(
		"bulk_key_creation",
		{
			title: "Bulk Key Creation",
			description:
				"Create multiple translation keys for a new feature or screen",
			argsSchema: schemas.BulkKeyCreationArgs.shape,
		},
		({ projectId, featureName, keyList }: schemas.BulkKeyCreationArgsType) => ({
			messages: [
				{
					role: "user" as const,
					content: {
						type: "text" as const,
						text: `Create a set of translation keys for the '${featureName}' feature in project '${projectId}'. Use this key list: ${keyList}. Set appropriate descriptions and platform assignments for each key, then confirm all keys were created successfully.`,
					},
				},
			],
		}),
	);

	server.registerPrompt(
		"key_maintenance_workflow",
		{
			title: "Key Maintenance Workflow",
			description: "Update or clean up existing translation keys",
			argsSchema: schemas.KeyMaintenanceWorkflowArgs.shape,
		},
		({
			projectId,
			maintenanceType,
			criteria,
		}: schemas.KeyMaintenanceWorkflowArgsType) => ({
			messages: [
				{
					role: "user" as const,
					content: {
						type: "text" as const,
						text: `Perform ${maintenanceType} maintenance on keys in project '${projectId}' that match: ${criteria}. First, show me which keys will be affected, then ask for confirmation before making any changes. Provide a summary of all changes made.`,
					},
				},
			],
		}),
	);

	server.registerPrompt(
		"platform_key_management",
		{
			title: "Platform-Specific Key Management",
			description: "Manage keys for specific platforms",
			argsSchema: schemas.PlatformKeyManagementArgs.shape,
		},
		({
			projectId,
			platform,
			action,
		}: schemas.PlatformKeyManagementArgsType) => ({
			messages: [
				{
					role: "user" as const,
					content: {
						type: "text" as const,
						text: `${action} platform '${platform}' for keys in project '${projectId}'. Show me the affected keys and confirm the platform assignments have been updated correctly. Provide statistics on platform coverage.`,
					},
				},
			],
		}),
	);

	// Task & Workflow Prompts
	server.registerPrompt(
		"create_translation_task",
		{
			title: "Create Translation Task",
			description: "Create tasks with language assignments",
			argsSchema: schemas.CreateTranslationTaskArgs.shape,
		},
		({
			projectId,
			taskTitle,
			languages,
			dueDate,
		}: schemas.CreateTranslationTaskArgsType) => ({
			messages: [
				{
					role: "user" as const,
					content: {
						type: "text" as const,
						text: `Create a translation task titled '${taskTitle}' in project '${projectId}' for languages: ${languages}.${dueDate ? ` Set the due date to ${dueDate}.` : ""} Assign to appropriate team members based on language expertise. Show me the created task details.`,
					},
				},
			],
		}),
	);

	server.registerPrompt(
		"overdue_task_management",
		{
			title: "Overdue Task Management",
			description: "Handle overdue tasks across projects",
			argsSchema: schemas.OverdueTaskManagementArgs.shape,
		},
		({ projectId, action }: schemas.OverdueTaskManagementArgsType) => ({
			messages: [
				{
					role: "user" as const,
					content: {
						type: "text" as const,
						text: `${action} overdue tasks${projectId ? ` in project '${projectId}'` : " across all projects"}. Show me task details including assignees, languages, and days overdue. ${action === "reassign" ? "Suggest new assignees based on workload." : ""} ${action === "extend" ? "Recommend realistic new deadlines." : ""}`,
					},
				},
			],
		}),
	);

	server.registerPrompt(
		"review_task_automation",
		{
			title: "Review Task Automation",
			description: "Set up review workflows",
			argsSchema: schemas.ReviewTaskAutomationArgs.shape,
		},
		({
			projectId,
			reviewType,
			assignees,
		}: schemas.ReviewTaskAutomationArgsType) => ({
			messages: [
				{
					role: "user" as const,
					content: {
						type: "text" as const,
						text: `Create a ${reviewType} review task in project '${projectId}'. Assign to: ${assignees}. Set up the workflow with appropriate permissions and notifications. Show me the task configuration and estimated completion time.`,
					},
				},
			],
		}),
	);

	server.registerPrompt(
		"task_status_report",
		{
			title: "Task Status Report",
			description: "Get comprehensive task status",
			argsSchema: schemas.TaskStatusReportArgs.shape,
		},
		({ projectId, groupBy }: schemas.TaskStatusReportArgsType) => ({
			messages: [
				{
					role: "user" as const,
					content: {
						type: "text" as const,
						text: `Generate a task status report${projectId ? ` for project '${projectId}'` : " for all projects"}${groupBy ? ` grouped by ${groupBy}` : ""}. Include task counts, completion rates, average time to completion, and highlight any bottlenecks or delays.`,
					},
				},
			],
		}),
	);

	// E-commerce & Content Prompts
	server.registerPrompt(
		"product_catalog_update",
		{
			title: "Product Catalog Update",
			description: "Process seasonal catalog updates",
			argsSchema: schemas.ProductCatalogUpdateArgs.shape,
		},
		({
			projectId,
			catalogSource,
			targetMarkets,
		}: schemas.ProductCatalogUpdateArgsType) => ({
			messages: [
				{
					role: "user" as const,
					content: {
						type: "text" as const,
						text: `Process this seasonal product catalog update: extract all product descriptions, titles, and marketing copy from ${catalogSource}, create translation keys organized by product category in project '${projectId}', set up automated workflows for markets: ${targetMarkets}, and generate a timeline showing when each market will be ready.`,
					},
				},
			],
		}),
	);

	server.registerPrompt(
		"campaign_launch_setup",
		{
			title: "Campaign Launch Setup",
			description: "Set up marketing campaign localization",
			argsSchema: schemas.CampaignLaunchSetupArgs.shape,
		},
		({
			campaignName,
			contentSources,
			targetRegions,
		}: schemas.CampaignLaunchSetupArgsType) => ({
			messages: [
				{
					role: "user" as const,
					content: {
						type: "text" as const,
						text: `Launch '${campaignName}' campaign: extract content from ${contentSources}, create a new project with appropriate structure, translate for ${targetRegions} regions, ensure brand voice consistency, coordinate with regional teams, and set up publishing workflows.`,
					},
				},
			],
		}),
	);

	server.registerPrompt(
		"content_extraction_workflow",
		{
			title: "Content Extraction Workflow",
			description: "Extract and localize content from documents",
			argsSchema: schemas.ContentExtractionWorkflowArgs.shape,
		},
		({
			projectId,
			contentSource,
			contentType,
		}: schemas.ContentExtractionWorkflowArgsType) => ({
			messages: [
				{
					role: "user" as const,
					content: {
						type: "text" as const,
						text: `Extract ${contentType} content from ${contentSource} and import into project '${projectId}'. Organize by sections, apply appropriate metadata and tags, detect any existing translations, and create tasks for missing translations.`,
					},
				},
			],
		}),
	);

	// Developer Integration Prompts
	server.registerPrompt(
		"feature_branch_sync",
		{
			title: "Feature Branch Sync",
			description: "Sync feature branch with Lokalise",
			argsSchema: schemas.FeatureBranchSyncArgs.shape,
		},
		({
			projectId,
			branchName,
			syncDirection,
		}: schemas.FeatureBranchSyncArgsType) => ({
			messages: [
				{
					role: "user" as const,
					content: {
						type: "text" as const,
						text: `Sync the '${branchName}' feature branch with project '${projectId}'${syncDirection ? ` (direction: ${syncDirection})` : ""}. Detect new or modified keys, create appropriate translation tasks, and provide a summary of what was synced.`,
					},
				},
			],
		}),
	);

	server.registerPrompt(
		"ci_cd_integration",
		{
			title: "CI/CD Integration",
			description: "Automate CI/CD localization workflow",
			argsSchema: schemas.CiCdIntegrationArgs.shape,
		},
		({
			projectId,
			pipelineType,
			triggerEvent,
		}: schemas.CiCdIntegrationArgsType) => ({
			messages: [
				{
					role: "user" as const,
					content: {
						type: "text" as const,
						text: `Set up ${pipelineType} CI/CD integration for project '${projectId}' triggered on ${triggerEvent}. Configure automatic key sync, translation status checks, and build generation. Show me the workflow configuration.`,
					},
				},
			],
		}),
	);

	server.registerPrompt(
		"build_generation",
		{
			title: "Build Generation",
			description: "Generate translation bundles on demand",
			argsSchema: schemas.BuildGenerationArgs.shape,
		},
		({
			projectId,
			platform,
			format,
			environment,
		}: schemas.BuildGenerationArgsType) => ({
			messages: [
				{
					role: "user" as const,
					content: {
						type: "text" as const,
						text: `Generate a ${format} translation bundle for ${platform} platform from project '${projectId}'${environment ? ` for ${environment} environment` : ""}. Include only reviewed translations, apply platform-specific formatting, and provide download link.`,
					},
				},
			],
		}),
	);

	// Enterprise & Compliance Prompts
	server.registerPrompt(
		"regulatory_doc_processing",
		{
			title: "Regulatory Document Processing",
			description: "Process compliance documents",
			argsSchema: schemas.RegulatoryDocProcessingArgs.shape,
		},
		({
			projectId,
			documentType,
			complianceRegions,
			previousVersion,
		}: schemas.RegulatoryDocProcessingArgsType) => ({
			messages: [
				{
					role: "user" as const,
					content: {
						type: "text" as const,
						text: `Process ${documentType} for ${complianceRegions} compliance in project '${projectId}'.${previousVersion ? ` Compare with version '${previousVersion}' to identify changes.` : ""} Create structured translation tasks, ensure terminology compliance, set up multi-stage review workflow, and generate audit trail.`,
					},
				},
			],
		}),
	);

	server.registerPrompt(
		"audit_trail_generation",
		{
			title: "Audit Trail Generation",
			description: "Generate compliance audit trails",
			argsSchema: schemas.AuditTrailGenerationArgs.shape,
		},
		({
			projectId,
			auditPeriod,
			auditScope,
		}: schemas.AuditTrailGenerationArgsType) => ({
			messages: [
				{
					role: "user" as const,
					content: {
						type: "text" as const,
						text: `Generate a comprehensive audit trail for project '${projectId}' covering ${auditPeriod}. Include ${auditScope} with timestamps, user details, and change history. Format for regulatory submission and highlight any compliance concerns.`,
					},
				},
			],
		}),
	);

	server.registerPrompt(
		"quality_assurance_check",
		{
			title: "Quality Assurance Check",
			description: "Run comprehensive QA checks",
			argsSchema: schemas.QualityAssuranceCheckArgs.shape,
		},
		({
			projectId,
			qaType,
			languages,
		}: schemas.QualityAssuranceCheckArgsType) => ({
			messages: [
				{
					role: "user" as const,
					content: {
						type: "text" as const,
						text: `Run ${qaType} QA checks on project '${projectId}'${languages ? ` for languages: ${languages}` : " for all languages"}. Identify issues, generate detailed report with severity levels, create tasks for critical issues, and suggest corrective actions.`,
					},
				},
			],
		}),
	);

	// Team Collaboration Prompts
	server.registerPrompt(
		"contributor_assignment",
		{
			title: "Contributor Assignment",
			description: "Manage team assignments",
			argsSchema: schemas.ContributorAssignmentArgs.shape,
		},
		({
			projectId,
			contributorEmail,
			role,
			languages,
		}: schemas.ContributorAssignmentArgsType) => ({
			messages: [
				{
					role: "user" as const,
					content: {
						type: "text" as const,
						text: `Add '${contributorEmail}' to project '${projectId}' as ${role}${languages ? ` for languages: ${languages}` : ""}. Set appropriate permissions, notify about assigned tasks, and show current team structure.`,
					},
				},
			],
		}),
	);

	server.registerPrompt(
		"glossary_management",
		{
			title: "Glossary Management",
			description: "Check and update glossary terms",
			argsSchema: schemas.GlossaryManagementArgs.shape,
		},
		({ projectId, action, terms }: schemas.GlossaryManagementArgsType) => ({
			messages: [
				{
					role: "user" as const,
					content: {
						type: "text" as const,
						text: `${action} glossary${terms ? ` for terms: ${terms}` : ""} in project '${projectId}'. ${action === "check" ? "Identify missing or conflicting terms." : ""} ${action === "add" ? "Ensure consistency across languages." : ""} ${action === "export" ? "Format for external use." : ""} Show results and any recommendations.`,
					},
				},
			],
		}),
	);

	server.registerPrompt(
		"comment_collaboration",
		{
			title: "Comment Collaboration",
			description: "Facilitate team discussions on keys",
			argsSchema: schemas.CommentCollaborationArgs.shape,
		},
		({
			projectId,
			keyPattern,
			action,
		}: schemas.CommentCollaborationArgsType) => ({
			messages: [
				{
					role: "user" as const,
					content: {
						type: "text" as const,
						text: `${action} comments in project '${projectId}'${keyPattern ? ` for keys matching '${keyPattern}'` : ""}. ${action === "list" ? "Show recent discussions." : ""} ${action === "summarize" ? "Group by topic and urgency." : ""} ${action === "resolve" ? "Mark as addressed and notify participants." : ""}`,
					},
				},
			],
		}),
	);

	// Advanced Workflow Prompts
	server.registerPrompt(
		"international_app_launch",
		{
			title: "International App Launch",
			description: "Complete setup for launching app internationally",
			argsSchema: schemas.InternationalAppLaunchArgs.shape,
		},
		({
			appName,
			appDescription,
			targetMarkets,
			featureSets,
		}: schemas.InternationalAppLaunchArgsType) => ({
			messages: [
				{
					role: "user" as const,
					content: {
						type: "text" as const,
						text: `I'm launching a ${appDescription} app called '${appName}' across these markets: ${targetMarkets}. Set up complete localization: create project with optimal settings, add all target languages, create keys for ${featureSets}, configure review workflows, and provide launch readiness report with timeline.`,
					},
				},
			],
		}),
	);

	server.registerPrompt(
		"seasonal_campaign_cloning",
		{
			title: "Seasonal Campaign Cloning",
			description: "Clone and adapt seasonal campaigns",
			argsSchema: schemas.SeasonalCampaignCloningArgs.shape,
		},
		({
			sourceProjectId,
			newCampaignName,
			modifications,
			targetDate,
		}: schemas.SeasonalCampaignCloningArgsType) => ({
			messages: [
				{
					role: "user" as const,
					content: {
						type: "text" as const,
						text: `Clone project '${sourceProjectId}' to create '${newCampaignName}'. Apply these modifications: ${modifications}. Clear existing translations but keep structure, set up new tasks with ${targetDate} deadline, and show launch timeline.`,
					},
				},
			],
		}),
	);

	server.registerPrompt(
		"emergency_hotfix",
		{
			title: "Emergency Hotfix",
			description: "Handle urgent translation fixes",
			argsSchema: schemas.EmergencyHotfixArgs.shape,
		},
		({
			projectId,
			issueDescription,
			affectedKeys,
			priority,
		}: schemas.EmergencyHotfixArgsType) => ({
			messages: [
				{
					role: "user" as const,
					content: {
						type: "text" as const,
						text: `URGENT: ${issueDescription} in project '${projectId}' affecting keys: ${affectedKeys}. Priority: ${priority || "critical"}. Create emergency fix tasks, notify relevant team members immediately, fast-track review process, and prepare hotfix bundle.`,
					},
				},
			],
		}),
	);

	methodLogger.info("Successfully registered all prompts");
}
