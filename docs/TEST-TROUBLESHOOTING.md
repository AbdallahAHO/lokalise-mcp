# Test Troubleshooting Quick Reference

## Common Test Issues and Solutions

This is a focused troubleshooting guide for the most common test issues encountered during development. Solutions have been tested and validated during Phase 1 Infrastructure Setup.

**Phase 1 Status**: ✅ COMPLETE - All 113 tests passing with zero failures!

## Quick Fixes

### 1. TypeScript Compilation Errors in Tests

**Error**: `Property 'hasNextPage' is missing in type`
```bash
src/domains/keys/keys.formatter.test.ts:64:25 - error TS2322
```

**Fix**: Use mock builders instead of manual mock creation
```typescript
// ❌ Bad: Manual mock creation
const mockResult: PaginatedResult<Key> = {
  items: [],
  totalResults: 0
  // Missing pagination methods
};

// ✅ Fixed: Use mock builder
const mockBuilder = new KeysMockBuilder();
const result = mockBuilder
  .withKey({ description: "test" })
  .withPagination(1, 100)
  .build(); // Complete interface implementation
```

### 2. Snapshot Test Failures

**Error**: Snapshot differs with timestamps
```
- Received  + Expected
- Created: 2024-08-24 15:32:41
+ Created: 2024-01-15 10:30:00
```

**Fix**: Mock Date constructor consistently (Phase 1 validated pattern)
```typescript
describe("FormatterTests", () => {
  const mockDate = new Date("2024-01-15T10:30:00.000Z");
  let originalDate: DateConstructor;

  beforeAll(() => {
    originalDate = global.Date;
    global.Date = class extends originalDate {
      constructor(...args: ConstructorParameters<DateConstructor>) {
        if (args.length === 0) {
          super(mockDate.getTime());
        } else {
          super(...args);
        }
      }
      static now() { return mockDate.getTime(); }
    } as DateConstructor;

    // Preserve static methods (CRITICAL for avoiding errors)
    global.Date.UTC = originalDate.UTC;
    global.Date.parse = originalDate.parse;
  });

  afterAll(() => {
    global.Date = originalDate;
  });
});
```

### 3. Mock Builder State Pollution

**Error**: Tests pass individually but fail when run together
```
Expected 1 key, received 3 keys
```

**Fix**: Create fresh builder instances per test
```typescript
describe("Tests", () => {
  let builder: KeysMockBuilder;

  beforeEach(() => {
    builder = new KeysMockBuilder(); // Fresh instance
  });

  // Tests now have isolated state
  it("should work independently", () => {
    const result = builder.withKey({ name: "Test" }).build();
    expect(result.items).toHaveLength(1);
  });
});
```

### 4. Pagination Type Confusion

**Error**: `Type 'PaginatedResult<Key>' is not assignable to 'CursorPaginatedResult<Key>'`

**Fix**: Use appropriate mock builder methods
```typescript
// ✅ Standard pagination
const standardResult = mockBuilder
  .withKey({ name: "Standard" })
  .withPagination(1, 100)
  .build();

// ✅ Cursor pagination
const cursorResult = mockBuilder
  .withKey({ name: "Cursor" })
  .withCursorPagination("cursor-123", 100)
  .build();

console.log(standardResult.currentPage); // 1
console.log(cursorResult.nextCursor); // "cursor-123"
```

### 5. Test Expectations Mismatch

**Error**: Test expects raw data but gets formatted output
```
Expected: "key_id: 123"
Received: "**Key ID**: 123"
```

**Fix**: Test formatted Markdown output expectations
```typescript
// ✅ Test actual formatter output
expect(result).toContain("**Key ID**: 123");
expect(result).toContain("# Translation Key Details");
expect(result).toContain("## Translations");
```

### 6. Mock Builder Chaining Issues

**Error**: `Cannot read properties of undefined` when chaining methods
```typescript
// ❌ Problem: Chaining without initial item
const result = mockBuilder
  .withTranslations([...]) // No key to attach translations to
  .build();
```

**Fix**: Ensure proper method order
```typescript
// ✅ Fixed: Create key first, then add translations
const result = mockBuilder
  .withKey({ description: "Base key" })
  .withTranslations([
    { language_iso: "en", translation: "Hello" }
  ])
  .build();
```

### 7. Bulk Operations Testing

**Error**: Testing bulk operations without proper error simulation
```typescript
// ❌ Problem: Not testing partial failures
const result = mockBuilder
  .withKey({ name: "Success 1" })
  .withKey({ name: "Success 2" })
  .build();
```

**Fix**: Use buildBulkResult for testing create/update operations
```typescript
// ✅ Fixed: Test bulk operations with errors
const bulkResult = mockBuilder
  .withKey({ name: "Success 1" })
  .withKey({ name: "Success 2" })
  .buildBulkResult([
    { item: { name: "Failed" }, message: "Validation error" }
  ]);

expect(bulkResult.items).toHaveLength(2);
expect(bulkResult.errors).toHaveLength(1);
```

## Error Patterns and Solutions

### Pattern: "Cannot read properties of undefined"

**Typical Causes:**
1. Missing mock builder setup
2. Incomplete object initialization
3. Wrong method chaining order

**Debug Steps:**
```typescript
// 1. Use mock builders consistently
const mockBuilder = new KeysMockBuilder();

// 2. Log the actual object structure
const result = mockBuilder.withKey({}).build();
console.log(JSON.stringify(result, null, 2));

// 3. Use generators for realistic data
const result = mockBuilder
  .withKey({
    key_id: generators.key.id(),
    key_name: generators.key.name()
  })
  .build();
```

### Pattern: Jest Module Resolution Failures

**Error**: `SyntaxError: Cannot use import statement outside a module`

**Fix**: Verified jest.config.js configuration (Phase 1 validated)
```javascript
export default {
  preset: "ts-jest/presets/default-esm",
  testEnvironment: "node",
  extensionsToTreatAsEsm: [".ts"],
  moduleNameMapping: {
    "^(\\.{1,2}/.*)\\.js$": "$1",
  },
  transform: {
    "^.+\\.tsx?$": ["ts-jest", { useESM: true }],
  },
  transformIgnorePatterns: ["node_modules/(?!(@lokalise/node-api)/)"],
  // Critical for UTC timestamps
  testEnvironment: "node",
  setupFilesAfterEnv: ["<rootDir>/src/test-utils/setup.ts"],
};
```

### Pattern: Memory Leaks and Performance Issues

**Symptoms:**
- Tests slow down over time
- Jest warnings about memory usage
- Tests timeout randomly

**Fix**: Proper cleanup (Phase 1 established pattern)
```typescript
describe("DomainTests", () => {
  let mockBuilder: DomainMockBuilder;
  let originalDate: DateConstructor;

  beforeAll(() => {
    // Mock Date once per test suite
    originalDate = global.Date;
    // ... date mocking setup
  });

  beforeEach(() => {
    // Fresh builder per test
    mockBuilder = new DomainMockBuilder();
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.restoreAllMocks();
  });

  afterAll(() => {
    // Restore global modifications
    global.Date = originalDate;
  });
});
```

### Pattern: Inconsistent Generator Data

**Error**: Tests fail randomly due to dynamic data generation
```typescript
// ❌ Problem: Random data in snapshots
const key_id = Math.floor(Math.random() * 1000000);
```

**Fix**: Use deterministic generators with Phase 1 patterns
```typescript
// ✅ Fixed: Deterministic generator functions
import { generators } from "../test-utils/fixture-helpers/generators.js";

const result = mockBuilder
  .withKey({
    key_id: generators.key.id(), // Deterministic within test run
    created_at: generators.timestamp().formatted // Consistent format
  })
  .build();
```

## Debugging Strategies

### 1. Isolate the Problem

```bash
# Run single test file
npm test keys.formatter.test.ts

# Run specific test
npm test -- --testNamePattern="should format key details"

# Run with verbose output for troubleshooting
npm test -- --verbose

# Run tests serially to avoid race conditions
npm test -- --runInBand
```

### 2. Enable Console Output

```typescript
import { restoreConsole } from '../test-utils/setup.js';

it('should debug mock builder issue', () => {
  restoreConsole(); // Temporarily restore console

  const mockBuilder = new KeysMockBuilder();
  const result = mockBuilder.withKey({ name: "Debug" }).build();

  console.log('Mock result:', JSON.stringify(result, null, 2));
  console.log('Items count:', result.items.length);
  console.log('Pagination methods:', {
    hasNextPage: typeof result.hasNextPage,
    totalResults: result.totalResults
  });

  // Your test code
});
```

### 3. Use Jest Debugging

```bash
# Debug with Node.js inspector
node --inspect-brk node_modules/.bin/jest --runInBand

# Debug specific test
node --inspect-brk node_modules/.bin/jest --runInBand --testNamePattern="your test name"
```

### 4. Mock Builder Debugging

```typescript
// Debug mock builder state
describe("MockBuilderDebugging", () => {
  it("should debug builder state", () => {
    const builder = new KeysMockBuilder();

    // Step 1: Check empty state
    console.log("Empty builder:", builder.build().items.length); // 0

    // Step 2: Add items and check
    builder.withKey({ name: "Test 1" });
    console.log("After first key:", builder.build().items.length); // 1

    builder.withKey({ name: "Test 2" });
    console.log("After second key:", builder.build().items.length); // 2

    // Step 3: Check final result
    const result = builder.build();
    console.log("Final result:", result.items.map(item => item.name));
  });
});
```

## Quick Validation Commands

```bash
# Phase 1 validated command sequence
# 1. Run linting (fix formatting issues)
npm run lint

# 2. Check formatting
npm run format

# 3. TypeScript compilation (must be clean)
npm run build

# 4. Run tests (all must pass)
npm test

# 5. Check coverage
npm run test:coverage

# 6. Update snapshots if needed
npm test -- --updateSnapshot
```

## Test Quality Checklist

When fixing test issues, ensure:

- [ ] **Tests pass individually**: `npm test -- keys.formatter.test.ts`
- [ ] **Tests pass in suite**: `npm test`
- [ ] **No TypeScript errors**: `npm run build`
- [ ] **Linting passes**: `npm run lint`
- [ ] **Proper formatting**: `npm run format`
- [ ] **Mock builders used**: No manual mock creation
- [ ] **Fresh instances**: New builder per test
- [ ] **Date mocking**: Consistent timestamps
- [ ] **Snapshots reviewed**: Changes are intentional
- [ ] **Coverage maintained**: Above 18% threshold (current baseline)

## Phase 1 Solutions Validated

### Mock Builder Solutions ✅

All mock builder patterns have been tested with 113 passing tests:

```typescript
// ✅ Keys domain - 66 snapshot tests passing
const keysResult = new KeysMockBuilder()
  .withKey({ description: "Tested pattern" })
  .withTranslations([{ language_iso: "en", translation: "Test" }])
  .withCursorPagination("cursor", 100)
  .build();

// ✅ Projects domain - All formatter tests passing
const projectsResult = new ProjectsMockBuilder()
  .withProject({ name: "Test Project", statistics: { keys_total: 50 } })
  .withPagination(1, 10)
  .build();

// ✅ Tasks domain - Complex progress tracking
const tasksResult = new TasksMockBuilder()
  .withTask({ status: "in_progress", progress: { total: 100, completed: 75 } })
  .build();

// ✅ Languages domain - RTL support
const languagesResult = new LanguagesMockBuilder()
  .withLanguage({ lang_iso: "ar", is_rtl: true })
  .build();
```

### Date Mocking Solutions ✅

Consistent date mocking pattern used across all 66 snapshot tests:

```typescript
// ✅ Validated date mocking (no snapshot failures)
const mockDate = new Date("2024-01-15T10:30:00.000Z");
// [Established pattern preserved - all tests passing]
```

## Emergency Fixes

### Reset All Snapshots
```bash
npm test -- --updateSnapshot
```

### Clear Jest Cache
```bash
npx jest --clearCache
```

### Reset Node Modules
```bash
rm -rf node_modules package-lock.json
npm install
```

### Force Garbage Collection
```bash
NODE_OPTIONS="--max-old-space-size=4096" npm test
```

## Common Anti-Patterns to Avoid

### ❌ Don't Do This

```typescript
// Manual mock creation (Type errors guaranteed)
const mockResult = {
  items: [{ key_id: 123, /* missing 50+ properties */ }]
};

// Shared test state (State pollution)
const builder = new MockBuilder(); // Outside test

// Ignoring TypeScript errors
const result = mockData as unknown;

// Testing implementation details
expect(mockService.internalMethod).toHaveBeenCalled();

// Dynamic data in snapshots
expect(formatResult()).toMatchSnapshot(); // Contains timestamps
```

### ✅ Do This Instead (Phase 1 Validated)

```typescript
// Use mock builders (100% type safety)
const mockBuilder = new KeysMockBuilder();
const result = mockBuilder.withKey({ key_id: 123 }).build();

// Isolated test state (No pollution)
beforeEach(() => {
  builder = new KeysMockBuilder();
});

// Proper TypeScript usage
const result: PaginatedResult<Key> = mockBuilder.build();

// Test behavior (What matters to users)
expect(result.content).toContain("expected output");

// Stable snapshots (Date mocking applied)
beforeAll(() => mockDateSetup());
expect(formatResult()).toMatchSnapshot();
```

## Success Metrics

### Phase 1 Achievements 🎉

- ✅ **0 failing tests** (113/113 passing)
- ✅ **0.663 seconds** execution time
- ✅ **66 snapshot tests** stable
- ✅ **4 mock builders** operational
- ✅ **Zero TypeScript errors**
- ✅ **All linting checks passed**
- ✅ **Coverage baseline**: 18.18%

### Quality Standards Met

- ✅ **Mock isolation**: No state pollution between tests
- ✅ **Date consistency**: All snapshots stable with date mocking
- ✅ **Type safety**: Complete SDK interface implementation
- ✅ **Error handling**: Comprehensive error simulation
- ✅ **Performance**: Sub-second test execution

---

*For detailed explanations and examples, see the full [Testing Guide](./TESTING-GUIDE.md) and [New Domain Testing](./NEW-DOMAIN-TESTING.md) guides.*