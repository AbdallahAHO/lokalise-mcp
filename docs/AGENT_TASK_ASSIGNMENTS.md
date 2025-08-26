# Agent Task Assignments

## Overview

This document provides clear, actionable task assignments for agents to implement comprehensive test coverage for the lokalise-mcp project. Tasks are numbered, prioritized, and include specific success criteria.

## Current Status

- **Current Coverage**: ~25% (Updated from 18.18%)
- **Target Coverage**: 90%+
- **Total Test Files**: 11 active test files
- **Total Tests**: 236 passing tests (0 failures)
- **Phase 1 Status**: ✅ COMPLETE (Infrastructure + Projects Domain)
- **Testing Architecture**: Three-tier mocking system implemented
- **Type Safety**: Strict no-any policy enforced

## Task Assignment Matrix

| Task ID | Domain | Layer | Files to Create | Priority | Assigned To | Status |
|---------|--------|-------|-----------------|----------|-------------|--------|
| T001-T005 | Infrastructure | Setup | 5 | CRITICAL | test-writer-fixer | ✅ COMPLETE |
| T006-T010 | Projects | All Layers | 7 | HIGH | test-writer-fixer | ✅ COMPLETE |
| T011-T015 | Keys | Formatter | 2 | HIGH | test-writer-fixer | ✅ COMPLETE |
| T016-T020 | Tasks | Formatter | 2 | MEDIUM | test-writer-fixer | ✅ COMPLETE |
| T021-T025 | Keys | Service | 5 | HIGH | test-writer-fixer | PENDING |
| T026-T030 | Keys | Controller | 5 | HIGH | test-writer-fixer | PENDING |
| T031-T035 | Keys | Tool/Resource/CLI | 5 | MEDIUM | test-writer-fixer | PENDING |
| T036-T040 | Languages | Service | 5 | HIGH | test-writer-fixer | PENDING |
| T041-T045 | Languages | Controller | 5 | HIGH | test-writer-fixer | PENDING |
| T046-T050 | Languages | Tool/Resource/CLI | 5 | MEDIUM | test-writer-fixer | PENDING |
| T051-T055 | Tasks | All Layers | 5 | MEDIUM | test-writer-fixer | PENDING |
| T056-T060 | Comments | All Layers | 5 | MEDIUM | test-writer-fixer | PENDING |
| T061-T065 | Translations | All Layers | 5 | HIGH | test-writer-fixer | PENDING |
| T066-T070 | Contributors | All Layers | 5 | MEDIUM | test-writer-fixer | PENDING |
| T071-T075 | Glossary | All Layers | 5 | LOW | test-writer-fixer | PENDING |
| T076-T080 | Performance | All Domains | 5 | HIGH | api-tester | PENDING |
| T081-T085 | Integration | Workflows | 5 | HIGH | api-tester | PENDING |
| T086-T090 | CI/CD | Pipeline | 5 | HIGH | workflow-optimizer | PENDING |

## Phase 1: Infrastructure Setup (T001-T005) ✅ COMPLETE

### T001: Create Mock Factory System ✅ COMPLETE
**File**: `src/test-utils/mock-factory.ts`
**Success Criteria**:
- ✅ Mock factory created
- ✅ Type-safe implementation
- ✅ All domains covered
- ✅ Error simulation included

### T002: Create Fixture Helpers ✅ COMPLETE
**File**: `src/test-utils/fixture-helpers/index.ts`
**Success Criteria**:
- ✅ Builder pattern implemented
- ✅ Data generators created
- ✅ Error fixtures defined

### T003: Create Test Setup File ✅ COMPLETE
**File**: `src/test-utils/setup.ts`
**Success Criteria**:
- ✅ Jest configured
- ✅ Global mocks set up
- ✅ Custom matchers added

### T004: Create Performance Test Utilities ✅ COMPLETE
**File**: `src/test-utils/performance.util.ts`
**Success Criteria**:
- ✅ Performance measurement tools
- ✅ Memory tracking utilities
- ✅ Benchmark helpers

### T005: Create Test Scaffolding Script ✅ COMPLETE
**File**: `scripts/scaffold-tests.ts`
**Success Criteria**:
- ✅ CLI tool created
- ✅ Template generation working
- ✅ All domains supported

### Phase 1 Mock Builders ✅ COMPLETE
**Files Created**:
- ✅ `src/test-utils/mock-builders/keys.mock.ts`
- ✅ `src/test-utils/mock-builders/projects.mock.ts`
- ✅ `src/test-utils/mock-builders/tasks.mock.ts`
- ✅ `src/test-utils/mock-builders/languages.mock.ts`

### Phase 1 Test Infrastructure ✅ COMPLETE
**Files Enhanced**:
- ✅ `src/test-utils/error-simulator.ts` - Enhanced error simulation
- ✅ `src/test-utils/fixture-helpers/builders.ts` - Fluent API builders
- ✅ `src/test-utils/fixture-helpers/generators.ts` - Dynamic data generation
- ✅ `src/test-utils/fixture-helpers/errors.ts` - Error scenario helpers

### Phase 1 Achievements 🎉

**Test Results**:
- ✅ **All 236 tests passing**
- ✅ **0 failing tests**
- ✅ **Comprehensive snapshot tests**
- ✅ **Fast execution: < 1 second**
- ✅ **Coverage improved: 17.93% → ~25%**
- ✅ **Strict no-any policy enforced**

**Infrastructure Delivered**:
- ✅ **Three-Tier Mocking Architecture**:
  - Module Mocks (`__mocks__/`) for layer isolation
  - Mock Builders for realistic test data
  - Mock Factory for API simulation
- ✅ Domain-specific mock builders (4 domains)
- ✅ Fluent API pattern for test data creation
- ✅ Enhanced fixture helpers and generators
- ✅ Performance monitoring utilities
- ✅ Error simulation framework
- ✅ Automated test scaffolding script
- ✅ Strict TypeScript with no-any enforcement

**Quality Standards Met**:
- ✅ TypeScript compilation: No errors
- ✅ Linting: All checks passed
- ✅ Formatting: Code properly formatted
- ✅ Zero console errors or warnings

## Phase 2: Projects Domain (T006-T010) ✅ COMPLETE

### T006: Projects Service Tests ✅ COMPLETE
**File**: `src/domains/projects/projects.service.test.ts`
**Test Count**: 32 tests passing
**Success Criteria**:
- ✅ All API methods tested
- ✅ Error scenarios covered
- ✅ Mock Factory pattern implemented
- ✅ Type-safe with no-any compliance

### T007: Projects Controller Tests ✅ COMPLETE
**File**: `src/domains/projects/projects.controller.test.ts`
**Test Count**: 35 tests passing
**Success Criteria**:
- ✅ Input validation tested
- ✅ Response formatting verified
- ✅ Error transformation tested
- ✅ Mock Builders pattern used

### T008: Projects Tool Tests ✅ COMPLETE
**File**: `src/domains/projects/projects.tool.test.ts`
**Test Count**: 16 tests passing
**Success Criteria**:
- ✅ All 6 tools tested
- ✅ Schema validation verified (.shape property)
- ✅ Auto-discovery tested
- ✅ Module Mock pattern used

### T009: Projects Resource Tests ✅ COMPLETE
**File**: `src/domains/projects/projects.resource.test.ts`
**Test Count**: 16 tests passing
**Success Criteria**:
- ✅ URI parsing tested (lokalise:// protocol)
- ✅ Query parameters handled
- ✅ Both resources tested
- ✅ Module Mock pattern used

### T010: Projects CLI Tests ✅ COMPLETE
**File**: `src/domains/projects/projects.cli.test.ts`
**Test Count**: 25 tests passing
**Success Criteria**:
- ✅ All commands tested
- ✅ Argument parsing verified
- ✅ Output formatting tested
- ✅ Module Mock pattern used

## Phase 3: Keys Domain (T021-T035)

### T021: Keys Service Tests - Pagination
**File**: `src/domains/keys/keys.service.test.ts`
**Focus**: Cursor pagination implementation
**Success Criteria**:
- [ ] Standard pagination tested
- [ ] Cursor pagination tested
- [ ] Response too big handled
- [ ] Next cursor functionality

### T022: Keys Service Tests - CRUD
**Focus**: Create, Read, Update, Delete operations
**Success Criteria**:
- [ ] Single key operations
- [ ] Bulk operations (100, 1000 keys)
- [ ] Partial failures handled
- [ ] Performance benchmarks met

### T023: Keys Controller Tests
**File**: `src/domains/keys/keys.controller.test.ts`
**Success Criteria**:
- [ ] Pagination mode selection
- [ ] Translation inclusion logic
- [ ] Platform filtering
- [ ] Bulk validation

### T024: Keys Tool Tests
**File**: `src/domains/keys/keys.tool.test.ts`
**Success Criteria**:
- [ ] All 7 tools tested
- [ ] Bulk operation tools
- [ ] Schema validation

### T025: Keys Fixtures
**File**: `src/domains/keys/__fixtures__/keys.fixtures.ts`
**Success Criteria**:
- [ ] Comprehensive key fixtures
- [ ] Translation fixtures
- [ ] Pagination fixtures
- [ ] Error fixtures

## Phase 4: Languages Domain (T036-T050)

### T036-T040: Languages Complete Testing
**Files**:
- `languages.service.test.ts`
- `languages.controller.test.ts`
- `languages.tool.test.ts`
- `languages.resource.test.ts`
- `languages.cli.test.ts`

**Key Test Cases**:
- System languages listing
- Project language management
- Adding/removing languages
- Progress tracking

## Phase 5: Remaining Domains (T051-T075)

### T051-T055: Tasks Domain
**Priority**: MEDIUM
**Key Features**: Task creation, assignment, status management

### T056-T060: Comments Domain
**Priority**: MEDIUM
**Key Features**: Key comments, project comments

### T061-T065: Translations Domain
**Priority**: HIGH
**Key Features**: Cursor pagination, bulk updates, filtering

### T066-T070: Contributors Domain
**Priority**: MEDIUM
**Key Features**: Permission management, role assignment

### T071-T075: Glossary Domain
**Priority**: LOW
**Key Features**: Term management

## Phase 6: Advanced Testing (T076-T085)

### T076: Performance Test Suite
**File**: `src/test-utils/performance.test.ts`
**Tests**:
- Bulk operations (1000+ items)
- Memory usage monitoring
- Concurrent request handling
- Rate limiting compliance

### T077-T080: Domain Performance Tests
**Files**: One per domain
**Success Criteria**:
- [ ] Bulk operations < 30s
- [ ] Memory usage < 200MB
- [ ] Concurrent operations tested

### T081-T085: Integration Tests
**File**: `src/integration/workflows.test.ts`
**Workflows**:
1. Project creation workflow
2. Translation workflow
3. Team collaboration workflow
4. Import/export workflow
5. Review process workflow

## Phase 7: CI/CD Integration (T086-T090)

### T086: Jest CI Configuration
**File**: `jest.ci.config.js`
**Success Criteria**:
- [ ] Coverage thresholds enforced
- [ ] Parallel execution configured
- [ ] Reporter configuration

### T087: GitHub Actions Workflow
**File**: `.github/workflows/test.yml`
**Success Criteria**:
- [ ] Tests run on PR
- [ ] Coverage reports generated
- [ ] Performance monitored

### T088: Test Sharding Setup
**Success Criteria**:
- [ ] Tests split across workers
- [ ] Optimal shard distribution
- [ ] Execution time < 15 min

### T089: Coverage Reporting
**Success Criteria**:
- [ ] Coverage badges updated
- [ ] Reports accessible
- [ ] Trend tracking

### T090: Test Documentation
**Success Criteria**:
- [ ] All patterns documented
- [ ] Troubleshooting guide
- [ ] Best practices updated

## Three-Tier Mocking Architecture

### Mock Type Selection Guide

When implementing tests, use the correct mock type for each layer:

| Layer Being Tested | What to Mock | Mock Type | Location |
|-------------------|--------------|-----------|----------|
| Tool/Resource/CLI | Controller | Module Mock | `__mocks__/{module}.js` |
| Controller | Service | Module Mock + Mock Builders | `vi.mock()` + builders |
| Service | Lokalise API | Mock Factory | `mock-factory.ts` |
| Formatter | Nothing | Mock Builders | For input data only |

### Mock Implementation Patterns

1. **Module Mocks** (for Tool/Resource/CLI tests):
```javascript
// src/domains/{domain}/__mocks__/{domain}.controller.js
import { vi } from "vitest";
export default {
  listItems: vi.fn(),
  getItem: vi.fn(),
  // ... all controller methods
};
```

2. **Mock Builders** (for realistic test data):
```typescript
const mockData = new ProjectsMockBuilder()
  .withProject({ name: "Test", keys_total: 100 })
  .withPagination(1, 50)
  .build();
```

3. **Mock Factory** (for API simulation):
```typescript
const mockApi = createMockLokaliseApi({
  failOnMethod: "projects.list",
  delay: 100
});
```

## Execution Instructions

### For Each Task:

1. **Read Documentation**:
   - Review TESTING-GUIDE.md for three-tier architecture
   - Check NEW-DOMAIN-TESTING.md for patterns
   - Reference TEST-TROUBLESHOOTING.md for fixes

2. **Create Test File**:
   ```bash
   # Use scaffolding if available
   npm run scaffold:tests -- --domain projects --layer service
   
   # Or create manually
   touch src/domains/projects/projects.service.test.ts
   ```

3. **Implement Tests**:
   - Copy template from MOCK_IMPLEMENTATION_EXAMPLES.md
   - Adapt to specific domain
   - Follow test cases from DOMAIN_TEST_SPECIFICATIONS.md

4. **Verify Coverage**:
   ```bash
   # Run specific test
   npm test -- projects.service.test.ts
   
   # Check coverage
   npm run test:coverage -- projects.service.test.ts
   ```

5. **Fix Issues**:
   ```bash
   # Format code
   npm run format
   
   # Fix linting
   npm run lint -- --fix
   
   # Build check
   npm run build
   ```

6. **Update Status**:
   - Mark task as COMPLETED in this file
   - Update coverage percentage
   - Note any blockers

## Progress Tracking

### Week 1 Goals ✅ ACHIEVED
- ✅ T001-T005: Infrastructure (CRITICAL)
- ✅ T006-T010: Projects Domain (HIGH)
- ✅ T011-T015: Keys & Tasks Formatters (HIGH)
- ✅ Coverage: 18.18% → ~25%

### Week 2 Goals
- [ ] T021-T035: Keys Domain (HIGH)
- [ ] T036-T050: Languages Domain (HIGH)
- [ ] Coverage: 40% → 60%

### Week 3 Goals
- [ ] T051-T065: Tasks, Comments, Translations (MEDIUM/HIGH)
- [ ] Coverage: 60% → 75%

### Week 4 Goals
- [ ] T066-T075: Contributors, Glossary (MEDIUM/LOW)
- [ ] T076-T080: Performance Tests (HIGH)
- [ ] Coverage: 75% → 85%

### Week 5 Goals
- [ ] T081-T085: Integration Tests (HIGH)
- [ ] T086-T090: CI/CD Setup (HIGH)
- [ ] Coverage: 85% → 90%+

## Quality Gates

### Before Marking Task Complete:
- [ ] All test cases implemented
- [ ] Coverage target met
- [ ] No failing tests
- [ ] **NO `any` types used** (strict TypeScript)
- [ ] Code formatted (`npm run format`)
- [ ] Linting passed (`npm run lint`)
- [ ] Build successful (`npm run build`)
- [ ] Documentation updated
- [ ] Correct mock type used for layer

## Blocker Resolution

### Common Issues:

1. **Mock Not Working**
   - Check if using correct mock type for layer
   - Module mocks must be in `__mocks__/` directory
   - Verify vi.mock() placement (before imports)
   - Ensure `.js` extension in mock path

2. **Type Errors with `any`**
   - NEVER use `any` - it's forbidden
   - Use `unknown` as intermediate type
   - Create proper interfaces for mocks
   - Cast through `unknown`: `mockApi as unknown as LokaliseApi`

3. **MCP Tool Registration**
   - Must use `.shape` property for Zod schemas
   - Not the full schema object

4. **URL Parsing Issues**
   - `lokalise://` protocol behaves differently
   - Host becomes first path segment
   - Use proper NaN checking for numbers

5. **Coverage Below Target**
   - Add edge case tests
   - Test error scenarios
   - Cover all branches

6. **Flaky Tests**
   - Remove timing dependencies
   - Mock all external calls
   - Use proper async handling

## Communication Protocol

### Daily Updates
Post progress in this format:
```
Date: 2025-08-24
Tasks Completed: T001-T005 ✅ COMPLETE
Coverage: 17.93% → 18.18%
Blockers: None
Next: T006-T010 (Projects Domain)
Status: Phase 1 Infrastructure Setup COMPLETE 🎉
```

### Weekly Summary
```
Week 1 Partial Complete
Tasks: T001-T005 ✅ (Infrastructure Setup COMPLETE)
Coverage: 17.93% → 18.18%
On Track: YES
Achievements: 
- Zero failing tests (113/113 passing)
- Comprehensive mock infrastructure
- 4 domain-specific mock builders
- Performance and error simulation tools
- Automated test scaffolding
Issues: None
```

---

**Document Version**: 3.0.0  
**Last Updated**: 2025-08-26  
**Total Tasks**: 90  
**Completed Tasks**: T001-T020 (Projects Domain fully tested)  
**Phase 1 Status**: ✅ COMPLETE (Infrastructure + Projects + Partial formatters)  
**Testing Architecture**: Three-tier mocking system implemented  
**Type Safety**: Strict no-any policy enforced  
**Current Tests**: 236 passing (0 failures)  
**Estimated Completion**: 3-4 weeks remaining  
**Success Metric**: 90%+ coverage achieved