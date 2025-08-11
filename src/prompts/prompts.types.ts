import { z } from "zod";

/**
 * Zod schemas for MCP prompt arguments
 * All schemas use user-friendly names instead of technical IDs
 * Following Claude 4 best practices for clarity and usability
 */

// ============================================================================
// Project Management Prompts
// ============================================================================

export const ProjectPortfolioOverviewArgs = z
	.object({})
	.describe("Arguments for project portfolio overview prompt");

export const ProjectDeepDiveArgs = z
	.object({
		projectName: z
			.string()
			.describe(
				"Name of your Lokalise project (e.g., 'Mobile App', 'Marketing Website')",
			),
	})
	.describe("Arguments for project deep dive analysis prompt");

export const NewProjectSetupArgs = z
	.object({
		projectName: z.string().describe("Name for the new project"),
		description: z
			.string()
			.describe("Description of what this project will contain"),
		baseLanguage: z
			.string()
			.describe(
				"Primary language for your content (e.g., 'English', 'German')",
			),
		targetLanguages: z
			.string()
			.describe(
				"Languages to translate into (e.g., 'Spanish, French, Japanese')",
			),
	})
	.describe("Arguments for new project setup prompt");

export const ProjectCleanupArgs = z
	.object({
		projectName: z.string().describe("Name of the project to clean up"),
		cleanupScope: z
			.string()
			.describe(
				"What to clean (e.g., 'deprecated keys', 'unused languages', 'old branches', 'all')",
			),
	})
	.describe("Arguments for project cleanup prompt");

// ============================================================================
// Language & Localization Prompts
// ============================================================================

export const LanguageExpansionArgs = z
	.object({
		projectName: z.string().describe("Name of your Lokalise project"),
		newLanguages: z
			.string()
			.describe("Languages to add (e.g., 'Spanish, Portuguese, Italian')"),
		setCustomNames: z
			.string()
			.optional()
			.describe("Custom names for languages (e.g., 'Spanish (Latin America)')"),
	})
	.describe("Arguments for language expansion prompt");

export const TranslationProgressCheckArgs = z
	.object({
		projectName: z.string().describe("Name of your Lokalise project"),
		threshold: z
			.string()
			.optional()
			.describe("Minimum acceptable completion percentage (e.g., '80')"),
		includeReviewStatus: z
			.string()
			.optional()
			.describe(
				"Include review/approval status in the report (true/false, default: true)",
			),
	})
	.describe("Arguments for translation progress check prompt");

export const MultiLanguageSetupArgs = z
	.object({
		projectName: z.string().describe("Name of your Lokalise project"),
		languageGroups: z
			.string()
			.describe(
				"Language groups to add (e.g., 'Europe: German, French, Italian | Asia: Japanese, Korean, Chinese')",
			),
		customSettings: z
			.string()
			.optional()
			.describe(
				"Special settings per group (e.g., 'Europe: formal tone, Asia: casual tone')",
			),
	})
	.describe("Arguments for multi-language setup prompt");

// ============================================================================
// Key Management Prompts
// ============================================================================

export const KeyInventoryAnalysisArgs = z
	.object({
		projectName: z.string().describe("Name of your Lokalise project"),
		platformFilter: z
			.string()
			.optional()
			.describe("Filter by platform: 'iOS', 'Android', 'Web', or 'all'"),
		tagFilter: z
			.string()
			.optional()
			.describe("Filter by tags (comma-separated)"),
	})
	.describe("Arguments for key inventory analysis prompt");

export const BulkKeyCreationArgs = z
	.object({
		projectName: z.string().describe("Name of your Lokalise project"),
		featureName: z.string().describe("Name of the feature or screen"),
		keyList: z
			.string()
			.describe(
				"Keys to create (e.g., 'login.title, login.button, login.error')",
			),
		platforms: z
			.string()
			.optional()
			.describe("Platforms these keys apply to (e.g., 'iOS, Android')"),
		baseTranslations: z
			.string()
			.optional()
			.describe("Initial translations in base language"),
	})
	.describe("Arguments for bulk key creation prompt");

export const KeyMaintenanceWorkflowArgs = z
	.object({
		projectName: z.string().describe("Name of your Lokalise project"),
		maintenanceType: z
			.string()
			.describe(
				"Type of maintenance: 'update', 'archive', 'delete', 'reorganize'",
			),
		criteria: z
			.string()
			.describe(
				"Which keys to affect (e.g., 'tagged with v1', 'unused for 6 months', 'containing old_')",
			),
		newValues: z
			.string()
			.optional()
			.describe("New values for updates (if applicable)"),
	})
	.describe("Arguments for key maintenance workflow prompt");

export const PlatformKeyManagementArgs = z
	.object({
		projectName: z.string().describe("Name of your Lokalise project"),
		platform: z.string().describe("Platform: 'iOS', 'Android', or 'Web'"),
		action: z
			.string()
			.describe("Action to perform: 'add', 'remove', 'list', 'update'"),
		keyPattern: z
			.string()
			.optional()
			.describe("Pattern to match keys (e.g., 'screen.*', 'button_*')"),
	})
	.describe("Arguments for platform-specific key management prompt");

// ============================================================================
// Task & Workflow Prompts
// ============================================================================

export const CreateTranslationTaskArgs = z
	.object({
		projectName: z.string().describe("Name of your Lokalise project"),
		taskTitle: z.string().describe("Title for the translation task"),
		taskDescription: z
			.string()
			.describe("Detailed description of what needs to be done"),
		languages: z
			.string()
			.describe("Languages to translate (e.g., 'Spanish, French, German')"),
		assignTo: z
			.string()
			.optional()
			.describe("Email or group name to assign the task to"),
		dueDate: z
			.string()
			.optional()
			.describe(
				"When the task should be completed (e.g., 'next Friday', 'December 15')",
			),
		keyPattern: z
			.string()
			.optional()
			.describe("Keys to include (e.g., 'feature.*', 'all new keys')"),
	})
	.describe("Arguments for creating translation task prompt");

export const OverdueTaskManagementArgs = z
	.object({
		projectName: z
			.string()
			.optional()
			.describe("Project name (or leave empty for all projects)"),
		action: z
			.string()
			.describe("Action to take: 'list', 'reassign', 'extend', 'escalate'"),
		reassignTo: z
			.string()
			.optional()
			.describe("Who to reassign tasks to (if reassigning)"),
		extensionDays: z
			.string()
			.optional()
			.describe("Days to extend deadline (if extending)"),
	})
	.describe("Arguments for overdue task management prompt");

export const ReviewTaskAutomationArgs = z
	.object({
		projectName: z.string().describe("Name of your Lokalise project"),
		reviewType: z
			.string()
			.describe("Type of review: 'linguistic', 'technical', 'final', 'legal'"),
		contentToReview: z
			.string()
			.describe(
				"What to review (e.g., 'all new translations', 'machine translations', 'specific feature')",
			),
		reviewers: z
			.string()
			.describe("Reviewer emails or group names (comma-separated)"),
		reviewCriteria: z
			.string()
			.optional()
			.describe(
				"Specific criteria to check (e.g., 'brand voice', 'technical accuracy')",
			),
	})
	.describe("Arguments for review task automation prompt");

export const TaskStatusReportArgs = z
	.object({
		projectName: z
			.string()
			.optional()
			.describe("Project name (or leave empty for all projects)"),
		groupBy: z
			.string()
			.optional()
			.describe(
				"How to group results: 'status', 'assignee', 'language', 'project'",
			),
		includeCompleted: z
			.string()
			.optional()
			.describe(
				"Include completed tasks in the report (true/false, default: false)",
			),
		timeframe: z
			.string()
			.optional()
			.describe("Time period to report on (e.g., 'this week', 'last month')"),
	})
	.describe("Arguments for task status report prompt");

// ============================================================================
// E-commerce & Content Prompts
// ============================================================================

export const ProductCatalogUpdateArgs = z
	.object({
		projectName: z.string().describe("Name of your Lokalise project"),
		catalogSource: z
			.string()
			.describe("Source of catalog data (describe the file or system)"),
		productCategories: z
			.string()
			.describe(
				"Product categories to process (e.g., 'electronics, clothing, accessories')",
			),
		targetMarkets: z
			.string()
			.describe("Target markets (e.g., 'Europe, North America, Asia Pacific')"),
		seasonalContext: z
			.string()
			.optional()
			.describe("Seasonal context (e.g., 'Summer 2024', 'Black Friday')"),
	})
	.describe("Arguments for product catalog update prompt");

export const CampaignLaunchSetupArgs = z
	.object({
		campaignName: z.string().describe("Name of the marketing campaign"),
		campaignDescription: z
			.string()
			.describe("Brief description of the campaign"),
		contentTypes: z
			.string()
			.describe(
				"Types of content (e.g., 'emails, landing pages, social media, ads')",
			),
		targetRegions: z
			.string()
			.describe("Target regions (e.g., 'EMEA, APAC, Americas')"),
		launchDate: z.string().describe("Campaign launch date"),
		brandGuidelines: z
			.string()
			.optional()
			.describe("Special brand guidelines or tone requirements"),
	})
	.describe("Arguments for campaign launch setup prompt");

export const ContentExtractionWorkflowArgs = z
	.object({
		projectName: z.string().describe("Name of your Lokalise project"),
		contentSource: z
			.string()
			.describe("Describe the source document or content location"),
		contentType: z
			.string()
			.describe("Type of content: 'marketing', 'technical', 'legal', 'help'"),
		extractionRules: z
			.string()
			.optional()
			.describe(
				"Special extraction rules (e.g., 'skip headers', 'include alt text')",
			),
		organizationScheme: z
			.string()
			.optional()
			.describe(
				"How to organize extracted content (e.g., 'by section', 'by page')",
			),
	})
	.describe("Arguments for content extraction workflow prompt");

// ============================================================================
// Developer Integration Prompts
// ============================================================================

export const FeatureBranchSyncArgs = z
	.object({
		projectName: z.string().describe("Name of your Lokalise project"),
		branchName: z.string().describe("Name of the feature branch"),
		syncDirection: z
			.string()
			.optional()
			.describe("Sync direction: 'push', 'pull', or 'both'"),
		conflictResolution: z
			.string()
			.optional()
			.describe("How to handle conflicts: 'keep-local', 'keep-remote', 'ask'"),
	})
	.describe("Arguments for feature branch sync prompt");

export const CiCdIntegrationArgs = z
	.object({
		projectName: z.string().describe("Name of your Lokalise project"),
		pipelineType: z
			.string()
			.describe(
				"CI/CD system: 'GitHub Actions', 'GitLab CI', 'Jenkins', 'CircleCI'",
			),
		triggerEvent: z
			.string()
			.describe("When to trigger: 'push', 'pull request', 'tag', 'scheduled'"),
		validationRules: z
			.string()
			.optional()
			.describe(
				"Validation rules (e.g., 'minimum 80% translated', 'all keys present')",
			),
	})
	.describe("Arguments for CI/CD integration prompt");

export const BuildGenerationArgs = z
	.object({
		projectName: z.string().describe("Name of your Lokalise project"),
		platform: z.string().describe("Target platform: 'iOS', 'Android', 'Web'"),
		format: z
			.string()
			.describe(
				"Output format: 'JSON', 'XML', 'strings', 'properties', 'YAML'",
			),
		languages: z
			.string()
			.optional()
			.describe("Specific languages to include (or 'all')"),
		environment: z
			.string()
			.optional()
			.describe("Environment: 'development', 'staging', 'production'"),
		includeOptions: z
			.string()
			.optional()
			.describe(
				"What to include: 'only-reviewed', 'include-descriptions', 'plurals'",
			),
	})
	.describe("Arguments for build generation prompt");

// ============================================================================
// Enterprise & Compliance Prompts
// ============================================================================

export const RegulatoryDocProcessingArgs = z
	.object({
		projectName: z.string().describe("Name of your Lokalise project"),
		documentType: z
			.string()
			.describe(
				"Type of document: 'privacy policy', 'terms of service', 'medical', 'financial'",
			),
		complianceFrameworks: z
			.string()
			.describe("Compliance requirements (e.g., 'GDPR, CCPA, HIPAA')"),
		targetJurisdictions: z
			.string()
			.describe("Target jurisdictions (e.g., 'EU, California, Canada')"),
		previousVersion: z
			.string()
			.optional()
			.describe("Reference to previous version for change tracking"),
		legalReviewRequired: z
			.string()
			.optional()
			.describe("Whether legal review is required (true/false, default: true)"),
	})
	.describe("Arguments for regulatory document processing prompt");

export const AuditTrailGenerationArgs = z
	.object({
		projectName: z.string().describe("Name of your Lokalise project"),
		auditPeriod: z
			.string()
			.describe(
				"Period to audit (e.g., 'last 30 days', 'Q4 2024', 'since October 1')",
			),
		auditScope: z
			.string()
			.describe(
				"What to audit: 'all changes', 'translations', 'approvals', 'user actions'",
			),
		includeDetails: z
			.string()
			.optional()
			.describe("Level of detail: 'summary', 'detailed', 'forensic'"),
		outputFormat: z
			.string()
			.optional()
			.describe("Output format: 'report', 'CSV', 'timeline'"),
	})
	.describe("Arguments for audit trail generation prompt");

export const QualityAssuranceCheckArgs = z
	.object({
		projectName: z.string().describe("Name of your Lokalise project"),
		qaType: z
			.string()
			.describe(
				"Type of QA: 'consistency', 'completeness', 'terminology', 'formatting', 'comprehensive'",
			),
		languages: z
			.string()
			.optional()
			.describe("Languages to check (e.g., 'Spanish, French' or 'all')"),
		severity: z
			.string()
			.optional()
			.describe(
				"Issue severity to report: 'all', 'warnings-and-above', 'errors-only'",
			),
		autoFix: z
			.string()
			.optional()
			.describe(
				"Automatically fix issues where possible (true/false, default: false)",
			),
	})
	.describe("Arguments for quality assurance check prompt");

// ============================================================================
// Team Collaboration Prompts
// ============================================================================

export const ContributorAssignmentArgs = z
	.object({
		projectName: z.string().describe("Name of your Lokalise project"),
		contributorEmail: z.string().describe("Email address of the contributor"),
		contributorName: z.string().describe("Full name of the contributor"),
		role: z
			.string()
			.describe("Role: 'translator', 'reviewer', 'manager', 'developer'"),
		languages: z
			.string()
			.optional()
			.describe("Languages they'll work with (e.g., 'Spanish, Portuguese')"),
		permissions: z
			.string()
			.optional()
			.describe(
				"Special permissions (e.g., 'can-delete-keys', 'can-manage-tasks')",
			),
	})
	.describe("Arguments for contributor assignment prompt");

export const GlossaryManagementArgs = z
	.object({
		projectName: z.string().describe("Name of your Lokalise project"),
		action: z
			.string()
			.describe("Action: 'check', 'add', 'update', 'export', 'import'"),
		terms: z.string().optional().describe("Terms to process (comma-separated)"),
		languages: z
			.string()
			.optional()
			.describe("Languages to include (default: all project languages)"),
		glossarySource: z
			.string()
			.optional()
			.describe("Source for import (if importing)"),
	})
	.describe("Arguments for glossary management prompt");

export const CommentCollaborationArgs = z
	.object({
		projectName: z.string().describe("Name of your Lokalise project"),
		keyPattern: z
			.string()
			.optional()
			.describe("Filter keys (e.g., 'feature_*', 'screen.login.*')"),
		action: z
			.string()
			.describe("Action: 'list', 'add', 'resolve', 'summarize', 'escalate'"),
		commentText: z.string().optional().describe("Comment text (if adding)"),
		assignTo: z
			.string()
			.optional()
			.describe("Who to notify or assign (email or group name)"),
	})
	.describe("Arguments for comment collaboration prompt");

// ============================================================================
// Advanced Workflow Prompts
// ============================================================================

export const InternationalAppLaunchArgs = z
	.object({
		appName: z.string().describe("Name of your application"),
		appDescription: z
			.string()
			.describe("Brief description of the app's purpose"),
		primaryMarket: z
			.string()
			.describe("Primary market/language (e.g., 'United States - English')"),
		targetMarkets: z
			.string()
			.describe(
				"Target markets and languages (e.g., 'Europe: German, French, Spanish | Asia: Japanese, Korean')",
			),
		featureSets: z
			.string()
			.describe(
				"Main features to localize (e.g., 'onboarding, core features, settings, help')",
			),
		launchTimeline: z.string().describe("Target launch date or timeline"),
		complianceNeeds: z
			.string()
			.optional()
			.describe(
				"Compliance requirements per market (e.g., 'EU: GDPR, Japan: APPI')",
			),
	})
	.describe("Arguments for international app launch prompt");

export const SeasonalCampaignCloningArgs = z
	.object({
		sourceProjectName: z
			.string()
			.describe("Name of the source project to clone from"),
		newCampaignName: z.string().describe("Name for the new campaign"),
		campaignType: z
			.string()
			.describe(
				"Type of campaign (e.g., 'Black Friday', 'Summer Sale', 'Holiday')",
			),
		modifications: z
			.string()
			.describe(
				"Changes to make (e.g., 'update dates to 2024, change discount to 30%')",
			),
		targetMarkets: z
			.string()
			.describe("Markets for this campaign (e.g., 'North America, Europe')"),
		launchDate: z.string().describe("Campaign launch date"),
	})
	.describe("Arguments for seasonal campaign cloning prompt");

export const EmergencyHotfixArgs = z
	.object({
		projectName: z.string().describe("Name of your Lokalise project"),
		issueDescription: z.string().describe("Description of the critical issue"),
		affectedContent: z
			.string()
			.describe(
				"What's affected (e.g., 'checkout flow', 'error messages', 'legal text')",
			),
		affectedLanguages: z
			.string()
			.describe("Affected languages (e.g., 'Spanish, French' or 'all')"),
		priority: z
			.string()
			.optional()
			.describe("Priority: 'critical', 'high', 'urgent' (default: critical)"),
		notifyList: z
			.string()
			.optional()
			.describe("Who to notify immediately (emails or group names)"),
	})
	.describe("Arguments for emergency hotfix prompt");

// ============================================================================
// New Workflow Prompts (Based on Requirements)
// ============================================================================

export const FileUploadReviewWorkflowArgs = z
	.object({
		projectName: z.string().describe("Name of your Lokalise project"),
		fileName: z.string().describe("Name or description of the uploaded file"),
		targetLanguages: z
			.string()
			.describe("Languages to translate to (e.g., 'Spanish, French, German')"),
		reviewerGroupName: z
			.string()
			.describe("Name of the reviewer group to assign tasks to"),
		automationSettings: z
			.string()
			.optional()
			.describe(
				"Automation to apply: 'TM only', 'MT only', 'TM+MT', 'none' (default: TM+MT)",
			),
		reviewDeadline: z
			.string()
			.optional()
			.describe(
				"When reviews should be complete (e.g., 'end of day', 'tomorrow')",
			),
	})
	.describe("Arguments for file upload and review workflow");

export const TeamTranslationSetupArgs = z
	.object({
		projectName: z.string().describe("Name of your Lokalise project"),
		teamStructure: z
			.string()
			.describe(
				"Describe your teams (e.g., 'EU team: German, French, Spanish | Asia team: Japanese, Chinese')",
			),
		workloadDistribution: z
			.string()
			.describe(
				"How to distribute work: 'by region', 'by language family', 'round-robin', 'by expertise'",
			),
		groupPermissions: z
			.string()
			.optional()
			.describe(
				"Permissions per group (e.g., 'EU: full access, Asia: translate only')",
			),
	})
	.describe("Arguments for team-based translation setup");

export const ProcessMonitoringDashboardArgs = z
	.object({
		projectNames: z
			.string()
			.optional()
			.describe(
				"Project names to monitor (comma-separated), or leave empty for all",
			),
		processTypes: z
			.string()
			.optional()
			.describe("Process types to monitor: 'uploads', 'downloads', 'all'"),
		includeCompleted: z
			.string()
			.optional()
			.describe(
				"Include completed processes in the report (true/false, default: false)",
			),
		alertOnFailures: z
			.string()
			.optional()
			.describe(
				"Highlight failed processes that need attention (true/false, default: true)",
			),
	})
	.describe("Arguments for process monitoring dashboard");

export const UserGroupAuditArgs = z
	.object({
		teamName: z.string().describe("Name of the team or 'all' for all teams"),
		auditScope: z
			.string()
			.describe(
				"What to audit: 'permissions', 'workload', 'project access', 'activity', 'all'",
			),
		reportFormat: z
			.string()
			.optional()
			.describe(
				"Report format: 'summary', 'detailed', 'actionable' (default: detailed)",
			),
		includeRecommendations: z
			.string()
			.optional()
			.describe(
				"Include recommendations for improvements (true/false, default: true)",
			),
	})
	.describe("Arguments for user group audit");

export const TranslationMemoryImportArgs = z
	.object({
		projectName: z.string().describe("Name of your Lokalise project"),
		importDescription: z
			.string()
			.describe(
				"Describe what you're importing (e.g., 'Q4 marketing content', 'Legacy app translations')",
			),
		sourceLanguage: z
			.string()
			.describe("Source language of the TM content (e.g., 'English')"),
		targetLanguages: z
			.string()
			.describe("Target languages in the TM (e.g., 'Spanish, French, German')"),
		autoApproveThreshold: z
			.string()
			.optional()
			.describe(
				"TM match percentage to auto-approve (100 = exact matches only, default: 100)",
			),
		conflictResolution: z
			.string()
			.optional()
			.describe(
				"How to handle conflicts: 'keep-existing', 'overwrite', 'review'",
			),
	})
	.describe("Arguments for translation memory import");

export const BulkOperationsMonitorArgs = z
	.object({
		projectName: z.string().describe("Name of your Lokalise project"),
		operationType: z
			.string()
			.describe(
				"Operations to monitor: 'all', 'keys', 'translations', 'tasks'",
			),
		timeframe: z
			.string()
			.optional()
			.describe(
				"Time period: 'last hour', 'today', 'this week', 'since [date]' (default: last hour)",
			),
		showDetails: z
			.string()
			.optional()
			.describe("Show detailed operation results (true/false, default: true)"),
	})
	.describe("Arguments for bulk operations monitoring");

export const TeamOnboardingWorkflowArgs = z
	.object({
		memberEmail: z.string().describe("Email address of the new team member"),
		memberName: z.string().describe("Full name of the team member"),
		role: z
			.string()
			.describe(
				"Their role: 'translator', 'reviewer', 'project manager', 'developer'",
			),
		languages: z
			.string()
			.describe("Languages they'll work with (e.g., 'Spanish, Portuguese')"),
		projects: z
			.string()
			.describe("Project names they'll have access to (comma-separated)"),
		groupMemberships: z
			.string()
			.optional()
			.describe("User groups to add them to (comma-separated names)"),
		sendWelcome: z
			.string()
			.optional()
			.describe(
				"Create a welcome task with getting started instructions (true/false, default: true)",
			),
	})
	.describe("Arguments for team member onboarding");

export const AutomatedReviewPipelineArgs = z
	.object({
		projectName: z.string().describe("Name of your Lokalise project"),
		sourceMaterial: z
			.string()
			.describe(
				"What needs review (e.g., 'newly uploaded files', 'machine translations', 'updated keys')",
			),
		reviewStages: z
			.string()
			.describe(
				"Review stages (e.g., 'linguistic review → technical review → final approval')",
			),
		assignmentStrategy: z
			.string()
			.describe(
				"How to assign: 'by language expertise', 'round-robin', 'workload-based'",
			),
		deadline: z
			.string()
			.optional()
			.describe(
				"When reviews should complete (e.g., 'end of week', 'December 15')",
			),
		escalationRules: z
			.string()
			.optional()
			.describe("Escalation if delayed (e.g., 'notify manager after 2 days')"),
	})
	.describe("Arguments for automated review pipeline setup");

// ============================================================================
// Type exports for use in prompts.ts
// ============================================================================

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

// New workflow types
export type FileUploadReviewWorkflowArgsType = z.infer<
	typeof FileUploadReviewWorkflowArgs
>;
export type TeamTranslationSetupArgsType = z.infer<
	typeof TeamTranslationSetupArgs
>;
export type ProcessMonitoringDashboardArgsType = z.infer<
	typeof ProcessMonitoringDashboardArgs
>;
export type UserGroupAuditArgsType = z.infer<typeof UserGroupAuditArgs>;
export type TranslationMemoryImportArgsType = z.infer<
	typeof TranslationMemoryImportArgs
>;
export type BulkOperationsMonitorArgsType = z.infer<
	typeof BulkOperationsMonitorArgs
>;
export type TeamOnboardingWorkflowArgsType = z.infer<
	typeof TeamOnboardingWorkflowArgs
>;
export type AutomatedReviewPipelineArgsType = z.infer<
	typeof AutomatedReviewPipelineArgs
>;
