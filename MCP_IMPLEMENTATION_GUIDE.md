# MCP Implementation Guide for Lokalise

This guide provides comprehensive instructions for implementing new MCP tools for the Lokalise MCP Server. It incorporates lessons learned from the contributors domain implementation and references the official Lokalise API SDK.

## Table of Contents
1. [Overview](#overview)
2. [Prerequisites](#prerequisites)
3. [Implementation Steps](#implementation-steps)
4. [SDK Reference Guide](#sdk-reference-guide)
5. [Common Pitfalls & Solutions](#common-pitfalls--solutions)
6. [Testing & Validation](#testing--validation)
7. [Examples & Patterns](#examples--patterns)

## Overview

The Lokalise MCP Server follows a domain-driven architecture with automated discovery. Each domain implements:
- **MCP Tools**: AI assistant capabilities via Model Context Protocol
- **CLI Commands**: Direct command-line interface
- **MCP Resources**: Queryable data resources

### Architecture Pattern
```
domains/
├── <domain>/
│   ├── index.ts              # Domain barrel exports
│   ├── <domain>.types.ts     # Zod schemas & type definitions
│   ├── <domain>.service.ts   # Lokalise API integration
│   ├── <domain>.controller.ts # Business logic orchestration
│   ├── <domain>.formatter.ts  # Response formatting
│   ├── <domain>.tool.ts      # MCP tool implementation
│   ├── <domain>.cli.ts       # CLI command implementation
│   └── <domain>.resource.ts  # MCP resource implementation
```

## Prerequisites

1. **Lokalise API SDK Documentation**: Located at `/node_modules/@lokalise/node-api/`
   - Type definitions: `/node_modules/@lokalise/node-api/dist/main.d.ts`
   - API examples: `/node_modules/@lokalise/node-api/docs/api/<domain>.md`
   - Collection classes: `/node_modules/@lokalise/node-api/dist/collections/<domain>.d.ts`

2. **Required Knowledge**:
   - TypeScript with strict mode
   - Zod schema validation
   - Lokalise API concepts
   - MCP protocol basics

## Implementation Steps

### Step 1: Use the Scaffolding Script

**ALWAYS use the scaffolding script first to generate the domain structure:**

#### Option A: Interactive Mode (for humans)
```bash
npm run scaffold:domain
```

#### Option B: CLI Mode (for AI agents - REQUIRED)
**For AI Agents**: Use the CLI command to save 99% of tokens:

```bash
npm run scaffold:domain:cli -- \
  -n glossary \
  -d "Glossary terms management for consistent translations" \
  -a glossaryTerms \
  -t list,get,create,update,delete \
  -r collection,detail \
  -c list,get,create
```


**Configuration Options:**
- `-n, --name <name>`: Domain name (lowercase, no spaces)
- `-d, --description <description>`: Domain description
- `-a, --api-endpoint <endpoint>`: API endpoint (default: /<name>)
- `-t, --tools <tools>`: Comma-separated operations: list,get,create,update,delete,bulkUpdate,bulkDelete
- `-r, --resources <resources>`: Comma-separated resource types: collection,detail
- `-c, --cli <commands>`: Comma-separated CLI commands (subset of tools)
- `-q, --quiet`: Quiet mode (only outputs domain name on success)

**Token Efficiency for AI Agents**:
- Manual creation: ~2,500+ lines = ~10,000+ tokens
- CLI scaffolding: 1 command = ~100 tokens
- **Savings: 99% token reduction**


### Step 2: Study the Lokalise SDK

1. **Check available methods** in `/node_modules/@lokalise/node-api/dist/collections/<domain>.d.ts`:
   ```typescript
   // Example from contributors.d.ts
   export declare class Contributors extends BaseCollection {
       list(request_params: ContributorsListParams): Promise<PaginatedResult<Contributor>>;
       get(user_id: string | number, request_params: ProjectOnly): Promise<Contributor>;
       create(raw_contributors: NewContributor[], request_params: ProjectOnly): Promise<BulkResult<Contributor>>;
       update(user_id: string | number, params: UpdateContributor, request_params: ProjectOnly): Promise<Contributor>;
       delete(user_id: string | number, request_params: ProjectOnly): Promise<any>;
       me(request_params: ProjectOnly): Promise<Contributor>;
   }
   ```

2. **Review API documentation** in `/node_modules/@lokalise/node-api/docs/api/<domain>.md`

3. **Identify SDK types** in `/node_modules/@lokalise/node-api/dist/main.d.ts`:
   ```typescript
   export interface Contributor {
       user_id: string | number;
       email: string;
       fullname: string;
       created_at: string;
       created_at_timestamp: number;
       is_admin: boolean;
       is_reviewer: boolean;
       languages: ContributorLanguage[];
       admin_rights: string[];
   }
   ```

### Step 3: Update Types File

1. **Import SDK types**:
   ```typescript
   import type {
       Contributor,
       NewContributor,
       UpdateContributor,
       ContributorLanguage,
       PaginatedResult,
       BulkResult
   } from "@lokalise/node-api";
   ```

2. **Create Zod schemas that match SDK types**:
   ```typescript
   export const ContributorLanguageSchema = z.object({
       lang_iso: z.string().describe("Language ISO code"),
       is_writable: z.boolean().optional().describe("Whether the contributor can edit translations")
   });

   export const ContributorRightsSchema = z.enum([
       "upload", "activity", "download", "settings",
       "create_branches", "statistics", "keys",
       "screenshots", "glossary", "contributors",
       "languages", "tasks"
   ]);
   ```

3. **Define tool argument schemas**:
   ```typescript
   export const ListContributorsToolArgs = z.object({
       projectId: z.string().describe("The ID of the Lokalise project"),
       page: z.number().int().positive().optional().describe("Page number for pagination"),
       limit: z.number().int().min(1).max(100).optional().describe("Number of items per page")
   });
   ```

### Step 4: Implement Service Layer

1. **Replace REPLACE_ME placeholders** with actual SDK methods:
   ```typescript
   // BEFORE (template):
   const result = await api.REPLACE_ME().list({

   // AFTER (implementation):
   const result = await api.contributors().list({
   ```

2. **Map Zod types to SDK types** for create/update operations:
   ```typescript
   const contributorsData = args.contributors.map((contributor) => ({
       email: contributor.email,
       fullname: contributor.fullname,
       is_admin: contributor.isAdmin,
       is_reviewer: contributor.isReviewer,
       languages: contributor.languages?.map(lang => ({
           lang_iso: lang.langIso,
           is_writable: lang.isWritable
       })),
       admin_rights: contributor.adminRights
   }));
   ```

3. **Handle special endpoints** (like `me()` for contributors):
   ```typescript
   async me(args: GetCurrentUserToolArgsType): Promise<Contributor> {
       const api = getLokaliseApi();
       const result = await api.contributors().me({
           project_id: args.projectId,
       });
       return result;
   }
   ```

### Step 5: Fix Common Issues

1. **Controller Response Type**:
   ```typescript
   // CORRECT - Only return content property
   return {
       content: formattedContent
   };

   // WRONG - Don't include data or metadata
   return {
       content: formattedContent,
       data: result,  // ❌ Remove this
       metadata: {}   // ❌ Remove this
   };
   ```

2. **Error Handling**:
   ```typescript
   // CORRECT - Use ErrorContext object
   throw handleControllerError(error, {
       source: "ContributorsController.listContributors",
       entityType: "Contributors",
       entityId: args.projectId,
       operation: "listing"
   });

   // WRONG - Don't pass string
   throw handleControllerError(error, "listing contributors"); // ❌
   ```

3. **MCP Tool Type Property**:
   ```typescript
   // CORRECT - Use "as const"
   return {
       content: [{
           type: "text" as const,
           text: result.content
       }]
   };

   // WRONG - Missing "as const"
   type: "text"  // ❌ TypeScript will complain
   ```

4. **Service Export Pattern**:
   ```typescript
   // CORRECT - Export as object
   export const contributorsService = {
       list: async (...) => { ... },
       get: async (...) => { ... }
   };

   // WRONG - Don't use default export
   export default { ... }; // ❌
   ```

### Step 6: Implement Additional Features

1. **Add domain-specific validations**:
   ```typescript
   // Validate language permissions
   if (contributor.languages?.some(lang => !lang.langIso)) {
       throw new McpError("Language ISO code is required", ErrorType.VALIDATION_ERROR);
   }
   ```

2. **Handle bulk operations properly**:
   ```typescript
   // Check for partial failures in bulk operations
   if (result.errors && result.errors.length > 0) {
       const errorDetails = result.errors.map(e => e.message).join(", ");
       logger.warn("Some contributors failed to create", { errors: errorDetails });
   }
   ```

3. **Implement pagination helpers**:
   ```typescript
   // Add pagination info to formatted output
   if (result.hasNextPage()) {
       content += `\n\n*Page ${result.currentPage} of ${result.totalPages}*`;
   }
   ```

## SDK Reference Guide

### Finding SDK Information

1. **Type Definitions**: `/node_modules/@lokalise/node-api/dist/main.d.ts`
   - Search for your domain interface (e.g., `interface Contributor`)
   - Look for related types (e.g., `NewContributor`, `UpdateContributor`)

2. **Collection Methods**: `/node_modules/@lokalise/node-api/dist/collections/<domain>.d.ts`
   - Shows available API methods
   - Parameter types and return types

3. **API Examples**: `/node_modules/@lokalise/node-api/docs/api/<domain>.md`
   - Working code examples
   - Common patterns and use cases

### SDK Patterns

1. **Pagination**:
   ```typescript
   // Standard pagination
   const result = await api.contributors().list({
       project_id: projectId,
       page: 1,
       limit: 100
   });
   result.totalResults; // Total count
   result.hasNextPage(); // Check for more
   ```

2. **Bulk Operations**:
   ```typescript
   // Create returns BulkResult with potential errors
   const result = await api.contributors().create(data, { project_id });
   if (result.errors?.length > 0) {
       // Handle partial failures
   }
   ```

3. **Project Context**:
   ```typescript
   // All methods require project_id in options
   { project_id: args.projectId }
   ```

## Common Pitfalls & Solutions

### 1. McpError Constructor Order
**Problem**: `new McpError("CONFIG_ERROR", "message")` fails
**Solution**: Use `new McpError("message", "CONFIG_ERROR")` - message first!

### 2. Missing McpError.fromError
**Problem**: `McpError.fromError()` doesn't exist
**Solution**: Use `createUnexpectedError(message, error)`

### 3. ControllerResponse Type Issues
**Problem**: TypeScript errors about data/metadata properties
**Solution**: Only return `{ content: string }`

### 4. handleControllerError Parameter
**Problem**: Expects ErrorContext object, not string
**Solution**: Pass object with source, entityType, entityId, operation

### 5. MCP Tool Registration Type Errors
**Problem**: TypeScript overload errors
**Solution**: Add `as const` to type property: `type: "text" as const`

### 6. Import Path Issues
**Problem**: Can't find modules
**Solution**: Always use `.js` extension in imports, even for TypeScript files

## Testing & Validation

### ⚠️ CRITICAL: Pre-Completion Checklist

**NEVER mark a task as completed without running ALL these checks:**

### 1. Format and Lint Code
```bash
# Run formatter first to fix any syntax issues
npm run format
# Should show "Formatted X files" with no errors

# Run linter to check code quality
npm run lint
# Should show "Checked X files" with no issues

# If linting shows errors, fix them with:
npx biome check src/domains/<domain> --fix
```

### 2. Build Verification
```bash
npm run build
# MUST compile without ANY errors
# If build fails, fix all TypeScript errors before proceeding
```

### 3. Type Checking
```bash
npx tsc --noEmit
# Should pass all type checks without errors
```

### 4. Manual Testing
```bash
# Test CLI commands
npm run cli -- list-<domain> <project-id>
# Verify command appears in help and executes properly

# Test MCP tools
npm run mcp:inspect
# Use Inspector to test each tool
```

### 5. Integration Testing
```bash
# Test with real API (requires valid API key)
LOKALISE_API_KEY=your-key npm test
```

### 6. Final Verification Checklist
- [ ] ✅ `npm run format` - No formatting issues
- [ ] ✅ `npm run lint` - No linting errors
- [ ] ✅ `npm run build` - Builds successfully
- [ ] ✅ All TypeScript errors resolved
- [ ] ✅ CLI commands appear in help menu
- [ ] ✅ No unused imports or variables
- [ ] ✅ All `any` types replaced with proper types

**IMPORTANT**: If ANY of these checks fail, the implementation is NOT complete!

## Examples & Patterns

### Working Domain Examples

1. **Keys Domain** (`/src/domains/keys/`):
   - Complex filtering and cursor pagination
   - Bulk operations (create/update/delete)
   - Translation content handling

2. **Languages Domain** (`/src/domains/languages/`):
   - System languages vs project languages
   - Progress tracking
   - Plural forms configuration

3. **Projects Domain** (`/src/domains/projects/`):
   - Statistics integration
   - Nested resource handling
   - Settings management

4. **Tasks Domain** (`/src/domains/tasks/`):
   - Status workflows
   - User assignment
   - Due date handling

### Formatting Patterns

```typescript
// List formatting with details
export function formatContributorsList(result: PaginatedResult<Contributor>): string {
    let content = `# Contributors (${result.totalResults} total)\n\n`;

    result.items.forEach((contributor) => {
        content += `## ${contributor.fullname}\n`;
        content += `- **Email**: ${contributor.email}\n`;
        content += `- **Role**: ${contributor.is_admin ? "Admin" : contributor.is_reviewer ? "Reviewer" : "Translator"}\n`;
        // ... more fields
    });

    return content;
}
```

### Error Context Patterns

```typescript
// Consistent error context across operations
const errorContext = {
    source: `${domainName}Controller.${methodName}`,
    entityType: domainName,
    entityId: args.projectId, // or complex: { project: id, item: id }
    operation: "listing" // listing, creating, updating, deleting, retrieving
};
```

## Next Steps After Implementation

1. **Update Domain Index**:
   ```typescript
   // src/domains/<domain>/index.ts
   export { default as contributorsTool } from "./contributors.tool.js";
   export { default as contributorsCli } from "./contributors.cli.js";
   export { default as contributorsResource } from "./contributors.resource.js";
   ```

2. **Verify Auto-Discovery**:
   - Domain should automatically register without manual imports
   - Check server startup logs for registration confirmation

3. **Update Documentation**:
   - Add domain to README.md implementation status
   - Update CLAUDE.md with any new patterns
   - Document any special endpoints or behaviors

4. **Create Tests**:
   - Unit tests for service methods
   - Controller tests with mocked services
   - Integration tests for real API calls

---

## Quick Reference Checklist

### Implementation Steps
- [ ] Run scaffolding script with correct operations
- [ ] Study SDK types in `/node_modules/@lokalise/node-api/dist/main.d.ts`
- [ ] Import SDK types in types file
- [ ] Replace all REPLACE_ME placeholders in service
- [ ] Fix controller to return only `{ content }`
- [ ] Add `as const` to MCP tool type properties
- [ ] Use correct error handling patterns
- [ ] Update domain barrel exports
- [ ] Document special endpoints or behaviors

### ⚠️ MANDATORY Pre-Completion Validation
- [ ] ✅ Run `npm run format` - Must show no errors
- [ ] ✅ Run `npm run lint` - Must show no issues
- [ ] ✅ Run `npx biome check src/domains/<domain> --fix` - Fix all issues
- [ ] ✅ Run `npm run build` - Must compile successfully
- [ ] ✅ Verify no TypeScript errors remain
- [ ] ✅ Test CLI command appears in help menu
- [ ] ✅ Remove all `any` types
- [ ] ✅ Remove all unused imports

**🚫 DO NOT mark task as completed if ANY check fails!**

Remember: The scaffolding script saves significant time and ensures consistency. Always start there and then customize based on the SDK documentation.