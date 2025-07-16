# Lokalise MCP Server - Implementation Checklist

> **Canonical Reference**: This document serves as the single source of truth for all agents implementing Lokalise MCP tools. It contains exact API methods, parameter types, implementation requirements, and step-by-step instructions.

## Table of Contents

- [Current Implementation Status](#current-implementation-status)
- [Implementation Priorities](#implementation-priorities)
- [Architecture Overview](#architecture-overview)
- [Complete API Coverage Checklist](#complete-api-coverage-checklist)
- [Implementation Templates](#implementation-templates)
- [Testing Requirements](#testing-requirements)
- [Common Patterns](#common-patterns)

---

## Current Implementation Status

### ✅ **Fully Implemented Collections**
1. **Projects** (6/6 methods) - `list()`, `get()`, `create()`, `update()`, `delete()`, `empty()`
2. **Languages** (6/6 methods) - `system_languages()`, `list()`, `create()`, `get()`, `update()`, `delete()`
3. **Keys** (7/7 methods) - `list()`, `create()`, `get()`, `update()`, `delete()`, `bulk_update()`, `bulk_delete()`
4. **Translations** (3/3 methods) - `list()`, `get()`, `update()`
5. **Tasks** (5/5 methods) - `list()`, `create()`, `get()`, `update()`, `delete()`
6. **Contributors** (6/6 methods) - `list()`, `create()`, `get()`, `me()`, `update()`, `delete()`
7. **Comments** (5/5 methods) - `list()`, `create()`, `get()`, `delete()`, `list_project_comments()`
8. **Glossary Terms** (5/5 methods) - `list()`, `create()`, `get()`, `update()`, `delete()`

### ❌ **Unimplemented Collections (17 total)**
- Files, Screenshots, Branches, Webhooks, Teams, Snapshots, Queued Processes, Orders, Translation Providers, Translation Statuses, User Groups, Team Users, Permission Templates, Payment Cards, Team User Billing Details, JWT, Segments

---

## Implementation Priorities

### **Phase 1: Core Functionality** (Immediate - 3 collections)
1. **Files** - Critical for import/export workflows
2. **Screenshots** - Essential for UI translation context
3. **Branches** - Version control for translations

### **Phase 2: Workflow Enhancement** (Next - 1 collection)
1. **Webhooks** - Integration ecosystem

### **Phase 3: Advanced Features** (Future - 16 collections)
1. **Snapshots** - Backup and versioning
2. **Teams/User Groups** - Advanced permissions
3. **Orders** - Professional services
4. **Translation Statuses** - Custom workflows
5. Remaining specialized collections

---

## Architecture Overview

### **Auto-Discovery Domain Architecture**
```
src/
├── cli/
│   └── index.ts                       # CLI orchestrator with auto-discovery
├── domains/                           # Domain-driven feature modules with auto-discovery
│   ├── index.ts                       # Master domain barrel (registerAllTools/CLI)
│   ├── registry.ts                    # Auto-discovery registry system
│   ├── {domain}/                      # Auto-discovered domain (keys, projects, etc.)
│   │   ├── index.ts                   # Domain barrel exports
│   │   ├── {domain}.cli.ts            # CLI commands (implements DomainCli)
│   │   ├── {domain}.tool.ts           # MCP tools (implements DomainTool)
│   │   ├── {domain}.controller.ts     # Business logic orchestration
│   │   ├── {domain}.formatter.ts      # Response formatting
│   │   ├── {domain}.service.ts        # API service layer
│   │   └── {domain}.types.ts          # Domain-specific type definitions
│   └── translations/                  # Future domain example
├── shared/                            # Cross-cutting concerns
│   ├── resources/
│   │   └── lokalise.resource.ts       # MCP resource definitions
│   ├── types/
│   │   ├── common.types.ts            # Common types (ControllerResponse, etc.)
│   │   └── domain.types.ts            # Domain interface contracts
│   └── utils/                         # Shared utilities
└── index.ts                           # Server entry point with auto-discovery
```

### **Domain Interface Requirements**
- **Tools**: Must implement `DomainTool` interface with `registerTools(server: McpServer)` method
- **CLI**: Must implement `DomainCli` interface with `register(program: Command)` method
- **Exports**: Domain barrel must export `{domainName}Tool` and `{domainName}Cli`
- **Auto-Discovery**: Domains automatically discovered by filesystem scanning

### **Naming Conventions**
- **MCP Tool Names**: `snake_case` (e.g., `lokalise_upload_file`)
- **CLI Commands**: `kebab-case` (e.g., `upload-file`)
- **Function Parameters**: `camelCase` (e.g., `projectId`, `fileData`)
- **Domain Names**: `lowercase` (e.g., `keys`, `projects`, `files`)
- **Domain Exports**: `{domainName}Tool`, `{domainName}Cli` (e.g., `keysTool`, `keysCli`)

---

## Complete API Coverage Checklist

### **1. Projects Collection** ✅ **FULLY IMPLEMENTED**

**SDK Reference**: `lokaliseApi.projects()`
**File**: `node_modules/@lokalise/node-api/src/collections/projects.ts`

| Method | Status | MCP Tool Name | SDK Call | Input Type | Response Type |
|--------|--------|---------------|----------|------------|---------------|
| `list()` | ✅ | `lokalise_list_projects` | `lokaliseApi.projects().list(params)` | `ProjectListParams` | `PaginatedResult<Project>` |
| `create()` | ✅ | `lokalise_create_project` | `lokaliseApi.projects().create(params)` | `CreateProjectParams` | `Project` |
| `get()` | ✅ | `lokalise_get_project` | `lokaliseApi.projects().get(project_id)` | `string` | `Project` |
| `update()` | ✅ | `lokalise_update_project` | `lokaliseApi.projects().update(project_id, params)` | `UpdateProjectParams` | `Project` |
| `delete()` | ✅ | `lokalise_delete_project` | `lokaliseApi.projects().delete(project_id)` | `string` | `ProjectDeleted` |
| `empty()` | ✅ | `lokalise_empty_project` | `lokaliseApi.projects().empty(project_id)` | `string` | `ProjectEmptied` |

**Implementation Files**:
- ✅ Tools: `src/tools/projects.tool.ts` (all 6 tools implemented)
- ✅ Controller: `src/controllers/projects.controller.ts` (all methods implemented)
- ✅ Service: `src/services/vendor.lokalise.com.projects.service.ts` (all methods implemented)
- ✅ CLI: `src/cli/projects.cli.ts` (all commands implemented)
- ✅ Formatter: `src/controllers/projects.formatter.ts` (response formatting)
- ✅ Types: `src/tools/projects.types.ts` (Zod schemas and TypeScript types)

---

### **2. Languages Collection** ✅ **FULLY IMPLEMENTED**

**SDK Reference**: `lokaliseApi.languages()`
**File**: `node_modules/@lokalise/node-api/src/collections/languages.ts`

| Method | Status | MCP Tool Name | SDK Call | Input Type | Response Type |
|--------|--------|---------------|----------|------------|---------------|
| `system_languages()` | ✅ | `lokalise_list_system_languages` | `lokaliseApi.languages().system_languages(params)` | `PaginationParams` | `PaginatedResult<Language>` |
| `list()` | ✅ | `lokalise_list_project_languages` | `lokaliseApi.languages().list(params)` | `ProjectWithPagination` | `PaginatedResult<Language>` |
| `create()` | ✅ | `lokalise_add_project_languages` | `lokaliseApi.languages().create(langs, params)` | `CreateLanguageParams[]` | `BulkResult<Language>` |
| `get()` | ✅ | `lokalise_get_language` | `lokaliseApi.languages().get(lang_id, params)` | `GetLanguageParams` | `Language` |
| `update()` | ✅ | `lokalise_update_language` | `lokaliseApi.languages().update(lang_id, params, project)` | `UpdateLanguageParams` | `Language` |
| `delete()` | ✅ | `lokalise_remove_language` | `lokaliseApi.languages().delete(lang_id, params)` | `ProjectOnly` | `LanguageDeleted` |

**Parameter Types**:
- `CreateLanguageParams`: `{ lang_iso: string, custom_iso?: string, custom_name?: string, custom_plural_forms?: string[] }`
- `UpdateLanguageParams`: `{ lang_iso?: string, lang_name?: string, plural_forms?: string[] }`

**Implementation Files**:
- ✅ Tools: `src/tools/languages.tool.ts` (all 6 tools implemented)
- ✅ Controller: `src/controllers/languages.controller.ts` (all methods implemented)
- ✅ Service: `src/services/vendor.lokalise.com.languages.service.ts` (all methods implemented)
- ✅ CLI: `src/cli/languages.cli.ts` (all commands implemented)
- ✅ Formatter: `src/controllers/languages.formatter.ts` (response formatting)
- ✅ Types: `src/tools/languages.types.ts` (Zod schemas and TypeScript types)

---

### **3. Keys Collection** ✅ **FULLY IMPLEMENTED**

**SDK Reference**: `lokaliseApi.keys()`
**File**: `node_modules/@lokalise/node-api/src/collections/keys.ts`

| Method | Status | MCP Tool Name | SDK Call | Input Type | Response Type |
|--------|--------|---------------|----------|------------|---------------|
| `list()` | ✅ | `lokalise_list_keys` | `lokaliseApi.keys().list(params)` | `KeyParamsWithPagination` | `CursorPaginatedResult<Key>` |
| `create()` | ✅ | `lokalise_create_keys` | `lokaliseApi.keys().create(params, project)` | `CreateKeyParams` | `BulkResult<Key>` |
| `get()` | ✅ | `lokalise_get_key` | `lokaliseApi.keys().get(key_id, params)` | `GetKeyParams` | `Key` |
| `update()` | ✅ | `lokalise_update_key` | `lokaliseApi.keys().update(key_id, params, project)` | `UpdateKeyData` | `Key` |
| `delete()` | ✅ | `lokalise_delete_key` | `lokaliseApi.keys().delete(key_id, params)` | `ProjectOnly` | `KeyDeleted` |
| `bulk_update()` | ✅ | `lokalise_bulk_update_keys` | `lokaliseApi.keys().bulk_update(params, project)` | `BulkUpdateKeyParams` | `BulkResult<Key>` |
| `bulk_delete()` | ✅ | `lokalise_bulk_delete_keys` | `lokaliseApi.keys().bulk_delete(key_ids, params)` | `number[] \| string[]` | `KeysBulkDeleted` |

**Special Notes**:
- Uses **cursor pagination** (`CursorPaginatedResult<Key>`)
- `CreateKeyParams` contains array of `CreateKeyData`
- `BulkUpdateKeyParams` contains array of key updates with IDs
- Supports platform filtering (iOS, Android, web, other)
- Bulk operations support up to 1000 keys per operation

**Implementation Files**:
- ✅ Types: `src/tools/keys.types.ts` (all 7 Zod schemas including bulk operations)
- ✅ Tools: `src/tools/keys.tool.ts` (all 7 MCP tools implemented)
- ✅ Controller: `src/controllers/keys.controller.ts` (all 7 methods implemented)
- ✅ Service: `src/services/vendor.lokalise.com.keys.service.ts` (all 7 API methods implemented)
- ✅ CLI: `src/cli/keys.cli.ts` (all 7 CLI commands implemented)
- ✅ Formatter: `src/controllers/keys.formatter.ts` (response formatting)
- ✅ Registration: Registered in `src/index.ts` and `src/cli/index.ts`

---

### **4. Translations Collection** ✅ **FULLY IMPLEMENTED**

**SDK Reference**: `lokaliseApi.translations()`
**File**: `node_modules/@lokalise/node-api/src/collections/translations.ts`

| Method | Status | MCP Tool Name | SDK Call | Input Type | Response Type |
|--------|--------|---------------|----------|------------|---------------|
| `list()` | ✅ | `lokalise_list_translations` | `lokaliseApi.translations().list(params)` | `ListTranslationParams` | `CursorPaginatedResult<Translation>` |
| `get()` | ✅ | `lokalise_get_translation` | `lokaliseApi.translations().get(trans_id, params)` | `GetTranslationParams` | `Translation` |
| `update()` | ✅ | `lokalise_update_translation` | `lokaliseApi.translations().update(trans_id, params, project)` | `UpdateTranslationParams` | `Translation` |

**Parameter Types**:
- `UpdateTranslationParams`: `{ translation?: string, is_unverified?: boolean, is_reviewed?: boolean, custom_translation_status_ids?: number[] }`
- `ListTranslationParams`: Extensive filtering options for language, review status, QA issues

**Implementation Files**:
- ✅ Tools: `src/domains/translations/translations.tool.ts` (all 3 tools implemented)
- ✅ Controller: `src/domains/translations/translations.controller.ts` (all methods implemented)
- ✅ Service: `src/domains/translations/translations.service.ts` (all methods implemented)
- ✅ CLI: `src/domains/translations/translations.cli.ts` (all commands implemented)
- ✅ Formatter: `src/domains/translations/translations.formatter.ts` (response formatting)
- ✅ Types: `src/domains/translations/translations.types.ts` (Zod schemas and TypeScript types)
- ✅ Resources: `src/domains/translations/translations.resource.ts` (2 MCP resources implemented)
- ✅ Registration: Auto-discovered via domain architecture

---

### **5. Files Collection** ❌ **HIGH PRIORITY - NOT IMPLEMENTED**

**SDK Reference**: `lokaliseApi.files()`
**File**: `node_modules/@lokalise/node-api/src/collections/files.ts`

| Method | Status | MCP Tool Name | SDK Call | Input Type | Response Type |
|--------|--------|---------------|----------|------------|---------------|
| `list()` | ❌ | `lokalise_list_files` | `lokaliseApi.files().list(params)` | `ListFileParams` | `PaginatedResult<File>` |
| `upload()` | ❌ | `lokalise_upload_file` | `lokaliseApi.files().upload(project_id, params)` | `UploadFileParams` | `QueuedProcess` |
| `download()` | ❌ | `lokalise_download_files` | `lokaliseApi.files().download(project_id, params)` | `DownloadFileParams` | `DownloadBundle` |
| `async_download()` | ❌ | `lokalise_async_download_files` | `lokaliseApi.files().async_download(project_id, params)` | `DownloadFileParams` | `QueuedProcess` |
| `delete()` | ❌ | `lokalise_delete_file` | `lokaliseApi.files().delete(file_id, params)` | `ProjectOnly` | `FileDeleted` |

**Implementation Requirements**:
- **Create New Files**:
  - `src/tools/files.tool.ts` + `src/tools/files.types.ts`
  - `src/controllers/files.controller.ts` + `src/controllers/files.formatter.ts`
  - `src/services/vendor.lokalise.com.files.service.ts`
  - `src/cli/files.cli.ts`
  - Test files for all components

**Special Handling**:
- **File Upload**: Handle multipart form data, base64 encoding
- **Async Operations**: `upload()` and `async_download()` return `QueuedProcess` - requires process monitoring
- **Large Downloads**: Sync `download()` may return `responseTooBig: true` warning
- **File Formats**: Support 40+ formats (JSON, XLIFF, CSV, etc.)

**Critical Parameter Types**:
```typescript
interface UploadFileParams {
  data: string;           // Base64 encoded file content
  filename: string;
  lang_iso: string;
  // ... 20+ optional parameters for format-specific options
}

interface DownloadFileParams {
  format: string;         // json, xliff, csv, etc.
  original_filenames?: boolean;
  bundle_structure?: string;
  // ... 30+ optional filtering and transformation parameters
}
```

---

### **6. Screenshots Collection** ❌ **HIGH PRIORITY - NOT IMPLEMENTED**

**SDK Reference**: `lokaliseApi.screenshots()`
**File**: `node_modules/@lokalise/node-api/src/collections/screenshots.ts`

| Method | Status | MCP Tool Name | SDK Call | Input Type | Response Type |
|--------|--------|---------------|----------|------------|---------------|
| `list()` | ❌ | `lokalise_list_screenshots` | `lokaliseApi.screenshots().list(params)` | `ProjectWithPagination` | `PaginatedResult<Screenshot>` |
| `create()` | ❌ | `lokalise_create_screenshots` | `lokaliseApi.screenshots().create(params, project)` | `CreateScreenshotParams[]` | `BulkResult<Screenshot>` |
| `get()` | ❌ | `lokalise_get_screenshot` | `lokaliseApi.screenshots().get(screenshot_id, params)` | `ProjectOnly` | `Screenshot` |
| `update()` | ❌ | `lokalise_update_screenshot` | `lokaliseApi.screenshots().update(screenshot_id, params, project)` | `UpdateScreenshotParams` | `Screenshot` |
| `delete()` | ❌ | `lokalise_delete_screenshot` | `lokaliseApi.screenshots().delete(screenshot_id, params)` | `ProjectOnly` | `ScreenshotDeleted` |

**⚠️ SDK Issue**: Method name has typo - `get(screnshot_id)` instead of `get(screenshot_id)`

**Implementation Requirements**:
- **Create New Files**: All files need to be created from scratch
- **Image Handling**: Base64 encoded image data
- **OCR Integration**: Automatic text recognition from screenshots
- **Key Association**: Link screenshots to translation keys

**Critical Parameter Types**:
```typescript
interface CreateScreenshotParams {
  data: string;           // Base64 encoded image
  title?: string;
  description?: string;
  ocr?: boolean;          // Enable OCR text recognition
  key_ids?: number[];     // Associate with keys
  tags?: string[];
}
```

---

### **7. Contributors Collection** ✅ **FULLY IMPLEMENTED**

**SDK Reference**: `lokaliseApi.contributors()`
**File**: `node_modules/@lokalise/node-api/src/collections/contributors.ts`

| Method | Status | MCP Tool Name | SDK Call | Input Type | Response Type |
|--------|--------|---------------|----------|------------|---------------|
| `list()` | ✅ | `lokalise_list_contributors` | `lokaliseApi.contributors().list(params)` | `ProjectWithPagination` | `PaginatedResult<Contributor>` |
| `create()` | ✅ | `lokalise_add_contributors` | `lokaliseApi.contributors().create(params, project)` | `ContributorCreateData[]` | `BulkResult<Contributor>` |
| `get()` | ✅ | `lokalise_get_contributor` | `lokaliseApi.contributors().get(contributor_id, params)` | `ProjectOnly` | `Contributor` |
| `me()` | ✅ | `lokalise_get_current_user` | `lokaliseApi.contributors().me(params)` | `ProjectOnly` | `Contributor` |
| `update()` | ✅ | `lokalise_update_contributor` | `lokaliseApi.contributors().update(contributor_id, params, project)` | `ContributorUpdateData` | `Contributor` |
| `delete()` | ✅ | `lokalise_remove_contributor` | `lokaliseApi.contributors().delete(contributor_id, params)` | `ProjectOnly` | `any` |

**🔥 Special Method**: `me()` returns current user's contributor profile

**Critical Parameter Types**:
```typescript
interface ContributorCreateData {
  email: string;
  fullname?: string;
  is_admin?: boolean;
  is_reviewer?: boolean;
  languages: ContributorLanguage[];
  admin_rights?: string[];  // "upload", "activity", "download", etc.
}

interface ContributorLanguage {
  lang_iso: string;
  is_writable?: boolean;
}
```

**Implementation Files**:
- ✅ Tools: `src/domains/contributors/contributors.tool.ts` (all 6 tools implemented)
- ✅ Controller: `src/domains/contributors/contributors.controller.ts` (all methods implemented)
- ✅ Service: `src/domains/contributors/contributors.service.ts` (all methods implemented)
- ✅ CLI: `src/domains/contributors/contributors.cli.ts` (all commands implemented)
- ✅ Formatter: `src/domains/contributors/contributors.formatter.ts` (response formatting)
- ✅ Types: `src/domains/contributors/contributors.types.ts` (Zod schemas and TypeScript types)
- ✅ Resources: `src/domains/contributors/contributors.resource.ts` (2 MCP resources implemented)
- ✅ Registration: Auto-discovered via domain architecture

---

### **8. Branches Collection** ❌ **HIGH PRIORITY - NOT IMPLEMENTED**

**SDK Reference**: `lokaliseApi.branches()`
**File**: `node_modules/@lokalise/node-api/src/collections/branches.ts`

| Method | Status | MCP Tool Name | SDK Call | Input Type | Response Type |
|--------|--------|---------------|----------|------------|---------------|
| `list()` | ❌ | `lokalise_list_branches` | `lokaliseApi.branches().list(params)` | `ProjectWithPagination` | `PaginatedResult<Branch>` |
| `create()` | ❌ | `lokalise_create_branch` | `lokaliseApi.branches().create(params, project)` | `BranchParams` | `Branch` |
| `get()` | ❌ | `lokalise_get_branch` | `lokaliseApi.branches().get(branch_id, params)` | `ProjectOnly` | `Branch` |
| `update()` | ❌ | `lokalise_update_branch` | `lokaliseApi.branches().update(branch_id, params, project)` | `BranchParams` | `Branch` |
| `delete()` | ❌ | `lokalise_delete_branch` | `lokaliseApi.branches().delete(branch_id, params)` | `ProjectOnly` | `BranchDeleted` |
| `merge()` | ❌ | `lokalise_merge_branch` | `lokaliseApi.branches().merge(branch_id, params, body)` | `MergeBranchParams` | `BranchMerged` |

**🔥 Special Method**: `merge()` for Git-like branch merging

**Special Features**:
- **Branch-scoped Operations**: Append `:branch-name` to project_id for branch operations
- **Merge Conflicts**: Handle conflict resolution in merge operations

**Parameter Types**:
```typescript
interface BranchParams {
  name?: string;
}

interface MergeBranchParams {
  force_conflict_resolve_using?: "master" | "branch";
  target_branch_id?: number;
}
```

---

### **9. Tasks Collection** ✅ **FULLY IMPLEMENTED**

**SDK Reference**: `lokaliseApi.tasks()`
**File**: `node_modules/@lokalise/node-api/src/collections/tasks.ts`

| Method | Status | MCP Tool Name | SDK Call | Input Type | Response Type |
|--------|--------|---------------|----------|------------|---------------|
| `list()` | ✅ | `lokalise_list_tasks` | `lokaliseApi.tasks().list(params)` | `ListTaskParams` | `PaginatedResult<Task>` |
| `create()` | ✅ | `lokalise_create_task` | `lokaliseApi.tasks().create(params, project)` | `CreateTaskParams` | `Task` |
| `get()` | ✅ | `lokalise_get_task` | `lokaliseApi.tasks().get(task_id, params)` | `ProjectOnly` | `Task` |
| `update()` | ✅ | `lokalise_update_task` | `lokaliseApi.tasks().update(task_id, params, project)` | `UpdateTaskParams` | `Task` |
| `delete()` | ✅ | `lokalise_delete_task` | `lokaliseApi.tasks().delete(task_id, params)` | `ProjectOnly` | `TaskDeleted` |

**Complex Parameter Types**:
```typescript
interface CreateTaskParams {
  title: string;
  keys?: number[];
  languages: TaskLanguage[];
  assignees?: number[];
  description?: string;
  due_date?: string;
  // ... many more workflow parameters
}

interface TaskLanguage {
  language_iso: string;
  users?: number[];
  groups?: number[];
}
```

**Implementation Files**:
- ✅ Tools: `src/tools/tasks.tool.ts` (all 5 tools implemented)
- ✅ Controller: `src/controllers/tasks.controller.ts` (all methods implemented)
- ✅ Service: `src/services/vendor.lokalise.com.tasks.service.ts` (all methods implemented)
- ✅ CLI: `src/cli/tasks.cli.ts` (all commands implemented)
- ✅ Formatter: `src/controllers/tasks.formatter.ts` (response formatting)
- ✅ Types: `src/tools/tasks.types.ts` (Zod schemas and TypeScript types)
- ✅ Registration: Registered in `src/index.ts` and `src/cli/index.ts`

---

### **10. Comments Collection** ✅ **FULLY IMPLEMENTED**

**SDK Reference**: `lokaliseApi.comments()`
**File**: `node_modules/@lokalise/node-api/src/collections/comments.ts`

| Method | Status | MCP Tool Name | SDK Call | Input Type | Response Type |
|--------|--------|---------------|----------|------------|---------------|
| `list()` | ✅ | `lokalise_list_key_comments` | `lokaliseApi.comments().list(params)` | `KeyProjectPagination` | `PaginatedResult<Comment>` |
| `create()` | ✅ | `lokalise_create_comments` | `lokaliseApi.comments().create(params, project_key)` | `CommentData[]` | `Comment[]` |
| `get()` | ✅ | `lokalise_get_comment` | `lokaliseApi.comments().get(comment_id, params)` | `ProjectAndKey` | `Comment` |
| `delete()` | ✅ | `lokalise_delete_comment` | `lokaliseApi.comments().delete(comment_id, params)` | `ProjectAndKey` | `CommentDeleted` |
| `list_project_comments()` | ✅ | `lokalise_list_project_comments` | `lokaliseApi.comments().list_project_comments(params)` | `ProjectWithPagination` | `PaginatedResult<Comment>` |

**🔥 Special Method**: `list_project_comments()` gets all comments across project (not key-scoped)

**Context Requirements**:
- Most methods require both `project_id` AND `key_id`
- `ProjectAndKey`: `{ project_id: string, key_id: number | string }`

**Implementation Files**:
- ✅ Tools: `src/domains/comments/comments.tool.ts` (all 5 tools implemented)
- ✅ Controller: `src/domains/comments/comments.controller.ts` (all methods implemented)
- ✅ Service: `src/domains/comments/comments.service.ts` (all methods implemented)
- ✅ CLI: `src/domains/comments/comments.cli.ts` (all commands implemented)
- ✅ Formatter: `src/domains/comments/comments.formatter.ts` (response formatting)
- ✅ Types: `src/domains/comments/comments.types.ts` (Zod schemas and TypeScript types)
- ✅ Resources: `src/domains/comments/comments.resource.ts` (2 MCP resources implemented)
- ✅ Registration: Auto-discovered via domain architecture

---

### **11. Glossary Terms Collection** ✅ **FULLY IMPLEMENTED**

**SDK Reference**: `lokaliseApi.glossaryTerms()`
**File**: `node_modules/@lokalise/node-api/src/collections/glossary_terms.ts`

| Method | Status | MCP Tool Name | SDK Call | Input Type | Response Type |
|--------|--------|---------------|----------|------------|---------------|
| `list()` | ✅ | `lokalise_list_glossary_terms` | `lokaliseApi.glossaryTerms().list(params)` | `ListTermsParams` | `CursorPaginatedResult<GlossaryTerm>` |
| `create()` | ✅ | `lokalise_create_glossary_terms` | `lokaliseApi.glossaryTerms().create(params, project)` | `CreateTermsParams` | `BulkResult<GlossaryTerm>` |
| `get()` | ✅ | `lokalise_get_glossary_term` | `lokaliseApi.glossaryTerms().get(term_id, params)` | `number, ProjectOnly` | `GlossaryTerm` |
| `update()` | ✅ | `lokalise_update_glossary_terms` | `lokaliseApi.glossaryTerms().update(params, project)` | `UpdateTermsParams` | `BulkResult<GlossaryTerm>` |
| `delete()` | ✅ | `lokalise_delete_glossary_terms` | `lokaliseApi.glossaryTerms().delete(term_ids, params)` | `number[], ProjectOnly` | `TermsDeleted` |

**Special Features**:
- **Cursor-based pagination** for efficient large dataset handling
- **Bulk operations** for create, update, and delete
- **Term properties**: `caseSensitive`, `translatable`, `forbidden`
- **Multi-language translations** support
- **Tags** for categorization

**Parameter Types**:
```typescript
interface CreateTermsParams {
  terms: Array<{
    term: string;
    description: string;
    caseSensitive: boolean;
    translatable: boolean;
    forbidden: boolean;
    translations?: Array<{
      langId?: number;
      translation?: string;
      description?: string;
    }>;
    tags?: string[];
  }>;
}
```

**Implementation Files**:
- ✅ Tools: `src/domains/glossary/glossary.tool.ts` (all 5 tools implemented)
- ✅ Controller: `src/domains/glossary/glossary.controller.ts` (all methods implemented)
- ✅ Service: `src/domains/glossary/glossary.service.ts` (all methods implemented)
- ✅ CLI: `src/domains/glossary/glossary.cli.ts` (3 CLI commands: list, get, create)
- ✅ Formatter: `src/domains/glossary/glossary.formatter.ts` (response formatting)
- ✅ Types: `src/domains/glossary/glossary.types.ts` (Zod schemas and TypeScript types)
- ✅ Resources: `src/domains/glossary/glossary.resource.ts` (2 MCP resources implemented)
- ✅ Registration: Auto-discovered via domain architecture

**Use Case**: Essential for maintaining translation consistency across projects by defining key terminology (brand names, technical terms, legal terms) with specific translation guidelines.

---

### **12. Webhooks Collection** ❌ **MEDIUM PRIORITY - NOT IMPLEMENTED**

**SDK Reference**: `lokaliseApi.webhooks()`
**File**: `node_modules/@lokalise/node-api/src/collections/webhooks.ts`

| Method | Status | MCP Tool Name | SDK Call | Input Type | Response Type |
|--------|--------|---------------|----------|------------|---------------|
| `list()` | ❌ | `lokalise_list_webhooks` | `lokaliseApi.webhooks().list(params)` | `ProjectWithPagination` | `PaginatedResult<Webhook>` |
| `create()` | ❌ | `lokalise_create_webhook` | `lokaliseApi.webhooks().create(params, project)` | `CreateWebhookParams` | `Webhook` |
| `get()` | ❌ | `lokalise_get_webhook` | `lokaliseApi.webhooks().get(webhook_id, params)` | `ProjectOnly` | `Webhook` |
| `update()` | ❌ | `lokalise_update_webhook` | `lokaliseApi.webhooks().update(webhook_id, params, project)` | `UpdateWebhookParams` | `Webhook` |
| `delete()` | ❌ | `lokalise_delete_webhook` | `lokaliseApi.webhooks().delete(webhook_id, params)` | `ProjectOnly` | `WebhookDeleted` |
| `regenerate_secret()` | ❌ | `lokalise_regenerate_webhook_secret` | `lokaliseApi.webhooks().regenerate_secret(webhook_id, params)` | `ProjectOnly` | `WebhookRegenerated` |

**🔥 Special Method**: `regenerate_secret()` for security management

**Critical Parameter Types**:
```typescript
interface CreateWebhookParams {
  url: string;
  branch?: string;
  events: string[];      // 25+ event types available
  event_lang_map?: WebhookEventLangMap[];
}

// Common webhook events:
// "project.imported", "project.exported", "project.translation.updated",
// "project.translation.proofread", "project.key.added", "project.key.modified",
// "project.language.added", "project.task.created", "project.task.completed", etc.
```

---

### **13. Remaining Collections** ❌ **LOWER PRIORITY**

**Quick Reference for Remaining 12 Collections**:

| Collection | Priority | Methods | Key Features |
|------------|----------|---------|--------------|
| **Queued Processes** | Utility | 2 | Monitor async operations (files, uploads) |
| **Snapshots** | Low | 4 | Project versioning, restore capability |
| **Teams** | Low | 2 | Account-level, read-only |
| **Team Users** | Low | 6 | Team-scoped operations |
| **User Groups** | Low | 5 | Advanced permission management |
| **Permission Templates** | Low | 3 | Role-based access templates |
| **Translation Providers** | Low | 2 | Service integration management |
| **Translation Statuses** | Low | 5 | Custom workflow states |
| **Orders** | Specialized | 3 | Professional translation services |
| **Payment Cards** | Specialized | 5 | Billing management |
| **Team User Billing Details** | Specialized | 2 | Cost allocation |
| **JWT** | Specialized | 1 | Authentication tokens |
| **Segments** | Specialized | 3 | CAT tool integration |

---

## Implementation Templates

### **New Domain Creation Process - Using Scaffolding Script**

**Step 1**: Use the scaffolding script (REQUIRED)
```bash
# Use the CLI scaffolding script to generate all domain files
npm run scaffold:domain:cli -- \
  -n {domainName} \
  -d "{Domain description}" \
  -t list,get,create,update,delete  # Specify tools
  -r collection,detail              # Specify resources
  -c list,get,create               # Specify CLI commands

# Example:
npm run scaffold:domain:cli -- \
  -n files \
  -d "File management and import/export" \
  -t list,upload,download,delete \
  -r collection \
  -c list,upload,download
```

**Step 2**: Review generated files in `src/domains/{domainName}/`
- `{domainName}.types.ts` - Update with SDK types
- `{domainName}.service.ts` - Uses shared `getLokaliseApi` utility (DO NOT duplicate)
  - Replace `api.{domainName}()` with actual SDK method if different
  - Import correct SDK types (PaginatedResult, domain entities)
- `{domainName}.controller.ts` - Verify error handling
- `{domainName}.formatter.ts` - Customize formatting
- `{domainName}.tool.ts` - Check "as const" on type property
- `{domainName}.cli.ts` - Add domain-specific options
- `{domainName}.resource.ts` - Uses ResourceTemplate pattern
- `index.ts` - Verify exports

**Step 3**: Update SDK Integration
1. Check SDK types in `/node_modules/@lokalise/node-api/dist/main.d.ts`
2. Review API docs in `/node_modules/@lokalise/node-api/docs/api/{domain}.md`
3. Import correct types in `{domainName}.types.ts`
4. Replace all `REPLACE_ME` in service with actual SDK methods
5. Map Zod schemas to SDK parameter types

**Step 4**: Fix Common Issues
- Ensure `type: "text" as const` in tool responses
- Controller returns only `{ content: string }`
- Error handling uses ErrorContext object
- Service uses object export pattern

**Step 5**: Format and Lint
```bash
# ALWAYS run these before testing
npm run format
npm run lint
```

**Step 6**: Test Implementation
```bash
# Build to check TypeScript
npm run build

# Test CLI
npm run cli -- list-{domainName} <project-id>

# Test MCP tools
npm run mcp:inspect
```

### **Tool Implementation Template (Legacy Reference)**

```typescript
// For individual tool functions within domain files
async function handleAction(args: ActionToolArgsType) {
  const methodLogger = Logger.forContext("{newdomain}.tool.ts", "handleAction");

  try {
    const result = await {newdomain}Controller.action(args);
    return {
      content: [{
        type: "text" as const,
        text: result.content,
      }],
    };
  } catch (error) {
    methodLogger.error("Error in handleAction", { error, args });
    throw formatErrorForMcpTool({
      error,
      message: "Failed to perform action",
    });
  }
}
```

### **Zod Schema Template**

```typescript
// src/tools/{collection}.types.ts
import { z } from "zod";

// Input validation schemas
export const {Action}{Collection}RequestSchema = z.object({
	projectId: z.string().min(1, "Project ID is required"),
	// Add other fields based on SDK parameter interface
});

export type {Action}{Collection}Request = z.infer<typeof {Action}{Collection}RequestSchema>;

// Response schemas (for validation if needed)
export const {Collection}ResponseSchema = z.object({
	// Define response structure based on SDK return type
});

export type {Collection}Response = z.infer<typeof {Collection}ResponseSchema>;
```

### **Controller Template**

```typescript
// src/controllers/{collection}.controller.ts
import type { ControllerResponse } from "../types/common.types.js";
import { Logger } from "../utils/logger.util.js";
import { {Collection}Service } from "../services/vendor.lokalise.com.{collection}.service.js";
import { {Collection}Formatter } from "./{collection}.formatter.js";
import type { {Action}{Collection}Request } from "../tools/{collection}.types.js";

const logger = Logger.forContext(__filename, "{Collection}Controller");

export class {Collection}Controller {
	private {collection}Service: {Collection}Service;
	private formatter: {Collection}Formatter;

	constructor() {
		this.{collection}Service = new {Collection}Service();
		this.formatter = new {Collection}Formatter();
	}

	async {action}{Collection}(
		request: {Action}{Collection}Request
	): Promise<ControllerResponse<{ formatted: string; raw: any }>> {
		try {
			logger.info(`{Action} {collection} started`, {
				projectId: request.projectId
			});

			const result = await this.{collection}Service.{action}{Collection}(request);

			const formatted = this.formatter.format{Action}Response(result);

			logger.info(`{Action} {collection} completed`, {
				projectId: request.projectId,
				resultCount: result.items?.length
			});

			return {
				success: true,
				data: {
					formatted,
					raw: result
				}
			};

		} catch (error) {
			logger.error(`Failed to {action} {collection}`, {
				error,
				projectId: request.projectId
			});

			return {
				success: false,
				error: {
					message: error instanceof Error ? error.message : "Unknown error",
					code: "OPERATION_FAILED"
				}
			};
		}
	}
}
```

### **Service Template**

```typescript
// src/services/vendor.lokalise.com.{collection}.service.ts
import { LokaliseApi } from "@lokalise/node-api";
import { Logger } from "../utils/logger.util.js";
import { getApiKey } from "../utils/config.util.js";
import type { {Action}{Collection}Request } from "../tools/{collection}.types.js";
// Import SDK types:
// import type { {SdkParameterType}, {SdkResponseType} } from "@lokalise/node-api";

const logger = Logger.forContext(__filename, "{Collection}Service");

export class {Collection}Service {
	private api: LokaliseApi;

	constructor() {
		this.api = new LokaliseApi({ apiKey: getApiKey() });
	}

	async {action}{Collection}(
		request: {Action}{Collection}Request
	): Promise<{SdkResponseType}> {
		try {
			logger.info(`Calling Lokalise API: {collection}.{action}()`, {
				projectId: request.projectId
			});

			// Convert request to SDK parameters
			const params: {SdkParameterType} = {
				// Map request fields to SDK parameter interface
			};

			// Call SDK method
			const result = await this.api.{collection}().{action}(params);

			logger.info(`Lokalise API call successful`, {
				projectId: request.projectId,
				resultCount: result.items?.length
			});

			return result;

		} catch (error) {
			logger.error(`Lokalise API call failed: {collection}.{action}()`, {
				error,
				projectId: request.projectId
			});
			throw error;
		}
	}
}
```

---

## Testing Requirements

### **Test File Structure**
```
src/
├── tools/
│   └── {collection}.tool.test.ts
├── controllers/
│   └── {collection}.controller.test.ts
├── services/
│   └── vendor.lokalise.com.{collection}.service.test.ts
└── cli/
    └── {collection}.cli.test.ts
```

### **Test Coverage Requirements**
- **Unit Tests**: All utils and pure functions
- **Controller Tests**: Mocked service calls
- **Integration Tests**: Real API calls (optional, for critical paths)
- **CLI Tests**: Command parsing and execution
- **Target Coverage**: >80%

### **Test Template**

```typescript
// src/controllers/{collection}.controller.test.ts
import { {Collection}Controller } from "./{collection}.controller.js";
import { {Collection}Service } from "../services/vendor.lokalise.com.{collection}.service.js";

// Mock the service
jest.mock("../services/vendor.lokalise.com.{collection}.service.js");
const mockService = {Collection}Service as jest.MockedClass<typeof {Collection}Service>;

describe("{Collection}Controller", () => {
	let controller: {Collection}Controller;

	beforeEach(() => {
		controller = new {Collection}Controller();
		jest.clearAllMocks();
	});

	describe("{action}{Collection}", () => {
		it("should successfully {action} {collection}", async () => {
			// Arrange
			const request = {
				projectId: "test-project-id"
			};
			const mockApiResponse = {
				// Mock SDK response structure
			};

			mockService.prototype.{action}{Collection}.mockResolvedValue(mockApiResponse);

			// Act
			const result = await controller.{action}{Collection}(request);

			// Assert
			expect(result.success).toBe(true);
			expect(result.data?.formatted).toBeDefined();
			expect(mockService.prototype.{action}{Collection}).toHaveBeenCalledWith(request);
		});

		it("should handle errors gracefully", async () => {
			// Arrange
			const request = { projectId: "test-project-id" };
			const error = new Error("API Error");

			mockService.prototype.{action}{Collection}.mockRejectedValue(error);

			// Act
			const result = await controller.{action}{Collection}(request);

			// Assert
			expect(result.success).toBe(false);
			expect(result.error?.message).toBe("API Error");
		});
	});
});
```

---

## Common Patterns

### **Error Handling Pattern**
```typescript
import { McpError } from "../utils/error.util.js";

try {
	// API operation
} catch (error) {
	if (error.response?.status === 404) {
		throw new McpError("Resource not found", "NOT_FOUND");
	} else if (error.response?.status === 403) {
		throw new McpError("Access denied", "FORBIDDEN");
	} else {
		throw new McpError("API operation failed", "API_ERROR");
	}
}
```

### **Pagination Handling Pattern**
```typescript
// For standard pagination
interface PaginationParams {
	page?: number;
	limit?: number;
}

// For cursor pagination (keys, translations)
interface CursorPaginationParams {
	cursor?: string;
	limit?: number;
}
```

### **Logging Pattern**
```typescript
import { Logger } from "../utils/logger.util.js";

const logger = Logger.forContext(__filename, "ComponentName");

// Info logging
logger.info("Operation started", { projectId, additionalContext });

// Error logging
logger.error("Operation failed", { error, context });
```

### **Async Operation Monitoring**
```typescript
// For operations returning QueuedProcess (file uploads, async downloads)
async function monitorQueuedProcess(processId: string, projectId: string): Promise<any> {
	const processService = new QueuedProcessService();

	let attempts = 0;
	const maxAttempts = 30; // 5 minutes max

	while (attempts < maxAttempts) {
		const process = await processService.getProcess(processId, projectId);

		if (process.status === "finished") {
			return process.details;
		} else if (process.status === "failed") {
			throw new McpError(`Process failed: ${process.message}`, "PROCESS_FAILED");
		}

		// Wait 10 seconds before next check
		await new Promise(resolve => setTimeout(resolve, 10000));
		attempts++;
	}

	throw new McpError("Process timeout", "TIMEOUT");
}
```

---

## Quick Start Implementation Guide

### **To Implement a New Collection:**

1. **Use scaffolding script** (REQUIRED FIRST STEP):
   ```bash
   npm run scaffold:domain:cli -- -n {domain} -d "{description}" -t list,get,create,update,delete -r collection,detail -c list,get,create
   ```
2. **Study SDK documentation**:
   - Check types in `/node_modules/@lokalise/node-api/dist/main.d.ts`
   - Review examples in `/node_modules/@lokalise/node-api/docs/api/{domain}.md`
3. **Update generated files**:
   - Import SDK types in `{domain}.types.ts`
   - Replace REPLACE_ME in `{domain}.service.ts`
   - Verify controller returns only `{ content }`
   - Add `as const` to tool type properties
4. **Format and lint code**:
   ```bash
   npm run format && npm run lint
   ```
5. **Test implementation**:
   ```bash
   npm run build
   npm run cli -- list-{domain} <project-id>
   ```
6. **Write tests** for all components
7. **Update documentation** and this checklist

### **Priority Implementation Order:**
1. **Files** (import/export critical)
2. **Screenshots** (UI context critical)
3. **Contributors** (team management)
4. **Branches** (version control)
5. **Comments** (collaboration)
6. **Webhooks** (integrations)
7. **Glossary Terms** (consistency)

---

**Last Updated**: 2025-07-10
**Total Methods**: 100+ across 25 collections
**Implementation Progress**: 43/100+ methods (43%)
**Fully Implemented Collections**: Projects (6 tools), Languages (6 tools), Keys (7 tools), Translations (3 tools), Tasks (5 tools), Contributors (6 tools), Comments (5 tools), Glossary Terms (5 tools)
**Next Priority**: Files Collection (5 methods) - critical for import/export workflows

### **Implementation Best Practices**
1. **ALWAYS use the scaffolding script first** - saves time and ensures consistency
2. **Study the SDK documentation** before implementing
3. **Run format and lint** before any testing or commits
4. **Test incrementally** - build after each major change
5. **Follow existing patterns** from implemented domains
6. **Document special methods** (like `me()` in contributors)