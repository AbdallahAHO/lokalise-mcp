# Lokalise MCP Server - Implementation Checklist

> **Canonical Reference**: This document serves as the single source of truth for all agents implementing Lokalise MCP tools. It contains exact API methods, parameter types, implementation requirements, and step-by-step instructions.

## Executive Summary

The Lokalise MCP Server provides AI assistants with comprehensive access to Lokalise's localization platform through the Model Context Protocol. This production-ready implementation enables natural language interactions with translation management systems, supporting both STDIO and HTTP transports.

**Key Capabilities:**
- \ud83c\udf10 **Multi-Domain Support**: 11 fully implemented domains covering core localization workflows
- \ud83d\udd27 **59 MCP Tools**: Comprehensive toolset for project, key, translation, and team management
- \ud83d\udcc2 **21 MCP Resources**: Direct data access via URI patterns for efficient operations
- \ud83e\udd16 **17 Workflow Prompts**: Pre-built automation for complex multi-step operations
- \ud83d\ude80 **Auto-Discovery Architecture**: Zero-touch domain registration with filesystem scanning
- \ud83d\udd12 **Enterprise Ready**: Multi-source configuration, comprehensive error handling, session logging

## Quick Start

```bash
# Install dependencies
npm install

# Configure API key
export LOKALISE_API_KEY="your-api-key-here"

# Run MCP server (HTTP mode - default)
npm run mcp:http

# Run MCP server (STDIO mode)
npm run mcp:stdio

# Use CLI directly
npm run cli -- list-projects --limit 10
```

## Table of Contents

- [Current Implementation Status](#current-implementation-status)
- [Implementation Statistics](#implementation-statistics)
- [Architecture Overview](#architecture-overview)
- [Complete Tool Reference](#complete-tool-reference)
- [MCP Resources](#mcp-resources)
- [Workflow Prompts](#workflow-prompts)
- [Implementation Templates](#implementation-templates)
- [Testing Requirements](#testing-requirements)
- [Common Patterns](#common-patterns)

---

## Current Implementation Status

### 📊 **Implementation Statistics**
- **11** Fully Implemented Domains
- **59** MCP Tools (verified via code scan)
- **21** MCP Resources (verified via code scan)
- **17** Workflow Prompts (verified via code scan)
- **2** Transport Modes (STDIO, HTTP)

### ✅ **Fully Implemented Collections (11 domains)**

1. **Projects** (6 tools, 2 resources)
   - `lokalise_list_projects` - List all projects with stats
   - `lokalise_get_project` - Get detailed project info
   - `lokalise_create_project` - Create new projects
   - `lokalise_update_project` - Update project settings
   - `lokalise_delete_project` - Delete projects
   - `lokalise_empty_project` - Clear all keys/translations

2. **Keys** (7 tools, 2 resources) - **Enhanced with filterFilenames**
   - `lokalise_list_keys` - List keys with cursor pagination and **NEW: filterFilenames**
   - `lokalise_get_key` - Get key details and translations
   - `lokalise_create_keys` - Bulk create up to 1000 keys
   - `lokalise_update_key` - Update single key
   - `lokalise_bulk_update_keys` - Update multiple keys
   - `lokalise_delete_key` - Delete single key
   - `lokalise_bulk_delete_keys` - Delete multiple keys

3. **Languages** (6 tools, 2 resources)
   - `lokalise_list_system_languages` - Browse available languages
   - `lokalise_list_project_languages` - Get project languages
   - `lokalise_add_project_languages` - Add languages to project
   - `lokalise_get_language` - Get language details
   - `lokalise_update_language` - Update language settings
   - `lokalise_remove_language` - Remove project language

4. **Translations** (4 tools, 2 resources)
   - `lokalise_list_translations` - List with cursor pagination
   - `lokalise_get_translation` - Get translation details
   - `lokalise_update_translation` - Update translation content
   - `lokalise_bulk_update_translations` - Bulk update with rate limiting

5. **Tasks** (5 tools, 2 resources)
   - `lokalise_list_tasks` - List and filter tasks
   - `lokalise_get_task` - Get task details
   - `lokalise_create_task` - Create translation tasks
   - `lokalise_update_task` - Update task properties
   - `lokalise_delete_task` - Delete tasks

6. **Contributors** (6 tools, 2 resources)
   - `lokalise_list_contributors` - List project contributors
   - `lokalise_get_contributor` - Get contributor details
   - `lokalise_add_contributors` - Add contributors to project
   - `lokalise_get_current_user` - Get current user info
   - `lokalise_update_contributor` - Update permissions
   - `lokalise_remove_contributor` - Remove from project

7. **Comments** (5 tools, 2 resources)
   - `lokalise_list_key_comments` - Comments for specific key
   - `lokalise_list_project_comments` - All project comments
   - `lokalise_get_comment` - Get comment details
   - `lokalise_create_comments` - Create comments
   - `lokalise_delete_comment` - Delete comments

8. **Glossary** (5 tools, 2 resources)
   - `lokalise_list_glossary_terms` - List glossary terms
   - `lokalise_create_glossary_terms` - Create terms
   - `lokalise_get_glossary_term` - Get term details
   - `lokalise_update_glossary_term` - Update terms
   - `lokalise_delete_glossary_term` - Delete terms

9. **User Groups** (9 tools, 2 resources) - **NEW**
   - `lokalise_list_usergroups` - List all user groups
   - `lokalise_get_usergroup` - Get group details
   - `lokalise_create_usergroup` - Create new group
   - `lokalise_update_usergroup` - Update group settings
   - `lokalise_delete_usergroup` - Delete group
   - `lokalise_add_usergroup_members` - Add members
   - `lokalise_remove_usergroup_members` - Remove members
   - `lokalise_list_usergroup_members` - List members
   - `lokalise_add_usergroup_projects` - Assign to projects

10. **Team Users** (4 tools, 2 resources) - **NEW**
    - `lokalise_list_teamusers` - List workspace users
    - `lokalise_get_teamuser` - Get user details
    - `lokalise_update_teamuser` - Update user role
    - `lokalise_delete_teamuser` - Remove from workspace

11. **Queued Processes** (2 tools, 1 resource) - **NEW**
    - `lokalise_list_queued_processes` - List background processes
    - `lokalise_get_queued_process` - Get process status

### ❌ **Unimplemented Collections (14 remaining)**
Files, Screenshots, Branches, Webhooks, Teams, Snapshots, Orders, Translation Providers, Translation Statuses, Permission Templates, Payment Cards, Team User Billing Details, JWT, Segments

### 📈 **Implementation Progress**
- **Domains Completed**: 11 of 25 (44%)
- **API Coverage**: Core localization features fully implemented
- **MCP Tools**: 59 operational tools covering essential workflows
- **MCP Resources**: 21 resources for direct data access
- **Workflow Automation**: 17 prompt-based workflows for complex operations

---

## Architecture Overview

### **Auto-Discovery Domain Architecture**
```
src/
├── cli/
│   └── index.ts                       # CLI orchestrator with auto-discovery
├── domains/                           # Domain-driven feature modules
│   ├── index.ts                       # Master domain barrel (registerAllTools/CLI/Resources)
│   ├── registry.ts                    # Auto-discovery registry system
│   └── {domain}/                      # Each domain folder
│       ├── index.ts                   # Domain barrel exports
│       ├── {domain}.cli.ts            # CLI commands (implements DomainCli)
│       ├── {domain}.tool.ts           # MCP tools (implements DomainTool)
│       ├── {domain}.resource.ts       # MCP resources (implements DomainResource)
│       ├── {domain}.controller.ts     # Business logic orchestration
│       ├── {domain}.formatter.ts      # Response formatting
│       ├── {domain}.service.ts        # API service layer
│       └── {domain}.types.ts          # Domain-specific types
├── prompts/                           # Workflow automation prompts
│   ├── prompts.ts                     # Prompt registration
│   └── prompts.types.ts               # Prompt argument schemas
├── shared/                            # Cross-cutting concerns
│   ├── types/
│   │   ├── common.types.ts            # Common types
│   │   └── domain.types.ts            # Domain interfaces
│   └── utils/                         # Shared utilities
└── index.ts                           # Server entry point
```

### **Domain Interface Requirements**
- **Tools**: Must implement `DomainTool` interface with `registerTools(server: McpServer)` method
- **CLI**: Must implement `DomainCli` interface with `register(program: Command)` method
- **Resources**: Must implement `DomainResource` interface with `registerResources(server: McpServer)` method
- **Auto-Discovery**: Domains automatically discovered by filesystem scanning

### **Naming Conventions**
- **MCP Tool Names**: `snake_case` (e.g., `lokalise_list_keys`)
- **MCP Resource Names**: `kebab-case` (e.g., `lokalise-project-keys`)
- **CLI Commands**: `kebab-case` (e.g., `list-keys`)
- **Function Parameters**: `camelCase` (e.g., `projectId`, `filterFilenames`)
- **Domain Names**: `lowercase` (e.g., `keys`, `usergroups`)

---

## Complete Tool Reference

### Projects Domain (6 tools)
| Tool | Description | Key Parameters |
|------|-------------|----------------|
| `lokalise_list_projects` | List all projects | limit, page, includeStatistics, includeSettings |
| `lokalise_get_project` | Get project details | projectId |
| `lokalise_create_project` | Create new project | name, description, languages, base_lang_iso |
| `lokalise_update_project` | Update project | projectId, name, description, settings |
| `lokalise_delete_project` | Delete project | projectId |
| `lokalise_empty_project` | Clear all content | projectId |

### Keys Domain (7 tools) - Enhanced
| Tool | Description | Key Parameters |
|------|-------------|----------------|
| `lokalise_list_keys` | List keys with filtering | projectId, limit, page, **filterFilenames**, filterKeys, filterPlatforms |
| `lokalise_get_key` | Get key details | projectId, keyId |
| `lokalise_create_keys` | Bulk create keys | projectId, keys[] |
| `lokalise_update_key` | Update single key | projectId, keyId, description, platforms |
| `lokalise_bulk_update_keys` | Bulk update | projectId, keys[] |
| `lokalise_delete_key` | Delete key | projectId, keyId |
| `lokalise_bulk_delete_keys` | Bulk delete | projectId, keyIds[] |

### Languages Domain (6 tools)
| Tool | Description | Key Parameters |
|------|-------------|----------------|
| `lokalise_list_system_languages` | All available languages | limit, page |
| `lokalise_list_project_languages` | Project languages | projectId |
| `lokalise_add_project_languages` | Add languages | projectId, languages[] |
| `lokalise_get_language` | Get language details | projectId, langId |
| `lokalise_update_language` | Update language | projectId, langId, lang_name |
| `lokalise_remove_language` | Remove language | projectId, langId |

### Translations Domain (4 tools)
| Tool | Description | Key Parameters |
|------|-------------|----------------|
| `lokalise_list_translations` | List translations | projectId, filter_lang_id, filter_is_reviewed |
| `lokalise_get_translation` | Get translation | projectId, translationId |
| `lokalise_update_translation` | Update translation | projectId, translationId, translation |
| `lokalise_bulk_update_translations` | Bulk update | projectId, translations[] |

### Tasks Domain (5 tools)
| Tool | Description | Key Parameters |
|------|-------------|----------------|
| `lokalise_list_tasks` | List tasks | projectId, filter_title, filter_statuses |
| `lokalise_get_task` | Get task details | projectId, taskId |
| `lokalise_create_task` | Create task | projectId, title, keys, languages |
| `lokalise_update_task` | Update task | projectId, taskId, title, done |
| `lokalise_delete_task` | Delete task | projectId, taskId |

### Contributors Domain (6 tools)
| Tool | Description | Key Parameters |
|------|-------------|----------------|
| `lokalise_list_contributors` | List contributors | projectId |
| `lokalise_get_contributor` | Get contributor | projectId, contributorId |
| `lokalise_add_contributors` | Add contributors | projectId, contributors[] |
| `lokalise_get_current_user` | Current user info | - |
| `lokalise_update_contributor` | Update permissions | projectId, contributorId, role |
| `lokalise_remove_contributor` | Remove contributor | projectId, contributorId |

### Comments Domain (5 tools)
| Tool | Description | Key Parameters |
|------|-------------|----------------|
| `lokalise_list_key_comments` | Key comments | projectId, keyId |
| `lokalise_list_project_comments` | All comments | projectId |
| `lokalise_get_comment` | Get comment | projectId, keyId, commentId |
| `lokalise_create_comments` | Create comments | projectId, comments[] |
| `lokalise_delete_comment` | Delete comment | projectId, keyId, commentId |

### Glossary Domain (5 tools)
| Tool | Description | Key Parameters |
|------|-------------|----------------|
| `lokalise_list_glossary_terms` | List terms | projectId |
| `lokalise_create_glossary_terms` | Create terms | projectId, glossaryTerms[] |
| `lokalise_get_glossary_term` | Get term | projectId, termId |
| `lokalise_update_glossary_term` | Update term | projectId, termId, term |
| `lokalise_delete_glossary_term` | Delete term | projectId, termId |

### User Groups Domain (9 tools) - NEW
| Tool | Description | Key Parameters |
|------|-------------|----------------|
| `lokalise_list_usergroups` | List groups | teamId |
| `lokalise_get_usergroup` | Get group details | teamId, groupId |
| `lokalise_create_usergroup` | Create group | teamId, name, is_reviewer, is_admin |
| `lokalise_update_usergroup` | Update group | teamId, groupId, name, permissions |
| `lokalise_delete_usergroup` | Delete group | teamId, groupId |
| `lokalise_add_usergroup_members` | Add members | teamId, groupId, users[] |
| `lokalise_remove_usergroup_members` | Remove members | teamId, groupId, users[] |
| `lokalise_list_usergroup_members` | List members | teamId, groupId |
| `lokalise_add_usergroup_projects` | Assign projects | teamId, groupId, projects[] |

### Team Users Domain (4 tools) - NEW
| Tool | Description | Key Parameters |
|------|-------------|----------------|
| `lokalise_list_teamusers` | List team users | teamId |
| `lokalise_get_teamuser` | Get user details | teamId, userId |
| `lokalise_update_teamuser` | Update user role | teamId, userId, role |
| `lokalise_delete_teamuser` | Remove user | teamId, userId |

### Queued Processes Domain (2 tools) - NEW
| Tool | Description | Key Parameters |
|------|-------------|----------------|
| `lokalise_list_queued_processes` | List processes | projectId |
| `lokalise_get_queued_process` | Get process status | projectId, processId |

---

## MCP Resources (21 total)

Resources provide direct data access via URIs without tool invocation:

### Project Resources
- `lokalise-projects` - List all projects
- `lokalise-project-details` - Get specific project

### Key Resources
- `lokalise-project-keys` - List keys with filtering
- `lokalise-key-details` - Get specific key

### Language Resources
- `lokalise-system-languages` - Available languages
- `lokalise-project-languages` - Project languages

### Translation Resources
- `lokalise-translations` - List translations
- `lokalise-translation-details` - Get translation

### Task Resources
- `lokalise-project-tasks` - List tasks
- `lokalise-task-details` - Get task

### Contributor Resources
- `lokalise-contributors` - List contributors
- `lokalise-contributor-details` - Get contributor

### Comment Resources
- `lokalise-key-comments` - Key comments
- `lokalise-project-comments` - All comments

### Glossary Resources
- `lokalise-glossary-terms` - List terms
- `lokalise-glossary-term-details` - Get term

### User Group Resources
- `lokalise-usergroups` - List groups
- `lokalise-usergroup-details` - Get group

### Team User Resources
- `lokalise-teamusers` - List users
- `lokalise-teamuser-details` - Get user

### Process Resources
- `lokalise-queued-processes` - List processes

---

## Workflow Prompts (17 total)

Workflow prompts provide pre-configured, multi-step automation for complex Lokalise operations. These prompts combine multiple MCP tools to accomplish sophisticated tasks efficiently.

### File & Review Workflows
1. **post_upload_review_workflow** - Automate review task creation after file uploads
   - Creates tasks for uploaded content
   - Assigns reviewers based on language expertise
   - Sets deadlines and priorities

2. **document_extraction_review_workflow** - Extract and process document content
   - Extracts translatable content from documents
   - Creates keys with proper context
   - Initiates review workflows

### Project Management
3. **project_portfolio_overview** - Comprehensive analysis across all projects
   - Aggregates statistics from all projects
   - Identifies bottlenecks and delays
   - Provides executive-level insights

4. **project_deep_dive** - Detailed single project inspection
   - Analyzes project health metrics
   - Reviews translation quality
   - Identifies optimization opportunities

5. **new_project_setup** - Complete project creation and configuration
   - Creates project with optimal settings
   - Adds required languages
   - Configures team permissions

### Language & Localization
6. **language_expansion** - Strategic addition of new target languages
   - Analyzes market requirements
   - Adds languages with proper configuration
   - Sets up translation workflows

7. **translation_progress_check** - Monitor translation completion status
   - Tracks progress by language
   - Identifies untranslated content
   - Estimates completion timelines

### Key Management
8. **bulk_key_creation** - Efficient creation of multiple translation keys
   - Batch creates keys with translations
   - Applies consistent metadata
   - Validates against duplicates

9. **key_inventory_analysis** - Comprehensive key usage analysis
   - Identifies unused keys
   - Finds duplicate translations
   - Suggests consolidation opportunities

### Task Management
10. **create_translation_task** - Create and intelligently assign tasks
    - Creates tasks with proper scope
    - Auto-assigns based on expertise
    - Sets realistic deadlines

11. **overdue_task_management** - Handle and escalate delayed tasks
    - Identifies overdue tasks
    - Sends reminders to assignees
    - Escalates to managers when needed

### Team Collaboration
12. **contributor_assignment** - Optimize team member access
    - Assigns contributors to projects
    - Sets appropriate permissions
    - Balances workload

13. **team_translation_setup** - Configure team translation workflows
    - Sets up review processes
    - Configures approval chains
    - Establishes quality gates

14. **team_onboarding_workflow** - Streamline new member onboarding
    - Creates user accounts
    - Assigns to appropriate projects
    - Provides access to resources

### Process Monitoring
15. **process_monitoring_dashboard** - Real-time background job tracking
    - Monitors import/export operations
    - Tracks bulk update progress
    - Alerts on failures

16. **bulk_operations_monitor** - Monitor large-scale changes
    - Tracks bulk key updates
    - Monitors mass translations
    - Validates operation success

### Advanced Workflows
17. **automated_review_pipeline** - Implement multi-stage review processes
    - Sets up translation stages
    - Configures approval workflows
    - Implements quality checks

---

## Implementation Templates

### Adding a New Domain

1. **Use the scaffold command** (Recommended):
```bash
npm run scaffold:domain
```

2. **Manual creation**:
   - Create `src/domains/newdomain/` directory
   - Implement required files following interface contracts
   - Domain auto-discovered on next build

### Domain File Structure
```
src/domains/{domain}/
├── index.ts                 # Barrel exports
├── {domain}.cli.ts          # CLI implementation
├── {domain}.tool.ts         # MCP tools
├── {domain}.resource.ts     # MCP resources
├── {domain}.controller.ts   # Business logic
├── {domain}.formatter.ts    # Output formatting
├── {domain}.service.ts      # API integration
└── {domain}.types.ts        # Type definitions
```

---

## Testing Requirements

### Unit Tests
- Controller logic with mocked services
- Formatter output validation
- Type safety verification

### Integration Tests
- Real API calls with test data
- Error handling scenarios
- Rate limiting compliance

### Coverage Targets
- Minimum 80% code coverage
- 100% critical path coverage
- All error scenarios tested

---

## Common Patterns

### Error Handling
```typescript
try {
  // Operation
} catch (error) {
  throw McpError.fromError(error, {
    code: "LOKALISE_API_ERROR",
    details: { projectId, operation: "list_keys" }
  });
}
```

### Controller Response
```typescript
export interface ControllerResponse {
  content: string;      // Formatted Markdown
  data?: unknown;       // Optional raw data
  metadata?: {          // Optional metadata
    total?: number;
    page?: number;
    hasMore?: boolean;
  };
}
```

### Service Pattern
```typescript
let lokaliseApi: LokaliseApi | null = null;

function getLokaliseApi(): LokaliseApi {
  if (!lokaliseApi) {
    const apiKey = config.get("LOKALISE_API_KEY");
    if (!apiKey) {
      throw new McpError("CONFIG_ERROR", "API key not configured");
    }
    lokaliseApi = new LokaliseApi({ apiKey });
  }
  return lokaliseApi;
}
```

---

## Version History

- **v1.0.3** (2025-01-11) - Current version with 11 domains, 59 tools, 21 resources, 17 prompts
  - Full implementation of User Groups, Team Users, Queued Processes domains
  - Enhanced Keys domain with filterFilenames support
  - Added comprehensive workflow prompts for common operations
- **v1.0.2** - Added User Groups, Team Users, Queued Processes
- **v1.0.1** - Enhanced Keys domain with filterFilenames
- **v1.0.0** - Initial release with 8 domains

---

*This document is the authoritative reference for the Lokalise MCP Server implementation.*

**Last Updated**: January 11, 2025  
**Document Version**: 1.0.3  
**Verification Status**: \u2705 Code-verified implementation counts