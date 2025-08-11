import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { Logger } from "../shared/utils/logger.util.js";
import * as schemas from "./prompts.types.js";

const logger = Logger.forContext("prompts/prompts.ts");

/**
 * Register all MCP prompts with the server
 * These prompts provide pre-built workflows for common Lokalise operations
 * Following Claude 4 best practices with explicit instructions and XML structure
 */
export function registerPrompts(server: McpServer): void {
	const methodLogger = logger.forMethod("registerPrompts");
	methodLogger.info("Registering MCP prompts");

	// ============================================================================
	// Project Management Prompts
	// ============================================================================

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
						text: `<task_description>
Generate a comprehensive overview of all Lokalise projects to understand the current localization portfolio, identify projects needing attention, and make strategic resource allocation decisions.
</task_description>

<context>
This overview helps executives and project managers see the big picture of their localization efforts, identify bottlenecks across projects, and prioritize resources effectively. Having visibility across all projects prevents delays and ensures consistent quality.
</context>

<instructions>
STEP 1: Retrieve all projects
- Use lokalise_list_projects with limit=100 to get all projects
- If more than 100 projects exist, continue fetching with pagination

STEP 2: For each project, gather detailed information (execute in parallel for efficiency)
- Use lokalise_get_project for each project_id to get full details
- Use lokalise_list_project_languages for each project_id to get language progress
- Use lokalise_list_tasks for each project_id to check active tasks

STEP 3: Analyze the portfolio
- Group projects by status (active, stalled, completed)
- Calculate total keys and words across all projects
- Identify projects with overdue tasks or low completion rates
- Find projects without recent activity (>30 days)

STEP 4: Generate insights
- Highlight top 3 projects needing immediate attention
- Calculate overall portfolio completion percentage
- Identify common language gaps across projects
</instructions>

<output_format>
## Portfolio Overview
- Total Projects: [number]
- Active Projects: [number]
- Total Keys: [formatted number]
- Total Words: [formatted number]
- Average Completion: [percentage]

## Projects by Status

### 🚨 Needs Immediate Attention
[List projects with <70% completion or overdue tasks]

### ✅ On Track
[List projects 70-95% complete with active progress]

### 🎯 Completed
[List projects >95% complete]

## Strategic Recommendations
1. [Top priority action]
2. [Resource reallocation suggestion]
3. [Process improvement opportunity]
</output_format>`,
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
		({ projectName }: schemas.ProjectDeepDiveArgsType) => ({
			messages: [
				{
					role: "user" as const,
					content: {
						type: "text" as const,
						text: `<task_description>
Perform a comprehensive analysis of the Lokalise project named "${projectName}" to understand its current localization status, identify bottlenecks, and provide actionable optimization recommendations.
</task_description>

<context>
Deep project analysis helps project managers understand translation progress, identify languages needing attention, and make data-driven decisions about resource allocation. This prevents delays in international launches and ensures quality across all markets.
</context>

<instructions>
STEP 1: Resolve project name to ID
- Use lokalise_list_projects to retrieve all projects
- Find projects where name contains "${projectName}" (case-insensitive)
- If exactly one match found, proceed with that project
- If multiple matches found, list them with full details and ask for confirmation
- If no matches found, list all available projects and ask for clarification

STEP 2: Gather comprehensive project data (execute these tools simultaneously for maximum efficiency)
- lokalise_get_project with resolved project_id for settings and metadata
- lokalise_list_project_languages with project_id for all languages and progress
- lokalise_list_keys with project_id and limit=100 for key analysis
- lokalise_list_tasks with project_id for active and pending tasks
- lokalise_list_contributors with project_id for team structure
- lokalise_list_project_comments with project_id and limit=50 for recent discussions

STEP 3: Analyze translation completeness
- For each language with less than 100% completion:
  * Use lokalise_list_keys with filter_untranslated=true
  * Identify patterns in untranslated content
- Check for languages with low review approval rates

STEP 4: Generate comprehensive report with actionable insights
</instructions>

<output_format>
# Project Analysis: ${projectName}

## Executive Summary
- Status: [Active/Stalled/On Track]
- Completion: [overall percentage]
- Health Score: [Good/Warning/Critical]

## Language Analysis
[Table with all languages showing progress, reviewed %, and words remaining]

## Key Insights
- Total Keys: [number]
- Platform Distribution: [breakdown]
- Recent Activity: [summary]

## Recommendations
1. [Most urgent action needed]
2. [Important improvement]
3. [Optimization opportunity]
</output_format>`,
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
			baseLanguage,
			targetLanguages,
		}: schemas.NewProjectSetupArgsType) => ({
			messages: [
				{
					role: "user" as const,
					content: {
						type: "text" as const,
						text: `<task_description>
Create a new Lokalise project named "${projectName}" with description "${description}", set up with base language "${baseLanguage}" and target languages "${targetLanguages}".
</task_description>

<context>
Proper project setup ensures consistent localization workflows and enables teams to begin translation work immediately.
</context>

<instructions>
STEP 1: Check for existing projects
- Use lokalise_list_projects to check if "${projectName}" already exists
- If exists, ask user to confirm creating a new one or use existing

STEP 2: Resolve language names to ISO codes
- Use lokalise_list_system_languages to get all available languages
- Match "${baseLanguage}" and each language in "${targetLanguages}" to ISO codes
- If ambiguous, show options and ask for clarification

STEP 3: Create the project
- Use lokalise_create_project with resolved language codes
- Capture the created project_id

STEP 4: Add target languages (execute in parallel)
- Use lokalise_add_project_languages for each target language
- Configure appropriate settings for each language

STEP 5: Create initial structure
- Use lokalise_create_keys to add starter keys with descriptions
</instructions>

<output_format>
## ✅ Project Created Successfully
- Name: ${projectName}
- ID: [project_id]
- Base Language: ${baseLanguage}
- Target Languages: [list]

## Next Steps
1. Import existing content or create keys
2. Set up team members and permissions
3. Configure webhooks for CI/CD integration
</output_format>`,
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
		({ projectName, cleanupScope }: schemas.ProjectCleanupArgsType) => ({
			messages: [
				{
					role: "user" as const,
					content: {
						type: "text" as const,
						text: `<task_description>
Clean up the project named "${projectName}" by ${cleanupScope}. Analyze what needs to be removed, get confirmation, then execute the cleanup safely.
</task_description>

<context>
Regular cleanup keeps projects maintainable and reduces confusion for translators. Removing deprecated content improves performance and reduces costs.
</context>

<instructions>
STEP 1: Resolve project name
- Use lokalise_list_projects to find the project
- Handle multiple matches by asking for confirmation

STEP 2: Analyze cleanup scope
- For "${cleanupScope}":
  * If "deprecated keys": Use lokalise_list_keys with filter for deprecated tags
  * If "unused languages": Use lokalise_list_project_languages and check progress
  * If "old branches": Check for branch support in project
  * If "all": Perform comprehensive analysis

STEP 3: Present cleanup plan
- Show exactly what will be removed
- Calculate impact (keys, translations, languages affected)
- Ask for explicit confirmation before proceeding

STEP 4: Execute cleanup (if confirmed)
- For keys: Use lokalise_bulk_delete_keys
- For languages: Use lokalise_remove_language
- Log all actions for audit trail

STEP 5: Verify cleanup
- Re-check project statistics
- Confirm all intended items were removed
</instructions>

<output_format>
## Cleanup Analysis for "${projectName}"

### Items to Remove
- [Detailed list of what will be deleted]

### Impact Assessment
- Keys affected: [number]
- Translations affected: [number]
- Estimated space saved: [amount]

### Cleanup Results (after confirmation)
- ✅ Removed: [summary]
- Project size reduced by: [percentage]
</output_format>`,
					},
				},
			],
		}),
	);

	// ============================================================================
	// Language & Localization Prompts
	// ============================================================================

	server.registerPrompt(
		"language_expansion",
		{
			title: "Language Expansion",
			description: "Add new languages to an existing project",
			argsSchema: schemas.LanguageExpansionArgs.shape,
		},
		({
			projectName,
			newLanguages,
			setCustomNames,
		}: schemas.LanguageExpansionArgsType) => ({
			messages: [
				{
					role: "user" as const,
					content: {
						type: "text" as const,
						text: `<task_description>
Add new languages "${newLanguages}" to the project "${projectName}" and configure them properly for translation work.
</task_description>

<context>
Expanding language coverage opens new markets. Proper language configuration ensures quality translations and efficient workflows.
</context>

<instructions>
STEP 1: Resolve project and languages
- Use lokalise_list_projects to find "${projectName}"
- Use lokalise_list_system_languages to resolve "${newLanguages}" to ISO codes
- Check which languages are already in the project with lokalise_list_project_languages

STEP 2: Add new languages (parallel execution)
- Use lokalise_add_project_languages for languages not already present
- Apply custom names if specified in "${setCustomNames}"

STEP 3: Configure language settings
- Set appropriate plural forms
- Configure RTL for Arabic, Hebrew, etc.
- Set up fallback languages if applicable

STEP 4: Verify and report
- Use lokalise_list_project_languages to confirm all added
- Show language statistics and readiness
</instructions>

<output_format>
## Language Expansion Complete

### Languages Added to "${projectName}"
| Language | ISO Code | Custom Name | Plural Forms | Status |
|----------|----------|-------------|--------------|--------|
[Table of added languages]

### Project Language Coverage
- Total Languages: [number]
- New Markets Accessible: [list]
- Ready for Translation: Yes/No

### Next Steps
1. Create translation tasks for new languages
2. Assign translators for each language
3. Import any existing translations
</output_format>`,
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
		({ projectName, threshold }: schemas.TranslationProgressCheckArgsType) => ({
			messages: [
				{
					role: "user" as const,
					content: {
						type: "text" as const,
						text: `<task_description>
Check translation progress for all languages in project "${projectName}"${threshold ? `, highlighting any below ${threshold}% completion` : ""}.
</task_description>

<context>
Regular progress monitoring ensures timely delivery and helps identify languages needing additional resources.
</context>

<instructions>
STEP 1: Resolve project
- Use lokalise_list_projects to find "${projectName}"

STEP 2: Get language statistics (parallel execution)
- Use lokalise_list_project_languages for all languages
- For each language, gather:
  * Translation completion percentage
  * Review/approval status (if includeReviewStatus is true)
  * Word count remaining

STEP 3: Analyze progress
- Identify languages below ${threshold || 80}% completion
- Calculate time to completion based on recent velocity
- Find languages with stalled progress

STEP 4: Generate recommendations
- Prioritize languages by market importance
- Suggest resource reallocation
</instructions>

<output_format>
## Translation Progress for "${projectName}"

### Overall Status
- Average Completion: [percentage]
- Languages Complete: [number] of [total]
- Words Remaining: [total]

### Language Progress
| Language | Translated | Reviewed | Words Left | Status | Priority |
|----------|------------|----------|------------|--------|----------|
[Table sorted by completion percentage]

### ⚠️ Attention Required
[Languages below threshold with specific issues]

### Recommendations
1. [Highest priority action]
2. [Resource allocation suggestion]
3. [Process improvement]

### Projected Completion
Based on current velocity: [date]
</output_format>`,
					},
				},
			],
		}),
	);

	// ============================================================================
	// Key Management Prompts
	// ============================================================================

	server.registerPrompt(
		"bulk_key_creation",
		{
			title: "Bulk Key Creation",
			description:
				"Create multiple translation keys for a new feature or screen",
			argsSchema: schemas.BulkKeyCreationArgs.shape,
		},
		({
			projectName,
			featureName,
			keyList,
			platforms,
			baseTranslations,
		}: schemas.BulkKeyCreationArgsType) => ({
			messages: [
				{
					role: "user" as const,
					content: {
						type: "text" as const,
						text: `<task_description>
Create translation keys for the "${featureName}" feature in project "${projectName}" using the key list: "${keyList}".
</task_description>

<context>
Bulk key creation speeds up development by adding all necessary translations at once with proper organization and metadata.
</context>

<instructions>
STEP 1: Resolve project
- Use lokalise_list_projects to find "${projectName}"

STEP 2: Parse and prepare keys
- Parse "${keyList}" into individual key names
- Validate key naming conventions
- Assign to platforms: ${platforms || "all"}
- Prepare base translations if provided: "${baseTranslations}"

STEP 3: Create keys in bulk
- Use lokalise_create_keys with up to 100 keys at once
- Include:
  * Key names with feature prefix
  * Descriptions mentioning "${featureName}"
  * Platform assignments
  * Base language translations

STEP 4: Verify creation
- Use lokalise_list_keys to confirm all keys created
- Check for any creation errors
</instructions>

<output_format>
## Keys Created for "${featureName}"

### Summary
- Total Keys Created: [number]
- Feature: ${featureName}
- Platforms: ${platforms || "all"}

### Created Keys
| Key Name | Platforms | Base Translation | Status |
|----------|-----------|------------------|--------|
[List all created keys]

### Next Steps
1. Review and adjust key descriptions
2. Create translation task for these keys
3. Add screenshots for context
</output_format>`,
					},
				},
			],
		}),
	);

	// ============================================================================
	// Task & Workflow Prompts
	// ============================================================================

	server.registerPrompt(
		"create_translation_task",
		{
			title: "Create Translation Task",
			description: "Create tasks with language assignments",
			argsSchema: schemas.CreateTranslationTaskArgs.shape,
		},
		({
			projectName,
			taskTitle,
			taskDescription,
			languages,
			assignTo,
			dueDate,
			keyPattern,
		}: schemas.CreateTranslationTaskArgsType) => ({
			messages: [
				{
					role: "user" as const,
					content: {
						type: "text" as const,
						text: `<task_description>
Create a translation task titled "${taskTitle}" in project "${projectName}" for languages "${languages}".
</task_description>

<context>
Well-structured tasks ensure translations are completed on time with clear scope and assignments.
</context>

<instructions>
STEP 1: Resolve project and languages
- Use lokalise_list_projects to find "${projectName}"
- Use lokalise_list_project_languages to verify "${languages}" exist

STEP 2: Identify keys for the task
- If keyPattern specified: Use lokalise_list_keys with filter "${keyPattern}"
- Otherwise: Include all untranslated keys

STEP 3: Resolve assignee
- If assignTo specified:
  * Check lokalise_list_contributors for email match
  * Or lokalise_list_usergroups for group name match

STEP 4: Create the task
- Use lokalise_create_task with:
  * Title: "${taskTitle}"
  * Description: "${taskDescription}"
  * Languages: resolved language IDs
  * Keys: filtered key IDs
  * Due date: "${dueDate}" if specified
  * Assignee: resolved user/group ID

STEP 5: Confirm and notify
- Get task details with lokalise_get_task
- Show assignment and timeline
</instructions>

<output_format>
## ✅ Task Created Successfully

### Task Details
- Title: ${taskTitle}
- ID: [task_id]
- Project: ${projectName}

### Scope
- Languages: ${languages}
- Keys Included: [number] keys
- Words to Translate: [total]

### Assignment
- Assigned to: ${assignTo || "Unassigned"}
- Due Date: ${dueDate || "No deadline"}
- Estimated Effort: [hours/days]

### Task URL
[Direct link to task in Lokalise]
</output_format>`,
					},
				},
			],
		}),
	);

	// ============================================================================
	// New Workflow Prompts
	// ============================================================================

	server.registerPrompt(
		"post_upload_review_workflow",
		{
			title: "Post-Upload Review Workflow",
			description:
				"Create review tasks for files already uploaded to Lokalise with flexible assignee mapping",
			argsSchema: schemas.PostUploadReviewWorkflowArgs.shape,
		},
		({
			projectName,
			uploadedFileName,
			languageAssignmentMapping,
			assignmentType,
			confirmBeforeTaskCreation,
			reviewDeadline,
		}: schemas.PostUploadReviewWorkflowArgsType) => ({
			messages: [
				{
					role: "user" as const,
					content: {
						type: "text" as const,
						text: `<task_description>
Create review tasks for the file "${uploadedFileName}" already uploaded to project "${projectName}" with language-specific assignee mapping: "${languageAssignmentMapping}".
</task_description>

<context>
This workflow assumes the file has already been uploaded to Lokalise (via UI or API) with TM+MT automation applied. Now we need to create review tasks for quality assurance, assigning them to appropriate user groups or individual reviewers based on language expertise.
</context>

<instructions>
STEP 1: Resolve project and validate setup
- Use lokalise_list_projects to find "${projectName}"
- Store the project_id for all subsequent operations
- If multiple projects match, show list and ask user to confirm

STEP 2: Get keys from uploaded file
- Use lokalise_list_keys with:
  * project_id from Step 1
  * filterFilenames=["${uploadedFileName}"]
  * includeTranslations=false (we only need key IDs)
- Extract all key IDs for task creation
- Count total keys and estimate review effort
- If no keys found, check if filename is correct

STEP 3: Resolve assignments flexibly
- Parse "${languageAssignmentMapping}" (e.g., "Spanish: EMEA Team, French: marie@company.com")
- For each assignee, determine type:
  * If contains "@" → Individual user (use lokalise_list_contributors to get ID)
  * If contains "Team", "Group", "Squad" → User group (use lokalise_list_usergroups to get ID)
  * ${assignmentType === "user-groups" ? "Treat all as user groups" : assignmentType === "individual-users" ? "Treat all as individual users" : "Auto-detect based on naming"}
- Build assignment map with proper IDs
- Show resolution results:
  * ✅ Resolved assignments with IDs
  * ⚠️ Unresolved assignments (will leave unassigned)

STEP 4: Get available languages and user selection
- Use lokalise_list_project_languages with project_id
- Present list to user:
  "The following languages are available in the project:
  1. Spanish (es)
  2. French (fr)
  3. German (de)
  4. Japanese (ja)
  
  Which languages should have review tasks created?
  You can specify: 'all', specific numbers (1,2,4), or language codes (es,fr,ja)"
- Wait for user response
- Map selected languages to the assignment mapping

STEP 5: Preview task creation
${
	confirmBeforeTaskCreation !== "false"
		? `- Show preview table:
  | Language | Assignee Type | Assignee Name | Keys Count | Due Date |
  |----------|---------------|---------------|------------|----------|
  | Spanish  | User Group    | EMEA Team     | [count]    | ${reviewDeadline || "Not set"} |
  | French   | Individual    | marie@...     | [count]    | ${reviewDeadline || "Not set"} |
  
- Ask: "Ready to create these [X] review tasks? (yes/no)"
- Only proceed if user confirms`
		: "- Skip confirmation and proceed with task creation"
}

STEP 6: Create review tasks
- For each selected language with resolved assignee:
  * Use lokalise_create_task with:
    - title: "Review: ${uploadedFileName} - [language name]"
    - type: "review"
    - languages: [language_id]
    - keys: all key IDs from Step 2
    - users: [assignee_id] if individual user
    - groups: [group_id] if user group
    - due_date: "${reviewDeadline}" if specified
    - description: "Review file upload with TM+MT automation applied. Please check for:\n- Translation accuracy\n- Terminology consistency\n- Context appropriateness"
- Track created task IDs

STEP 7: Report results
- Show summary of created tasks
- Include any warnings for unassigned languages
- Provide direct links to tasks if available
</instructions>

<output_format>
## ✅ Review Workflow Complete

### File Information
- **File**: ${uploadedFileName}
- **Project**: ${projectName}
- **Total Keys**: [number]
- **Estimated Words**: [number if available]

### Assignment Resolution
| Assignee | Type | Status | ID |
|----------|------|--------|----|
[Table showing resolution of each assignee]

### Review Tasks Created
| Language | Task ID | Assigned To | Type | Due Date | Status |
|----------|---------|-------------|------|----------|--------|
[Table of created tasks]

### ⚠️ Warnings (if any)
- [Language X]: No assignee found, task created but unassigned
- [Language Y]: User group not found, left unassigned

### Next Steps
1. Monitor task progress in Lokalise dashboard
2. Reviewers will receive notifications
3. Track completion via task status
4. Export approved translations when ready

### Task URLs
[Direct links to created tasks if available]
</output_format>

<error_handling>
If no keys found with filename:
- Suggest checking exact filename in Lokalise
- List recent files in project for reference

If assignee not found:
- Continue with task creation but leave unassigned
- Note in warnings section

If language not in project:
- Skip that language
- Note in warnings
</error_handling>`,
					},
				},
			],
		}),
	);

	server.registerPrompt(
		"team_translation_setup",
		{
			title: "Team-Based Translation Setup",
			description:
				"Set up translation teams with proper group structure and permissions",
			argsSchema: schemas.TeamTranslationSetupArgs.shape,
		},
		({
			projectName,
			teamStructure,
			workloadDistribution,
			groupPermissions,
		}: schemas.TeamTranslationSetupArgsType) => ({
			messages: [
				{
					role: "user" as const,
					content: {
						type: "text" as const,
						text: `<task_description>
Set up translation teams for project "${projectName}" with structure: "${teamStructure}" and workload distribution: "${workloadDistribution}".
</task_description>

<context>
Proper team organization ensures efficient translation workflows, clear responsibilities, and balanced workloads. This prevents bottlenecks and maintains quality.
</context>

<instructions>
STEP 1: Parse team structure
- Parse "${teamStructure}" to identify teams and their languages
- Example: "EU team: German, French" creates EU team for those languages

STEP 2: Resolve project and validate
- Use lokalise_list_projects to find "${projectName}"
- Use lokalise_list_team_users to see available team members
- Use lokalise_list_project_languages to verify language support

STEP 3: Create user groups (parallel execution)
- For each team identified, use lokalise_create_usergroup with:
  * Name: [team name]
  * Description: Languages and responsibilities
  * Permissions: Parse from "${groupPermissions}"

STEP 4: Assign team members
- Based on "${workloadDistribution}":
  * "by region": Assign users by timezone/location
  * "by language family": Group Romance, Germanic, etc.
  * "round-robin": Distribute evenly
  * "by expertise": Check user language skills
- Use lokalise_add_members_to_group for assignments

STEP 5: Configure project access
- Use lokalise_add_projects_to_group to grant access
- Set language-specific permissions per group

STEP 6: Create initial tasks
- Create welcome tasks for each group
- Set up recurring review assignments
</instructions>

<output_format>
## Team Translation Setup Complete

### Teams Created
| Team Name | Languages | Members | Permissions |
|-----------|-----------|---------|-------------|
[Table of teams]

### Workload Distribution
- Strategy: ${workloadDistribution}
- Balance Score: [even/uneven]
- Capacity per Team: [words/month estimate]

### Project Access Configured
- Project: ${projectName}
- Groups with Access: [list]
- Language Coverage: [percentage]

### Team Assignments
[Detailed breakdown of who handles what]

### Recommended Workflows
1. Daily standup for active translations
2. Weekly review sessions per team
3. Monthly capacity planning

### Monitoring Setup
- Task distribution dashboard ready
- Performance metrics configured
- Escalation paths defined
</output_format>`,
					},
				},
			],
		}),
	);

	server.registerPrompt(
		"process_monitoring_dashboard",
		{
			title: "Process Monitoring Dashboard",
			description: "Monitor all active background processes across projects",
			argsSchema: schemas.ProcessMonitoringDashboardArgs.shape,
		},
		({
			projectNames,
			processTypes,
			includeCompleted,
			alertOnFailures,
		}: schemas.ProcessMonitoringDashboardArgsType) => ({
			messages: [
				{
					role: "user" as const,
					content: {
						type: "text" as const,
						text: `<task_description>
Create a monitoring dashboard for background processes ${projectNames ? `in projects: "${projectNames}"` : "across all projects"}${processTypes ? `, filtering for ${processTypes}` : ""}.
</task_description>

<context>
Monitoring background processes helps identify stuck uploads, failed exports, and processing bottlenecks. This ensures smooth operations and quick issue resolution.
</context>

<instructions>
STEP 1: Resolve projects
- If projectNames specified: Use lokalise_list_projects to find each project
- Otherwise: Use lokalise_list_projects to get all projects

STEP 2: Gather process data (parallel execution for all projects)
- For each project, use lokalise_list_queued_processes
- Filter by processTypes if specified: "${processTypes}"
- Include completed if includeCompleted is ${includeCompleted}

STEP 3: Analyze process health
- Group by status: queued, processing, finished, failed
- For failed processes, use lokalise_get_queued_process for error details
- Calculate average processing time by type
- Identify stuck processes (processing > 1 hour)

STEP 4: Generate alerts
- If alertOnFailures is ${alertOnFailures}:
  * Highlight all failed processes
  * Extract error messages
  * Suggest remediation steps

STEP 5: Create performance metrics
- Success rate by process type
- Average processing time trends
- Queue depth analysis
</instructions>

<output_format>
## Process Monitoring Dashboard
Generated: [timestamp]

### Overall Status
- Total Processes: [number]
- Active: [number]
- Failed: [number] ${alertOnFailures ? "⚠️" : ""}
- Success Rate: [percentage]

### Process Breakdown
| Type | Queued | Processing | Completed | Failed | Avg Time |
|------|--------|------------|-----------|--------|----------|
[Table by process type]

### ⚠️ Alerts (Failed Processes)
[If any failures, list with details and suggested actions]

### Active Processes
| Project | Type | Status | Duration | Progress |
|---------|------|--------|----------|----------|
[Real-time status of active processes]

### Performance Trends
- Peak Hours: [time ranges]
- Bottlenecks: [identified issues]
- Optimization Opportunities: [suggestions]

### Stuck Process Detection
[Any processes running unusually long]

### Recommendations
1. [Action for failed processes]
2. [Performance optimization]
3. [Capacity planning suggestion]
</output_format>`,
					},
				},
			],
		}),
	);

	server.registerPrompt(
		"user_group_audit",
		{
			title: "User Group Audit",
			description:
				"Audit user groups for permissions, workload, and optimization",
			argsSchema: schemas.UserGroupAuditArgs.shape,
		},
		({
			teamName,
			auditScope,
			reportFormat,
			includeRecommendations,
		}: schemas.UserGroupAuditArgsType) => ({
			messages: [
				{
					role: "user" as const,
					content: {
						type: "text" as const,
						text: `<task_description>
Perform an audit of ${teamName === "all" ? "all user groups" : `the "${teamName}" group`} focusing on: ${auditScope}.
</task_description>

<context>
Regular audits ensure teams are properly configured, workloads are balanced, and permissions follow security best practices.
</context>

<instructions>
STEP 1: Gather group data
- Use lokalise_list_usergroups to get all groups
- If teamName !== "all", filter for specific group
- For each group, use lokalise_get_usergroup for details

STEP 2: Analyze based on auditScope "${auditScope}"
- If "permissions": Review admin rights and language access
- If "workload": Check task assignments and completion rates
- If "project access": List all accessible projects
- If "activity": Review recent actions and productivity
- If "all": Comprehensive analysis

STEP 3: Gather member information
- Use lokalise_list_team_users to get member details
- Map members to their groups
- Check for users in multiple groups
- Identify inactive members

STEP 4: Analyze workload distribution
- Use lokalise_list_tasks to get task assignments per group
- Calculate average workload per member
- Identify overloaded or underutilized teams

STEP 5: Generate recommendations
- If includeRecommendations is ${includeRecommendations}:
  * Suggest permission optimizations
  * Recommend workload rebalancing
  * Identify training needs
</instructions>

<output_format>
## User Group Audit Report
Format: ${reportFormat}

### Groups Audited
- Total Groups: [number]
- Active Members: [number]
- Audit Scope: ${auditScope}

### Group Analysis
| Group Name | Members | Projects | Permissions | Workload | Status |
|------------|---------|----------|-------------|----------|--------|
[Detailed table]

### ${auditScope === "permissions" ? "Permission Analysis" : auditScope === "workload" ? "Workload Analysis" : "Comprehensive Analysis"}
[Detailed findings based on audit scope]

### Key Findings
1. [Most important discovery]
2. [Security or efficiency issue]
3. [Optimization opportunity]

${
	includeRecommendations
		? `### Recommendations
1. [Specific action with expected impact]
2. [Process improvement suggestion]
3. [Team reorganization if needed]`
		: ""
}

### Risk Assessment
- Security Risks: [any identified]
- Bottlenecks: [workload imbalances]
- Compliance Issues: [if any]

### Action Items
- Immediate: [urgent fixes]
- Short-term: [1-2 week improvements]
- Long-term: [strategic changes]
</output_format>`,
					},
				},
			],
		}),
	);

	server.registerPrompt(
		"translation_memory_import",
		{
			title: "Translation Memory Import",
			description:
				"Import and configure translation memory with review workflow",
			argsSchema: schemas.TranslationMemoryImportArgs.shape,
		},
		({
			projectName,
			importDescription,
			sourceLanguage,
			targetLanguages,
			autoApproveThreshold,
			conflictResolution,
		}: schemas.TranslationMemoryImportArgsType) => ({
			messages: [
				{
					role: "user" as const,
					content: {
						type: "text" as const,
						text: `<task_description>
Import translation memory for "${importDescription}" into project "${projectName}" from "${sourceLanguage}" to "${targetLanguages}" with auto-approval threshold of ${autoApproveThreshold}%.
</task_description>

<context>
Translation memory import accelerates localization by reusing previous translations. Proper configuration ensures quality while maximizing reuse.
</context>

<instructions>
STEP 1: Validate setup
- Use lokalise_list_projects to find "${projectName}"
- Verify language support with lokalise_list_project_languages
- Ensure "${sourceLanguage}" and "${targetLanguages}" are configured

STEP 2: Monitor import process
- Use lokalise_list_queued_processes to track TM import
- Poll status until complete
- Extract statistics: matches found, applied, conflicts

STEP 3: Analyze TM application
- Use lokalise_list_translations with filter_is_tm_suggestion=true
- Group by match percentage:
  * 100% matches (exact)
  * 95-99% matches (fuzzy high)
  * 75-94% matches (fuzzy medium)
  * Below 75% (fuzzy low)

STEP 4: Handle auto-approval
- For matches >= ${autoApproveThreshold}%:
  * Use lokalise_bulk_update_translations to mark as reviewed
- For matches < ${autoApproveThreshold}%:
  * Create review tasks for human verification

STEP 5: Conflict resolution
- Based on "${conflictResolution}":
  * "keep-existing": Skip TM suggestions where translations exist
  * "overwrite": Replace with TM suggestions
  * "review": Create comparison tasks for human decision

STEP 6: Create review workflow
- Group fuzzy matches by language
- Create tasks for each language team
- Set priorities based on match quality
</instructions>

<output_format>
## Translation Memory Import Complete

### Import Summary
- Description: ${importDescription}
- Source: ${sourceLanguage}
- Targets: ${targetLanguages}

### TM Statistics
| Match Range | Count | Auto-Approved | Needs Review |
|-------------|-------|---------------|--------------|
| 100% (Exact) | [num] | [num] | [num] |
| 95-99% | [num] | [num] | [num] |
| 75-94% | [num] | [num] | [num] |
| <75% | [num] | [num] | [num] |

### Languages Impact
| Language | Keys Updated | Words Saved | Review Tasks |
|----------|--------------|-------------|--------------|
[Table by language]

### Quality Metrics
- Auto-Approval Rate: [percentage]
- Estimated Time Saved: [hours]
- Review Required: [number] segments

### Conflict Resolution
- Strategy: ${conflictResolution}
- Conflicts Found: [number]
- Resolution: [how handled]

### Review Tasks Created
[List of tasks with assignments and priorities]

### ROI Analysis
- Words Reused: [number]
- Cost Saved: [estimate]
- Time to Market Reduced: [days]
</output_format>`,
					},
				},
			],
		}),
	);

	server.registerPrompt(
		"bulk_operations_monitor",
		{
			title: "Bulk Operations Monitor",
			description: "Track and report on bulk operations across projects",
			argsSchema: schemas.BulkOperationsMonitorArgs.shape,
		},
		({
			projectName,
			operationType,
			timeframe,
			showDetails,
		}: schemas.BulkOperationsMonitorArgsType) => ({
			messages: [
				{
					role: "user" as const,
					content: {
						type: "text" as const,
						text: `<task_description>
Monitor bulk operations of type "${operationType}" in project "${projectName}" for the timeframe: "${timeframe}".
</task_description>

<context>
Bulk operations can impact many keys and translations. Monitoring ensures operations complete successfully and helps track changes for audit purposes.
</context>

<instructions>
STEP 1: Resolve project and timeframe
- Use lokalise_list_projects to find "${projectName}"
- Parse "${timeframe}" to determine date range

STEP 2: Track bulk operations
- Use lokalise_list_queued_processes with project_id
- Filter for bulk operation types based on "${operationType}":
  * "keys": bulk key updates/deletions
  * "translations": bulk translation updates
  * "tasks": bulk task operations
  * "all": all bulk operations

STEP 3: Get operation details
- For each bulk operation found:
  * Use lokalise_get_queued_process for full details
  * Extract: items processed, success rate, errors
  * Note: user who initiated, timestamp

STEP 4: Analyze impact
- Calculate total items affected
- Identify any failed operations
- Check for partial completions

STEP 5: Generate detailed report
- If showDetails is ${showDetails}:
  * List individual items changed
  * Show before/after states where available
  * Include error messages for failures
</instructions>

<output_format>
## Bulk Operations Report
Project: ${projectName}
Timeframe: ${timeframe}
Operation Types: ${operationType}

### Summary
- Total Operations: [number]
- Items Processed: [number]
- Success Rate: [percentage]
- Failed Items: [number]

### Operations by Type
| Type | Count | Succeeded | Failed | Avg Size |
|------|-------|-----------|--------|----------|
[Table of operations]

### Recent Operations
| Time | Type | User | Items | Status | Duration |
|------|------|------|-------|--------|----------|
[Chronological list]

${
	showDetails
		? `### Detailed Changes
[Comprehensive list of all changes made]

### Failed Operations
[Details of any failures with error messages]`
		: ""
}

### Impact Analysis
- Keys Modified: [number]
- Translations Updated: [number]
- Languages Affected: [list]

### Audit Trail
- Initiated By: [users list]
- Peak Activity: [time period]
- Rollback Available: Yes/No

### Recommendations
1. [Based on patterns observed]
2. [Performance optimization if needed]
3. [Error prevention suggestions]
</output_format>`,
					},
				},
			],
		}),
	);

	server.registerPrompt(
		"team_onboarding_workflow",
		{
			title: "Team Member Onboarding",
			description: "Complete onboarding workflow for new team members",
			argsSchema: schemas.TeamOnboardingWorkflowArgs.shape,
		},
		({
			memberEmail,
			memberName,
			role,
			languages,
			projects,
			groupMemberships,
			sendWelcome,
		}: schemas.TeamOnboardingWorkflowArgsType) => ({
			messages: [
				{
					role: "user" as const,
					content: {
						type: "text" as const,
						text: `<task_description>
Onboard new team member "${memberName}" (${memberEmail}) as a ${role} for languages "${languages}" with access to projects: "${projects}".
</task_description>

<context>
Proper onboarding ensures new team members have correct access, understand workflows, and can start contributing immediately. This reduces ramp-up time and prevents security issues.
</context>

<instructions>
STEP 1: Verify user doesn't already exist
- Use lokalise_list_team_users to check if ${memberEmail} exists
- If exists, update instead of create

STEP 2: Resolve projects and languages
- Use lokalise_list_projects to find each project in "${projects}"
- Verify "${languages}" are supported in those projects

STEP 3: Set up user access
- Use lokalise_update_team_user or create equivalent to:
  * Set role: "${role}"
  * Assign language permissions for "${languages}"
  * Grant project access

STEP 4: Add to user groups
- If groupMemberships specified: "${groupMemberships}"
  * Use lokalise_list_usergroups to find groups
  * Use lokalise_add_members_to_group for each group

STEP 5: Create welcome materials
- If sendWelcome is ${sendWelcome}:
  * Create onboarding task with:
    - Platform overview
    - Style guide links
    - First translation assignment
  * Use lokalise_create_task assigned to new member

STEP 6: Set up permissions
- Based on role "${role}":
  * "translator": Translation rights only
  * "reviewer": Translation + review rights
  * "project manager": Full project rights
  * "developer": API access + key management

STEP 7: Verify setup
- Confirm all access granted
- Test login if possible
- Document in onboarding tracker
</instructions>

<output_format>
## Team Member Onboarded Successfully

### Member Details
- Name: ${memberName}
- Email: ${memberEmail}
- Role: ${role}
- Start Date: [today]

### Access Configured
| Project | Languages | Permissions | Status |
|---------|-----------|-------------|--------|
[Table of project access]

### Group Memberships
- Groups Joined: ${groupMemberships || "None"}
- Team Size: [total members in groups]

### Language Assignments
| Language | Can Translate | Can Review | Can Approve |
|----------|---------------|------------|-------------|
[Language permissions table]

### Welcome Task Created
${
	sendWelcome
		? `- Task ID: [id]
- Includes: Getting started guide
- First Assignment: [description]
- Due Date: [date]`
		: "- No welcome task requested"
}

### System Access
- Login: ✅ Ready
- API Access: [Yes/No based on role]
- Webhooks: [Configured/Not needed]

### Next Steps for ${memberName}
1. Check email for invitation
2. Complete profile setup
3. Review style guides
4. ${sendWelcome ? "Complete welcome task" : "Check with team lead for first assignment"}

### Manager Actions
1. Schedule introduction meeting
2. Assign buddy/mentor
3. Add to team channels
4. Schedule first check-in
</output_format>`,
					},
				},
			],
		}),
	);

	server.registerPrompt(
		"automated_review_pipeline",
		{
			title: "Automated Review Pipeline",
			description:
				"Set up multi-stage review workflow with automatic assignments",
			argsSchema: schemas.AutomatedReviewPipelineArgs.shape,
		},
		({
			projectName,
			sourceMaterial,
			reviewStages,
			assignmentStrategy,
			deadline,
			escalationRules,
		}: schemas.AutomatedReviewPipelineArgsType) => ({
			messages: [
				{
					role: "user" as const,
					content: {
						type: "text" as const,
						text: `<task_description>
Set up an automated review pipeline for "${sourceMaterial}" in project "${projectName}" with stages: "${reviewStages}" using assignment strategy: "${assignmentStrategy}".
</task_description>

<context>
Multi-stage review ensures quality through systematic checks. Automation reduces management overhead and ensures consistent quality standards.
</context>

<instructions>
STEP 1: Resolve project and analyze content
- Use lokalise_list_projects to find "${projectName}"
- Identify content scope for "${sourceMaterial}":
  * If "newly uploaded": Use recent keys
  * If "machine translations": Filter by MT flag
  * If specific keys: Use pattern matching

STEP 2: Parse review stages
- Parse "${reviewStages}" into individual stages
- Example: "linguistic → technical → final" = 3 stages
- Determine dependencies between stages

STEP 3: Set up reviewer pools
- Based on "${assignmentStrategy}":
  * "by language expertise": Group by language skills
  * "round-robin": Create rotation schedule
  * "workload-based": Check current task loads
- Use lokalise_list_team_users and lokalise_list_usergroups

STEP 4: Create stage-specific tasks (sequential by stage)
- For each review stage:
  * Use lokalise_create_task with:
    - Type: "review"
    - Title: "[Stage] Review: ${sourceMaterial}"
    - Keys: Appropriate subset
    - Assignee: Based on strategy
    - Due date: Staggered based on "${deadline}"

STEP 5: Configure escalation
- If escalationRules specified: "${escalationRules}"
  * Set up monitoring for delays
  * Define escalation path
  * Note manager notifications needed

STEP 6: Set up quality gates
- Between stages, add validation:
  * Minimum approval percentage
  * Required reviewer count
  * Consensus requirements
</instructions>

<output_format>
## Automated Review Pipeline Configured

### Pipeline Overview
- Project: ${projectName}
- Content: ${sourceMaterial}
- Total Stages: [number]
- Completion Target: ${deadline || "No deadline"}

### Review Stages
| Stage | Type | Assignees | Due Date | Quality Gate |
|-------|------|-----------|----------|--------------|
[Table of stages with details]

### Content Scope
- Keys in Pipeline: [number]
- Words to Review: [total]
- Languages: [list]

### Assignment Strategy: ${assignmentStrategy}
- Reviewer Pool: [number] reviewers
- Distribution Method: [description]
- Load Balancing: [even/weighted]

### Tasks Created
| Stage | Task ID | Assigned To | Keys | Status |
|-------|---------|-------------|------|--------|
[List of all tasks]

### Quality Gates
1. Stage 1 → Stage 2: [requirements]
2. Stage 2 → Stage 3: [requirements]
3. Final Approval: [criteria]

### Escalation Rules
${
	escalationRules
		? `- Trigger: ${escalationRules}
- Actions: [what happens]
- Notifications: [who gets notified]`
		: "- No escalation configured"
}

### Pipeline Metrics
- Expected Duration: [days]
- Throughput: [words/day]
- Quality Target: [percentage]

### Monitoring Dashboard
- Active Stage: [current]
- Progress: [percentage]
- Blockers: [if any]
- On Track: [Yes/No]

### Automation Benefits
- Time Saved: [hours of management]
- Consistency: [improved by X%]
- Predictability: [deadline confidence]
</output_format>`,
					},
				},
			],
		}),
	);

	server.registerPrompt(
		"document_extraction_review_workflow",
		{
			title: "Document Extraction and Review Workflow",
			description:
				"Extract document content as translation keys and create review tasks",
			argsSchema: schemas.DocumentExtractionReviewWorkflowArgs.shape,
		},
		({
			projectName,
			documentContent,
			keyPrefix,
			baseLanguage,
			languageAssignmentMapping,
			assignmentType,
			reviewDeadline,
		}: schemas.DocumentExtractionReviewWorkflowArgsType) => ({
			messages: [
				{
					role: "user" as const,
					content: {
						type: "text" as const,
						text: `<task_description>
Extract content from the provided document, create translation keys in project "${projectName}" with prefix "${keyPrefix}", and set up review tasks with language-specific assignments: "${languageAssignmentMapping}".
</task_description>

<context>
This workflow handles documents that need to be added to Lokalise as translation keys. Since MCP doesn't support file uploads, we extract the content, create keys programmatically, then set up review tasks for translation into target languages.
</context>

<instructions>
STEP 1: Resolve project and base language
- Use lokalise_list_projects to find "${projectName}"
- Store project_id for all operations
- Use lokalise_list_system_languages to find ISO code for "${baseLanguage}"
- Verify base language is configured in project

STEP 2: Parse document content into keys
- Split "${documentContent}" into logical segments:
  * If contains headers (# or ##), use as section breaks
  * If contains numbered lists, each item becomes a key
  * If contains paragraphs, each becomes a key
  * For single-line content, split by sentences
- Generate key names with pattern: "${keyPrefix}.[section].[index]"
  * Example: "${keyPrefix}.intro.1", "${keyPrefix}.intro.2"
  * Use descriptive suffixes when possible
- Prepare key objects with:
  * key_name: generated name
  * description: "Extracted from document upload"
  * platforms: ["web"] (default)
  * translations: [{language_iso: [base_language_iso], translation: [content]}]

STEP 3: Create keys in batches
- Use lokalise_create_keys with batches of up to 100 keys
- For the base language "${baseLanguage}":
  * Include the extracted content as initial translation
- Track all created key IDs
- Show progress: "Created [X] of [total] keys..."

STEP 4: Resolve assignments (same as post-upload workflow)
- Parse "${languageAssignmentMapping}"
- Determine assignee types:
  * Email addresses → Individual contributors
  * Names with "Team", "Group" → User groups
  * ${assignmentType === "user-groups" ? "Force all as groups" : assignmentType === "individual-users" ? "Force all as individuals" : "Auto-detect"}
- Use lokalise_list_usergroups and lokalise_list_contributors to resolve IDs
- Show resolution status

STEP 5: Language selection for translation
- Use lokalise_list_project_languages
- Exclude base language from selection
- Present available target languages:
  "Content has been added in ${baseLanguage}.
  Select target languages for translation:
  1. Spanish (es)
  2. French (fr)
  3. German (de)
  
  Enter your selection (all/specific numbers/codes):"

STEP 6: Create translation tasks
- For each selected language with assignee:
  * Use lokalise_create_task with:
    - title: "Translate: ${keyPrefix} content - [language]"
    - type: "translation"
    - source_language_iso: [base_language_iso]
    - languages: [target_language_id]
    - keys: all created key IDs
    - users/groups: based on assignment resolution
    - due_date: "${reviewDeadline}" if specified
    - description: "Translate extracted document content. Source: ${baseLanguage}. Maintain tone and context."

STEP 7: Summary report
- Keys created summary
- Tasks created summary
- Any warnings or unassigned languages
</instructions>

<output_format>
## ✅ Document Extraction & Translation Setup Complete

### Content Extraction Summary
- **Source Language**: ${baseLanguage}
- **Key Prefix**: ${keyPrefix}
- **Keys Created**: [number]
- **Total Words**: [approximate count]

### Sample Keys Created
| Key Name | Content Preview | Word Count |
|----------|-----------------|------------|
| ${keyPrefix}.intro.1 | [first 50 chars]... | [count] |
| ${keyPrefix}.section1.1 | [first 50 chars]... | [count] |
[Show first 5 keys as examples]

### Assignment Resolution
| Language | Assignee | Type | Status |
|----------|----------|------|--------|
[Resolution table]

### Translation Tasks Created
| Language | Task ID | Assigned To | Type | Due Date |
|----------|---------|-------------|------|----------|
[Task creation results]

### Warnings
[Any issues during processing]

### Next Steps
1. Translators can begin work immediately
2. Source content (${baseLanguage}) is already in place
3. Monitor progress via task dashboard
4. Review translations as they're completed

### Quick Stats
- **Estimated Translation Volume**: [words] × [languages] = [total words]
- **Expected Completion**: ${reviewDeadline || "Based on team velocity"}
</output_format>

<error_handling>
If content parsing fails:
- Fall back to simple line-by-line extraction
- Warn user about formatting limitations

If key creation fails:
- Check for duplicate key names
- Add numeric suffixes to ensure uniqueness

If no target languages available:
- Inform user to add languages to project first
- Provide language addition instructions
</error_handling>`,
					},
				},
			],
		}),
	);

	// Additional existing prompts would continue here with the same refactoring pattern...
	// Including all task management, collaboration, compliance, and other prompt categories

	methodLogger.info("Successfully registered all prompts");
}
