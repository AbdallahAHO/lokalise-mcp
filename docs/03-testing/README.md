# 🧪 Testing Documentation

Comprehensive testing guides and troubleshooting for the Lokalise MCP Server.

## Documents

### [Testing Guide](./TESTING-GUIDE.md)
Complete guide to writing tests with:
- Three-tier mocking architecture
- Mock builders and factories
- Snapshot testing
- Performance testing
- Coverage requirements

### [Test Troubleshooting](./TEST-TROUBLESHOOTING.md)
Quick fixes for common test issues:
- Mock not working
- Type errors
- Async issues
- Coverage problems

## Quick Testing Reference

### Running Tests

```bash
# Run all tests
npm test

# Run with coverage
npm run test:coverage

# Watch mode for development
npm run test:watch

# Run specific test file
npm test -- keys.service.test.ts

# Update snapshots
npm test -- --updateSnapshot
```

### Three-Tier Mocking Architecture

Our testing uses three distinct mock types:

```
┌─────────────────────────────────────────┐
│         Layer Being Tested              │
├─────────────────────────────────────────┤
│ Tool/Resource/CLI → Module Mocks        │
│ Controller → Mock Builders              │
│ Service → Mock Factory                  │
└─────────────────────────────────────────┘
```

### Quick Mock Examples

**1. Module Mock** (for Tool tests):
```javascript
// __mocks__/keys.controller.js
export default {
  listKeys: vi.fn(),
  getKey: vi.fn()
};
```

**2. Mock Builder** (for Controller tests):
```typescript
const mockData = new KeysMockBuilder()
  .withKey({ key_id: 123 })
  .withPagination(1, 100)
  .build();
```

**3. Mock Factory** (for Service tests):
```typescript
const mockApi = createMockLokaliseApi({
  failOnMethod: 'keys.list'
});
```

## Testing Standards

### Coverage Requirements
- **Target**: >80% overall coverage
- **Critical paths**: 100% coverage
- **New features**: Must include tests
- **Bug fixes**: Must include regression tests

### Test Organization
```
src/domains/{domain}/
├── __fixtures__/        # Test data
├── __snapshots__/       # Snapshots
├── *.test.ts           # Test files
└── __mocks__/          # Module mocks
```

### Writing Good Tests

**DO:**
- ✅ Test behavior, not implementation
- ✅ Use descriptive test names
- ✅ Keep tests isolated and independent
- ✅ Mock external dependencies
- ✅ Test error cases

**DON'T:**
- ❌ Use `any` type in tests
- ❌ Skip error scenarios
- ❌ Leave console.log in tests
- ❌ Ignore flaky tests
- ❌ Test private methods directly

## Common Testing Patterns

### Testing Async Operations
```typescript
it('should handle async operations', async () => {
  const result = await service.fetchData();
  expect(result).toBeDefined();
});
```

### Testing Error Cases
```typescript
it('should handle API errors', async () => {
  mockApi.keys.list.mockRejectedValue(new Error('API Error'));
  await expect(service.listKeys()).rejects.toThrow('API Error');
});
```

### Testing with Fixtures
```typescript
import { keysFixture } from './__fixtures__/keys.fixtures';

it('should format keys correctly', () => {
  const result = formatter.format(keysFixture);
  expect(result).toMatchSnapshot();
});
```

## Debugging Tests

### Enable Console Output
```typescript
import { restoreConsole } from '@/test-utils/setup';

it('debug test', () => {
  restoreConsole(); // Temporarily enable console
  console.log('Debug info');
});
```

### Run Single Test
```bash
npm test -- --testNamePattern="should list keys"
```

### Debug with VS Code
1. Set breakpoint in test
2. Use "Debug Vitest Tests" launch config
3. Step through test execution

## Test Utilities

Located in `src/test-utils/`:
- `setup.ts` - Global test configuration
- `mock-factory.ts` - API mock factory
- `mock-builders/` - Domain-specific builders
- `fixture-helpers/` - Data generators

---

*For detailed testing patterns and examples, see [TESTING-GUIDE.md](./TESTING-GUIDE.md)*