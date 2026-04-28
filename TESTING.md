# Testing Guide

## Overview

This project uses **Test-Driven Development (TDD)** approach with Vitest and React Testing Library to ensure code quality and prevent regressions.

## Test Stack

- **Vitest**: Fast unit test framework (Vite-native)
- **React Testing Library**: Testing utilities for React components
- **@testing-library/jest-dom**: Custom matchers for DOM assertions
- **@testing-library/user-event**: User interaction simulation
- **jsdom**: DOM implementation for Node.js

## Running Tests

```bash
# Run tests in watch mode (development)
npm test

# Run tests once (CI/CD)
npm run test:run

# Run tests with UI
npm run test:ui

# Run tests with coverage report
npm run test:coverage
```

## Test Structure

```
src/
├── services/
│   ├── db.js
│   └── db.test.js          # Database utility tests
├── utils/
│   ├── helpers.js
│   └── helpers.test.js     # Helper function tests
└── test/
    └── setup.js            # Test configuration
```

## TDD Workflow

### 1. Write Test First (Red)

```javascript
// helpers.test.js
describe('formatSalary', () => {
  it('should format number with thousand separators', () => {
    expect(formatSalary(5000000)).toBe('5.000.000');
  });
});
```

### 2. Implement Minimum Code (Green)

```javascript
// helpers.js
export function formatSalary(value) {
  if (!value) return '0';
  const numericValue = String(value).replace(/\D/g, '');
  return numericValue.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}
```

### 3. Refactor (Refactor)

- Improve code quality
- Add edge case handling
- Optimize performance
- Ensure tests still pass

## Test Coverage

Current test coverage:

- **Utility Functions**: 100% (27 tests)
- **Database Functions**: 100% (18 tests)
- **Total**: 45 tests passing

### Tested Functions

#### Utility Helpers (`src/utils/helpers.js`)

- ✅ `formatSalary()` - Format numbers with thousand separators
- ✅ `parseSalary()` - Parse formatted salary to number
- ✅ `isValidEmail()` - Email validation
- ✅ `isValidPhone()` - Indonesian phone validation
- ✅ `sanitizeInput()` - XSS prevention
- ✅ `calculateAge()` - Age calculation from birth date
- ✅ `formatDate()` - Indonesian date formatting
- ✅ `generateId()` - Random ID generation

#### Database Functions (`src/services/db.js`)

- ✅ `calcItemScore()` - Score calculation per assessment item
- ✅ `RATING_MULTIPLIER` - Rating multiplier constants
- ✅ Excel formula compliance - Matches Excel scoring exactly

## Writing New Tests

### Example: Testing a New Utility Function

```javascript
// 1. Write test first (TDD)
describe('newFunction', () => {
  it('should do something', () => {
    const result = newFunction(input);
    expect(result).toBe(expectedOutput);
  });

  it('should handle edge cases', () => {
    expect(newFunction(null)).toBe(defaultValue);
    expect(newFunction('')).toBe(defaultValue);
  });
});

// 2. Implement function
export function newFunction(input) {
  if (!input) return defaultValue;
  // Implementation
  return result;
}

// 3. Run tests
npm test
```

### Example: Testing React Components

```javascript
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import MyComponent from './MyComponent';

describe('MyComponent', () => {
  it('should render correctly', () => {
    render(<MyComponent />);
    expect(screen.getByText('Hello')).toBeInTheDocument();
  });

  it('should handle user interaction', async () => {
    render(<MyComponent />);
    const button = screen.getByRole('button');
    fireEvent.click(button);
    expect(screen.getByText('Clicked')).toBeInTheDocument();
  });
});
```

## Best Practices

### 1. Test Naming

Use descriptive test names that explain what is being tested:

```javascript
// ✅ Good
it('should format 5000000 as "5.000.000"', () => {});

// ❌ Bad
it('test1', () => {});
```

### 2. Arrange-Act-Assert Pattern

```javascript
it('should calculate age correctly', () => {
  // Arrange
  const birthDate = new Date('1998-01-01');
  
  // Act
  const age = calculateAge(birthDate);
  
  // Assert
  expect(age).toBeGreaterThan(20);
});
```

### 3. Test Edge Cases

Always test:
- Null/undefined inputs
- Empty strings
- Zero values
- Boundary conditions
- Invalid inputs

```javascript
describe('formatSalary', () => {
  it('should handle normal input', () => {
    expect(formatSalary(5000000)).toBe('5.000.000');
  });

  it('should handle edge cases', () => {
    expect(formatSalary(0)).toBe('0');
    expect(formatSalary(null)).toBe('0');
    expect(formatSalary('')).toBe('0');
    expect(formatSalary(undefined)).toBe('0');
  });
});
```

### 4. Keep Tests Independent

Each test should be independent and not rely on other tests:

```javascript
// ✅ Good - Independent tests
it('should add item', () => {
  const list = [];
  list.push('item');
  expect(list).toHaveLength(1);
});

it('should remove item', () => {
  const list = ['item'];
  list.pop();
  expect(list).toHaveLength(0);
});
```

### 5. Mock External Dependencies

```javascript
import { vi } from 'vitest';

// Mock Firebase
vi.mock('../firebase', () => ({
  db: {},
  auth: {},
}));

// Mock toast notifications
vi.mock('react-hot-toast', () => ({
  default: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));
```

## Continuous Integration

Tests run automatically on:
- Every commit
- Pull requests
- Before deployment

### GitHub Actions Example

```yaml
name: Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm install
      - run: npm run test:run
```

## Coverage Reports

Generate coverage reports:

```bash
npm run test:coverage
```

View coverage in:
- Terminal output
- `coverage/index.html` (HTML report)
- `coverage/coverage-final.json` (JSON report)

## Debugging Tests

### Run specific test file

```bash
npm test -- helpers.test.js
```

### Run specific test

```bash
npm test -- -t "should format salary"
```

### Debug in VS Code

Add to `.vscode/launch.json`:

```json
{
  "type": "node",
  "request": "launch",
  "name": "Debug Tests",
  "runtimeExecutable": "npm",
  "runtimeArgs": ["test"],
  "console": "integratedTerminal"
}
```

## Common Issues

### Issue: Tests fail with "Cannot find module"

**Solution**: Check import paths and ensure files exist

### Issue: Tests timeout

**Solution**: Increase timeout in vitest.config.js:

```javascript
export default defineConfig({
  test: {
    testTimeout: 10000, // 10 seconds
  },
});
```

### Issue: Mock not working

**Solution**: Ensure mock is defined before import:

```javascript
vi.mock('./module', () => ({
  default: vi.fn(),
}));

import MyComponent from './MyComponent';
```

## Resources

- [Vitest Documentation](https://vitest.dev/)
- [React Testing Library](https://testing-library.com/react)
- [Testing Best Practices](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)
- [TDD Guide](https://martinfowler.com/bliki/TestDrivenDevelopment.html)

---

**Remember**: Write tests first, then implement. This ensures your code is testable and meets requirements from the start!
