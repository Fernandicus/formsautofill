---
name: typescript-testing
description: Principles and guidelines for writing high-quality, readable, and maintainable tests using Vitest and TypeScript. Trigger this when creating, modifying, or reviewing unit, integration, or end-to-end tests.
---

# TypeScript Testing

This skill provides guidelines and best practices for writing tests that are readable, maintainable, deterministic, and serve as excellent documentation.

## When to Use

Use this skill when:
- **Writing New Tests:** Designing test cases for functions, modules, components, or UI workflows.
- **Refactoring Test Files:** Reviewing test files to clean up setups, mocks, and assertions.
- **Reviewing Pull Requests:** Checking if newly introduced tests meet repository standards (e.g., they test behavior rather than implementation, avoid loops/logic, and handle boundaries deterministically).

## When NOT to Use

Do NOT use this skill when:
- **Configuring Run Scripts:** Modifying test runner configurations, pipelines, or CI environments (refer to [typescript-infrastructure](../typescript-infrastructure/SKILL.md) for build tool configurations).
- **Following RGR Steps:** Strictly practicing the Red-Green-Refactor sequence itself (refer to [test-driven-development](../test-driven-development/SKILL.md) for the TDD cycle workflow).

## Related Documentation

- For strict Red-Green-Refactor loops, refer to [test-driven-development](../test-driven-development/SKILL.md).
- For common testing pitfalls and mocking mistakes, refer to [testing-anti-patterns.md](../test-driven-development/testing-anti-patterns.md).

---

### Notes

- Vitest and Testing Library is a testing framework for TypeScript that is used to test TypeScript code.
- Use the `__tests__` directory into the root folder for test files.
- Follow the same directory structure for the tests as the production code, but with the `__tests__` directory inside of it. For example, if you have `app/shared/utils/dlp.ts`, you should have `__tests__/shared/utils/dlp.test.ts`.
- Mocks should be in their own folder inside of the `__tests__` directory, next to the test files. For example, if you have `__tests__/shared/utils/dlp.test.ts`, you should have `__tests__/shared/utils/__mocks__/dlp.test.ts`.

## 1. Structure with Arrange-Act-Assert (AAA)

Every test should be structured into three distinct phases, visually separated by empty lines. This makes it instantly clear what is being set up, what is being executed, and what is being verified.

*   **Arrange:** Set up the test data, mocks, and initial state.
*   **Act:** Invoke the method or trigger the behavior under test.
*   **Assert:** Verify that the expected outcome occurred.

> [!NOTE]
> For a concrete TypeScript example demonstrating the AAA pattern, refer to [aaa-pattern.test.ts](./samples/aaa-pattern.test.ts).

---

## 2. Test Behavior, Not Implementation Details

Tests should treat the unit under test as a "black box" as much as possible. Focus on testing the public API and user-observable outcomes, not the internal code paths, private properties, or helper methods.

> [!NOTE]
> For a comparison between brittle tests targeting private state and robust tests targeting public behavior, refer to [behavior-vs-implementation.test.ts](./samples/behavior-vs-implementation.test.ts).

---

## 3. Write Deterministic and Isolated Tests

Tests must pass or fail consistently regardless of the execution order, execution environment, or local time.

*   **No Shared Mutable State:** Clean up and recreate test fixtures before/after each test. Avoid global state mutations.
*   **Mock Network & Filesystem Boundaries:** Use Vitest mocks or MSW (Mock Service Worker) for API requests. Do not make real external network requests.
*   **Control Time and Randomness:** If your code depends on the current date, time, or random values, mock them.

> [!NOTE]
> For a demonstration on mocking system clocks and timers in Vitest, refer to [deterministic-time.test.ts](./samples/deterministic-time.test.ts).

---

## 4. Descriptive, Intention-Revealing Naming

Test names should describe the scenario, the trigger/action, and the expected result clearly. Anyone reading the test runner output should instantly understand what failed and why.

*   **Structure:** `should [expected outcome] when [scenario/conditions]`

| Bad Names | Good Names |
| :--- | :--- |
| `test('email validation')` | `should return false when email does not contain @ symbol` |
| `test('login')` | `should redirect to dashboard when login credentials are valid` |
| `test('retry fails')` | `should throw MaxRetriesExceededError when API calls fail repeatedly` |

---

## 5. Specific and Expressive Assertions

Use specific Vitest matchers to obtain clear, descriptive error logs when a test fails. Avoid wrapping everything in generic assertions like `toBe(true)` or `toBeTruthy()`.

```typescript
// ❌ BAD: Generic assertions yield poor error messages (e.g., "expected true, got false")
expect(users.length === 3).toBe(true);
expect(result === null).toBe(false);
expect(errorMessage.includes('Invalid format')).toBe(true);

// ✅ GOOD: Expressive assertions yield precise error messages
expect(users).toHaveLength(3);
expect(result).not.toBeNull();
expect(errorMessage).toContain('Invalid format');
```

---

## 6. Keep Logic Out of Test Cases

Tests should follow a simple, linear flow of execution. Avoid loops, `if/else` conditions, or complex ternary logic inside your test cases. If a test case contains logic, you will eventually need tests to verify the tests.

> [!NOTE]
> For a comparison showing complex loops vs clean, flat, and linear test cases, refer to [logic-free.test.ts](./samples/logic-free.test.ts).

---

## 7. Mocking: Mock Sparingly and at Boundaries

Mocks are a double-edged sword. Over-mocking leads to tests that pass while the actual application is broken.

*   **Mock Boundaries:** Mock databases, networks, and slow third-party service integration points.
*   **Prefer Real Code:** Do not mock pure utility functions, helper libraries, or simple internal classes.
*   **Mock Complete Schemas:** If you must mock data, ensure it matches the actual runtime shape or API response schema. Incomplete mocks hide type mismatches and break downstream code unexpectedly.

> [!IMPORTANT]
> Always refer to [testing-anti-patterns.md](../test-driven-development/testing-anti-patterns.md) for detailed descriptions of common mocking pitfalls, such as asserting on mock behavior rather than component outputs.

---

## 8. DAMP Over DRY in Test Suites

While the DRY (Don't Repeat Yourself) principle is critical in production code, test suites should prioritize being **DAMP** (Descriptive and Meaningful Phrases).

*   **Keep context local:** The reader should not have to scroll through 200 lines of setup helpers to understand the input variables of the current test case.
*   **Use factories for boilerplate:** Extract boilerplate setups (like initializing large objects or DOM nodes) into factories, but allow customizing the fields relevant to the test inside the test case itself.

> [!NOTE]
> For an implementation example of a test data factory and its application in DAMP testing, refer to [damp-factory.test.ts](./samples/damp-factory.test.ts).

---

## Quick Testing Quality Checklist

Use this table to review your tests before submitting a pull request:

| Checklist Item | Description | Corrective Action |
| :--- | :--- | :--- |
| **Linear Flow** | Does the test contain `if` statements or `for` loops? | Split into separate, flat test cases. |
| **Isolation** | Does the test share global state that could leak? | Reset state in `beforeEach` or `afterEach`. |
| **Meaningful Names** | Is the name generic (e.g., `test1`, `testProfile`)? | Rename to `should [outcome] when [condition]`. |
| **Behavior Focus** | Does it assert on mock elements or internal properties? | Verify public API calls, DOM changes, or outputs instead. |
| **Magic Values** | Are there unexplained numbers or strings in assertions? | Replace with intention-revealing constants or clear variables. |
