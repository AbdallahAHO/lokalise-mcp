import { z } from "zod";

/**
 * Zod schemas for MCP prompt arguments
 * These schemas define the structure and validation for all prompt parameters
 */

// Project Management Prompts
export const ProjectPortfolioOverviewArgs = z
	.object({})
	.describe("Arguments for project portfolio overview prompt");

export const ProjectDeepDiveArgs = z
	.object({
		projectId: z.string().describe("The ID of the Lokalise project to analyze"),
	})
	.describe("Arguments for project deep dive analysis prompt");

export const NewProjectSetupArgs = z
	.object({
		projectName: z.string().describe("Name of the new project"),
		description: z.string().describe("Project description"),
		targetLanguages: z
			.string()
			.describe("Comma-separated list of target language ISO codes"),
	})
	.describe("Arguments for new project setup prompt");

export const ProjectCleanupArgs = z
	.object({
		projectId: z
			.string()
			.describe("The ID of the Lokalise project to clean up"),
		cleanupScope: z
			.string()
			.describe(
				"What to clean up (e.g., 'deprecated keys', 'unused languages')",
			),
	})
	.describe("Arguments for project cleanup prompt");

// Language & Localization Prompts
export const LanguageExpansionArgs = z
	.object({
		projectId: z.string().describe("The ID of the Lokalise project"),
		newLanguages: z
			.string()
			.describe("Comma-separated list of new language ISO codes to add"),
	})
	.describe("Arguments for language expansion prompt");

export const TranslationProgressCheckArgs = z
	.object({
		projectId: z.string().describe("The ID of the Lokalise project"),
		threshold: z
			.string()
			.optional()
			.describe("Completion threshold percentage (e.g., '80')"),
	})
	.describe("Arguments for translation progress check prompt");

export const MultiLanguageSetupArgs = z
	.object({
		projectId: z.string().describe("The ID of the Lokalise project"),
		languageGroups: z
			.string()
			.describe(
				"Language groups to add (e.g., 'EU: de,fr,es,it | ASIA: ja,ko,zh-CN')",
			),
	})
	.describe("Arguments for multi-language setup prompt");

// Key Management Prompts
export const KeyInventoryAnalysisArgs = z
	.object({
		projectId: z.string().describe("The ID of the Lokalise project"),
		platformFilter: z
			.string()
			.optional()
			.describe("Platform to filter by (ios, android, web)"),
	})
	.describe("Arguments for key inventory analysis prompt");

export const BulkKeyCreationArgs = z
	.object({
		projectId: z.string().describe("The ID of the Lokalise project"),
		featureName: z.string().describe("Name of the feature or screen"),
		keyList: z
			.string()
			.describe("Comma-separated list of key names or key definitions"),
	})
	.describe("Arguments for bulk key creation prompt");

export const KeyMaintenanceWorkflowArgs = z
	.object({
		projectId: z.string().describe("The ID of the Lokalise project"),
		maintenanceType: z
			.string()
			.describe("Type of maintenance (update, archive, delete)"),
		criteria: z
			.string()
			.describe("Criteria for selecting keys (e.g., 'tagged with v1')"),
	})
	.describe("Arguments for key maintenance workflow prompt");

export const PlatformKeyManagementArgs = z
	.object({
		projectId: z.string().describe("The ID of the Lokalise project"),
		platform: z.string().describe("Platform (ios, android, web)"),
		action: z
			.string()
			.describe("Action to perform (add, remove, list, update)"),
	})
	.describe("Arguments for platform-specific key management prompt");

// Task & Workflow Prompts
export const CreateTranslationTaskArgs = z
	.object({
		projectId: z.string().describe("The ID of the Lokalise project"),
		taskTitle: z.string().describe("Title of the translation task"),
		languages: z
			.string()
			.describe("Comma-separated list of language ISO codes"),
		dueDate: z
			.string()
			.optional()
			.describe("Due date for the task (e.g., 'next Friday')"),
	})
	.describe("Arguments for creating translation task prompt");

export const OverdueTaskManagementArgs = z
	.object({
		projectId: z
			.string()
			.optional()
			.describe("Project ID or leave empty for all projects"),
		action: z
			.string()
			.describe("Action to take (list, reassign, extend, notify)"),
	})
	.describe("Arguments for overdue task management prompt");

export const ReviewTaskAutomationArgs = z
	.object({
		projectId: z.string().describe("The ID of the Lokalise project"),
		reviewType: z
			.string()
			.describe("Type of review (linguistic, technical, final)"),
		assignees: z.string().describe("Comma-separated list of reviewer emails"),
	})
	.describe("Arguments for review task automation prompt");

export const TaskStatusReportArgs = z
	.object({
		projectId: z
			.string()
			.optional()
			.describe("Project ID or leave empty for all projects"),
		groupBy: z
			.string()
			.optional()
			.describe("Group by (status, assignee, language, project)"),
	})
	.describe("Arguments for task status report prompt");

// E-commerce & Content Prompts
export const ProductCatalogUpdateArgs = z
	.object({
		projectId: z.string().describe("The ID of the Lokalise project"),
		catalogSource: z
			.string()
			.describe("Source of catalog data (file path, URL, or description)"),
		targetMarkets: z
			.string()
			.describe("Comma-separated list of target market codes"),
	})
	.describe("Arguments for product catalog update prompt");

export const CampaignLaunchSetupArgs = z
	.object({
		campaignName: z.string().describe("Name of the campaign"),
		contentSources: z
			.string()
			.describe("Sources of campaign content (URLs, file paths)"),
		targetRegions: z
			.string()
			.describe("Target regions (e.g., 'EMEA, APAC, AMERICAS')"),
	})
	.describe("Arguments for campaign launch setup prompt");

export const ContentExtractionWorkflowArgs = z
	.object({
		projectId: z.string().describe("The ID of the Lokalise project"),
		contentSource: z
			.string()
			.describe("Source document or URL to extract content from"),
		contentType: z
			.string()
			.describe("Type of content (marketing, technical, legal)"),
	})
	.describe("Arguments for content extraction workflow prompt");

// Developer Integration Prompts
export const FeatureBranchSyncArgs = z
	.object({
		projectId: z.string().describe("The ID of the Lokalise project"),
		branchName: z.string().describe("Name of the feature branch"),
		syncDirection: z
			.string()
			.optional()
			.describe("Sync direction (push, pull, both)"),
	})
	.describe("Arguments for feature branch sync prompt");

export const CiCdIntegrationArgs = z
	.object({
		projectId: z.string().describe("The ID of the Lokalise project"),
		pipelineType: z
			.string()
			.describe("CI/CD system (github, gitlab, jenkins, circleci)"),
		triggerEvent: z.string().describe("Trigger event (push, pr, tag, manual)"),
	})
	.describe("Arguments for CI/CD integration prompt");

export const BuildGenerationArgs = z
	.object({
		projectId: z.string().describe("The ID of the Lokalise project"),
		platform: z.string().describe("Target platform (ios, android, web)"),
		format: z
			.string()
			.describe("Output format (json, xml, strings, properties)"),
		environment: z
			.string()
			.optional()
			.describe("Environment (staging, production)"),
	})
	.describe("Arguments for build generation prompt");

// Enterprise & Compliance Prompts
export const RegulatoryDocProcessingArgs = z
	.object({
		projectId: z.string().describe("The ID of the Lokalise project"),
		documentType: z
			.string()
			.describe("Type of document (privacy policy, terms, medical)"),
		complianceRegions: z
			.string()
			.describe("Compliance regions (e.g., 'FDA, CE, GDPR')"),
		previousVersion: z
			.string()
			.optional()
			.describe("Previous version reference for delta analysis"),
	})
	.describe("Arguments for regulatory document processing prompt");

export const AuditTrailGenerationArgs = z
	.object({
		projectId: z.string().describe("The ID of the Lokalise project"),
		auditPeriod: z
			.string()
			.describe("Audit period (e.g., 'last 30 days', 'Q4 2024')"),
		auditScope: z
			.string()
			.describe("Scope of audit (translations, approvals, changes)"),
	})
	.describe("Arguments for audit trail generation prompt");

export const QualityAssuranceCheckArgs = z
	.object({
		projectId: z.string().describe("The ID of the Lokalise project"),
		qaType: z
			.string()
			.describe(
				"Type of QA check (consistency, completeness, terminology, formatting)",
			),
		languages: z
			.string()
			.optional()
			.describe("Specific languages to check (leave empty for all)"),
	})
	.describe("Arguments for quality assurance check prompt");

// Team Collaboration Prompts
export const ContributorAssignmentArgs = z
	.object({
		projectId: z.string().describe("The ID of the Lokalise project"),
		contributorEmail: z.string().describe("Email of the contributor"),
		role: z.string().describe("Role to assign (translator, reviewer, admin)"),
		languages: z
			.string()
			.optional()
			.describe("Languages to assign (leave empty for all)"),
	})
	.describe("Arguments for contributor assignment prompt");

export const GlossaryManagementArgs = z
	.object({
		projectId: z.string().describe("The ID of the Lokalise project"),
		action: z
			.string()
			.describe("Action to perform (check, add, update, export)"),
		terms: z.string().optional().describe("Terms to process (comma-separated)"),
	})
	.describe("Arguments for glossary management prompt");

export const CommentCollaborationArgs = z
	.object({
		projectId: z.string().describe("The ID of the Lokalise project"),
		keyPattern: z
			.string()
			.optional()
			.describe("Pattern to match keys (e.g., 'button_*')"),
		action: z
			.string()
			.describe("Action to perform (list, add, resolve, summarize)"),
	})
	.describe("Arguments for comment collaboration prompt");

// Advanced Workflow Prompts
export const InternationalAppLaunchArgs = z
	.object({
		appName: z.string().describe("Name of the application"),
		appDescription: z.string().describe("Brief description of the app"),
		targetMarkets: z.string().describe("Target markets and their languages"),
		featureSets: z
			.string()
			.describe(
				"Feature sets to create keys for (e.g., 'onboarding, main features, settings')",
			),
	})
	.describe("Arguments for international app launch prompt");

export const SeasonalCampaignCloningArgs = z
	.object({
		sourceProjectId: z
			.string()
			.describe("ID of the source project to clone from"),
		newCampaignName: z.string().describe("Name of the new campaign"),
		modifications: z
			.string()
			.describe("Modifications to apply (e.g., 'change dates, update offers')"),
		targetDate: z.string().describe("Target launch date"),
	})
	.describe("Arguments for seasonal campaign cloning prompt");

export const EmergencyHotfixArgs = z
	.object({
		projectId: z.string().describe("The ID of the Lokalise project"),
		issueDescription: z.string().describe("Description of the issue"),
		affectedKeys: z.string().describe("Affected key names or patterns"),
		priority: z
			.string()
			.optional()
			.describe("Priority level (critical, high, medium)"),
	})
	.describe("Arguments for emergency hotfix prompt");

// Type exports for use in prompts.ts
export type ProjectPortfolioOverviewArgsType = z.infer<
	typeof ProjectPortfolioOverviewArgs
>;
export type ProjectDeepDiveArgsType = z.infer<typeof ProjectDeepDiveArgs>;
export type NewProjectSetupArgsType = z.infer<typeof NewProjectSetupArgs>;
export type ProjectCleanupArgsType = z.infer<typeof ProjectCleanupArgs>;
export type LanguageExpansionArgsType = z.infer<typeof LanguageExpansionArgs>;
export type TranslationProgressCheckArgsType = z.infer<
	typeof TranslationProgressCheckArgs
>;
export type MultiLanguageSetupArgsType = z.infer<typeof MultiLanguageSetupArgs>;
export type KeyInventoryAnalysisArgsType = z.infer<
	typeof KeyInventoryAnalysisArgs
>;
export type BulkKeyCreationArgsType = z.infer<typeof BulkKeyCreationArgs>;
export type KeyMaintenanceWorkflowArgsType = z.infer<
	typeof KeyMaintenanceWorkflowArgs
>;
export type PlatformKeyManagementArgsType = z.infer<
	typeof PlatformKeyManagementArgs
>;
export type CreateTranslationTaskArgsType = z.infer<
	typeof CreateTranslationTaskArgs
>;
export type OverdueTaskManagementArgsType = z.infer<
	typeof OverdueTaskManagementArgs
>;
export type ReviewTaskAutomationArgsType = z.infer<
	typeof ReviewTaskAutomationArgs
>;
export type TaskStatusReportArgsType = z.infer<typeof TaskStatusReportArgs>;
export type ProductCatalogUpdateArgsType = z.infer<
	typeof ProductCatalogUpdateArgs
>;
export type CampaignLaunchSetupArgsType = z.infer<
	typeof CampaignLaunchSetupArgs
>;
export type ContentExtractionWorkflowArgsType = z.infer<
	typeof ContentExtractionWorkflowArgs
>;
export type FeatureBranchSyncArgsType = z.infer<typeof FeatureBranchSyncArgs>;
export type CiCdIntegrationArgsType = z.infer<typeof CiCdIntegrationArgs>;
export type BuildGenerationArgsType = z.infer<typeof BuildGenerationArgs>;
export type RegulatoryDocProcessingArgsType = z.infer<
	typeof RegulatoryDocProcessingArgs
>;
export type AuditTrailGenerationArgsType = z.infer<
	typeof AuditTrailGenerationArgs
>;
export type QualityAssuranceCheckArgsType = z.infer<
	typeof QualityAssuranceCheckArgs
>;
export type ContributorAssignmentArgsType = z.infer<
	typeof ContributorAssignmentArgs
>;
export type GlossaryManagementArgsType = z.infer<typeof GlossaryManagementArgs>;
export type CommentCollaborationArgsType = z.infer<
	typeof CommentCollaborationArgs
>;
export type InternationalAppLaunchArgsType = z.infer<
	typeof InternationalAppLaunchArgs
>;
export type SeasonalCampaignCloningArgsType = z.infer<
	typeof SeasonalCampaignCloningArgs
>;
export type EmergencyHotfixArgsType = z.infer<typeof EmergencyHotfixArgs>;
