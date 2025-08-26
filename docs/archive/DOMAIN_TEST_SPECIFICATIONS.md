# Domain Test Specifications

## Overview

This document provides detailed test specifications for each domain in the lokalise-mcp project. Each specification includes test cases, coverage requirements, and acceptance criteria.

## Projects Domain (6 Tools)

### Service Layer Tests
**File**: `projects.service.test.ts`  
**Coverage Target**: 95%

#### Test Cases

| Test Case | Description | Priority |
|-----------|-------------|----------|
| List Projects - Default | Fetch projects with default pagination (page=1, limit=100) | HIGH |
| List Projects - Custom Pagination | Test with various page/limit combinations | HIGH |
| List Projects - Include Statistics | Verify statistics are properly included when requested | MEDIUM |
| List Projects - Empty Response | Handle empty project list gracefully | MEDIUM |
| Get Project - Valid ID | Fetch single project with all details | HIGH |
| Get Project - Invalid ID | Handle 404 error for non-existent project | HIGH |
| Create Project - Valid Data | Create project with all required fields | HIGH |
| Create Project - Minimal Data | Create with only name field | HIGH |
| Create Project - Validation Error | Handle missing required fields | HIGH |
| Create Project - Duplicate Name | Handle duplicate project names | MEDIUM |
| Update Project - Partial Update | Update specific fields only | HIGH |
| Update Project - Invalid Fields | Handle invalid update data | MEDIUM |
| Delete Project - Success | Delete existing project | HIGH |
| Delete Project - Not Found | Handle deletion of non-existent project | MEDIUM |
| Empty Project - Success | Remove all keys and translations | HIGH |
| Empty Project - Already Empty | Handle already empty project | LOW |
| Rate Limiting | Handle 429 responses with retry | HIGH |
| Authentication Error | Handle 401 unauthorized | HIGH |
| Server Error | Handle 500 internal server error | MEDIUM |

### Controller Layer Tests
**File**: `projects.controller.test.ts`  
**Coverage Target**: 90%

#### Test Cases

| Test Case | Description | Priority |
|-----------|-------------|----------|
| Input Validation - Page | Validate page number (positive integer) | HIGH |
| Input Validation - Limit | Validate limit (1-1000 range) | HIGH |
| Input Validation - Name | Validate project name (required, max length) | HIGH |
| Default Values | Apply correct defaults for optional params | HIGH |
| Response Formatting | Format response as Markdown | HIGH |
| Error Transformation | Convert service errors to McpError | HIGH |
| Metadata Generation | Generate correct metadata for pagination | MEDIUM |
| Logging Context | Verify correct logging context | LOW |

### Tool Layer Tests
**File**: `projects.tool.test.ts`  
**Coverage Target**: 85%

#### Test Cases

| Test Case | Description | Priority |
|-----------|-------------|----------|
| Tool Registration | All 6 tools registered correctly | HIGH |
| Schema Validation | Zod schemas validate inputs | HIGH |
| Tool Execution | Tools execute controller methods | HIGH |
| Error Propagation | Errors bubble up correctly | HIGH |
| Auto-Discovery | Tools discovered automatically | MEDIUM |

## Keys Domain (7 Tools)

### Service Layer Tests
**File**: `keys.service.test.ts`  
**Coverage Target**: 95%

#### Test Cases

| Test Case | Description | Priority |
|-----------|-------------|----------|
| List Keys - Standard Pagination | Fetch keys with page/limit | HIGH |
| List Keys - Cursor Pagination | Fetch keys with cursor | HIGH |
| List Keys - Next Cursor | Continue pagination with cursor | HIGH |
| List Keys - Response Too Big | Handle x-response-too-big header | HIGH |
| List Keys - Filter by Platform | Filter keys by platform (ios, android, web) | HIGH |
| List Keys - Filter by Tags | Filter keys by tags | MEDIUM |
| List Keys - Include Translations | Include translations in response | HIGH |
| Get Key - With Translations | Fetch single key with all translations | HIGH |
| Get Key - Not Found | Handle non-existent key | HIGH |
| Create Keys - Single | Create single key with translations | HIGH |
| Create Keys - Bulk (100) | Create 100 keys in single request | HIGH |
| Create Keys - Bulk (1000) | Create maximum 1000 keys | HIGH |
| Create Keys - Partial Failure | Handle partial failures in bulk | HIGH |
| Create Keys - Duplicate | Handle duplicate key names | HIGH |
| Update Key - Single | Update single key properties | HIGH |
| Update Key - Platforms | Update supported platforms | MEDIUM |
| Bulk Update - Success | Update multiple keys | HIGH |
| Bulk Update - Partial Failure | Handle locked keys in bulk update | HIGH |
| Delete Key - Single | Delete single key | HIGH |
| Delete Key - With Translations | Cascade delete translations | HIGH |
| Bulk Delete - Success | Delete multiple keys | HIGH |
| Bulk Delete - Locked Keys | Handle locked keys in deletion | MEDIUM |
| Performance - 1000 Keys | Create/update 1000 keys < 30s | HIGH |
| Memory Usage | Bulk operations < 200MB memory | MEDIUM |

### Controller Layer Tests
**File**: `keys.controller.test.ts`  
**Coverage Target**: 90%

#### Test Cases

| Test Case | Description | Priority |
|-----------|-------------|----------|
| Pagination Mode Selection | Choose standard vs cursor pagination | HIGH |
| Translation Inclusion | Include/exclude translations based on params | HIGH |
| Platform Filtering | Validate platform filter values | HIGH |
| Bulk Operation Validation | Validate bulk operation limits | HIGH |
| Response Formatting - List | Format key list as Markdown table | HIGH |
| Response Formatting - Details | Format key details with translations | HIGH |
| Error Handling - Bulk | Format bulk operation errors | HIGH |

## Languages Domain (6 Tools)

### Service Layer Tests
**File**: `languages.service.test.ts`  
**Coverage Target**: 95%

#### Test Cases

| Test Case | Description | Priority |
|-----------|-------------|----------|
| List System Languages | Fetch all available languages | HIGH |
| List System - Pagination | Paginate through system languages | MEDIUM |
| List Project Languages | Fetch languages for project | HIGH |
| List Project - With Progress | Include translation progress | HIGH |
| Add Languages - Single | Add single language to project | HIGH |
| Add Languages - Multiple | Add multiple languages at once | HIGH |
| Add Languages - Duplicate | Handle adding existing language | HIGH |
| Get Language - Details | Fetch language with statistics | HIGH |
| Update Language - Settings | Update language settings | MEDIUM |
| Update Language - Custom Name | Set custom language name | MEDIUM |
| Remove Language - Non-Base | Remove non-base language | HIGH |
| Remove Language - Base | Prevent removing base language | HIGH |
| Remove Language - With Translations | Handle cascade deletion | HIGH |

## Tasks Domain (5 Tools)

### Service Layer Tests
**File**: `tasks.service.test.ts`  
**Coverage Target**: 95%

#### Test Cases

| Test Case | Description | Priority |
|-----------|-------------|----------|
| List Tasks - All | List all project tasks | HIGH |
| List Tasks - Filter Status | Filter by task status | HIGH |
| List Tasks - Filter Title | Filter by title search | MEDIUM |
| List Tasks - Pagination | Paginate task list | HIGH |
| Get Task - Details | Fetch task with assignees | HIGH |
| Create Task - Basic | Create simple translation task | HIGH |
| Create Task - Multi-Language | Create task for multiple languages | HIGH |
| Create Task - With Assignees | Assign users to task | HIGH |
| Update Task - Status | Update task status | HIGH |
| Update Task - Progress | Update completion progress | HIGH |
| Update Task - Due Date | Modify task deadline | MEDIUM |
| Delete Task - Open | Delete open task | HIGH |
| Delete Task - Completed | Delete completed task | MEDIUM |

## Comments Domain (5 Tools)

### Service Layer Tests
**File**: `comments.service.test.ts`  
**Coverage Target**: 95%

#### Test Cases

| Test Case | Description | Priority |
|-----------|-------------|----------|
| List Key Comments | List comments for specific key | HIGH |
| List Project Comments | List all project comments | HIGH |
| List Comments - Pagination | Paginate comment lists | MEDIUM |
| Get Comment - Details | Fetch single comment details | HIGH |
| Create Comment - Single | Add comment to key | HIGH |
| Create Comments - Bulk | Add multiple comments | MEDIUM |
| Delete Comment - Own | Delete own comment | HIGH |
| Delete Comment - Others | Handle permission error | MEDIUM |

## Translations Domain (4 Tools)

### Service Layer Tests
**File**: `translations.service.test.ts`  
**Coverage Target**: 95%

#### Test Cases

| Test Case | Description | Priority |
|-----------|-------------|----------|
| List Translations - All | List all translations | HIGH |
| List - Cursor Pagination | Use cursor pagination | HIGH |
| List - Filter by Language | Filter by language ISO | HIGH |
| List - Filter by Review Status | Filter reviewed/unreviewed | HIGH |
| List - Filter by Verification | Filter verified/unverified | MEDIUM |
| Get Translation - Details | Fetch single translation | HIGH |
| Update Translation - Text | Update translation content | HIGH |
| Update Translation - Status | Update review/verification status | HIGH |
| Bulk Update - Success | Update multiple translations | HIGH |
| Bulk Update - Rate Limiting | Handle rate limits in bulk | HIGH |

## Contributors Domain (6 Tools)

### Service Layer Tests
**File**: `contributors.service.test.ts`  
**Coverage Target**: 95%

#### Test Cases

| Test Case | Description | Priority |
|-----------|-------------|----------|
| List Contributors | List project contributors | HIGH |
| List - With Permissions | Include permission details | HIGH |
| Get Contributor - Details | Fetch contributor info | HIGH |
| Get Current User | Fetch authenticated user | HIGH |
| Add Contributors - Single | Add single contributor | HIGH |
| Add Contributors - Multiple | Add multiple contributors | HIGH |
| Add - Duplicate Email | Handle existing contributor | HIGH |
| Update Contributor - Role | Change contributor role | HIGH |
| Update - Permissions | Modify permissions | HIGH |
| Remove Contributor | Remove from project | HIGH |
| Remove - Last Admin | Prevent removing last admin | HIGH |

## Glossary Domain (4 Tools)

### Service Layer Tests
**File**: `glossary.service.test.ts`  
**Coverage Target**: 95%

#### Test Cases

| Test Case | Description | Priority |
|-----------|-------------|----------|
| List Terms | List glossary terms | HIGH |
| List - Filter by Term | Search terms by text | MEDIUM |
| Get Term - Details | Fetch term with translations | HIGH |
| Create Term | Add new glossary term | HIGH |
| Update Term | Modify glossary term | HIGH |
| Delete Term | Remove glossary term | HIGH |

## Performance Test Specifications

### Bulk Operations
| Operation | Volume | Target Time | Memory Limit |
|-----------|--------|-------------|--------------|
| Create Keys | 1000 | < 30s | < 200MB |
| Update Keys | 1000 | < 30s | < 200MB |
| Delete Keys | 1000 | < 20s | < 100MB |
| List Keys (Cursor) | 10000 | < 60s | < 300MB |
| Create Projects | 100 | < 10s | < 100MB |

### Concurrent Operations
| Operation | Concurrency | Target Time | Error Rate |
|-----------|-------------|-------------|------------|
| Parallel Reads | 100 | < 5s | < 1% |
| Parallel Writes | 50 | < 10s | < 5% |
| Mixed Operations | 100 | < 15s | < 2% |

## Error Handling Specifications

### Required Error Tests Per Domain
| Error Type | HTTP Code | Test Required | Priority |
|------------|-----------|---------------|----------|
| Unauthorized | 401 | YES | HIGH |
| Forbidden | 403 | YES | HIGH |
| Not Found | 404 | YES | HIGH |
| Validation Error | 400 | YES | HIGH |
| Rate Limited | 429 | YES | HIGH |
| Server Error | 500 | YES | MEDIUM |
| Bad Gateway | 502 | NO | LOW |
| Service Unavailable | 503 | NO | LOW |

## Integration Test Specifications

### End-to-End Workflows
1. **Project Creation Workflow**
   - Create project
   - Add languages
   - Create keys with translations
   - Verify statistics
   - Clean up

2. **Translation Workflow**
   - Create keys
   - Add translations
   - Create task
   - Update translations
   - Mark as reviewed
   - Complete task

3. **Team Collaboration Workflow**
   - Add contributors
   - Assign permissions
   - Create tasks
   - Add comments
   - Review translations

## Coverage Requirements Summary

| Domain | Service | Controller | Tool | Resource | CLI | Overall |
|--------|---------|------------|------|----------|-----|---------|
| Projects | 95% | 90% | 85% | 85% | 80% | 90% |
| Keys | 95% | 90% | 85% | 85% | 80% | 90% |
| Languages | 95% | 90% | 85% | 85% | 80% | 90% |
| Tasks | 95% | 90% | 85% | 85% | 80% | 90% |
| Comments | 95% | 90% | 85% | 85% | 80% | 90% |
| Translations | 95% | 90% | 85% | 85% | 80% | 90% |
| Contributors | 95% | 90% | 85% | 85% | 80% | 90% |
| Glossary | 95% | 90% | 85% | 85% | 80% | 90% |

## Acceptance Criteria

### Per Domain
- [ ] All HIGH priority test cases implemented
- [ ] Coverage targets met for each layer
- [ ] All error scenarios tested
- [ ] Performance benchmarks passing
- [ ] No flaky tests
- [ ] Documentation complete

### Overall Project
- [ ] 90%+ total coverage achieved
- [ ] All domains have tests
- [ ] CI/CD pipeline green
- [ ] Performance tests passing
- [ ] Memory usage within limits
- [ ] Test execution < 15 minutes

---

**Document Version**: 1.0.0  
**Last Updated**: 2025-08-24  
**Related**: TEST_IMPLEMENTATION_GUIDE.md, AGENT_TASK_ASSIGNMENTS.md