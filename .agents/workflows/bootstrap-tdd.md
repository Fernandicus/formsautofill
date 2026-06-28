---
description: Set up testing infrastructure and safely adopt TDD in a codebase with zero existing tests
---

## Questions to the User

- **What do you want to test?** (e.g., a feature, a function, or the infrastructure)
  - **If the user wants to test a feature:**
    1. Ask for or look for the feature documentation in the `/docs` folder.
    2. Identify the most critical or sensitive parts of the feature, and partition them following Hexagonal Architecture principles (Domain, Application, Infrastructure).
    3. Build corresponding tests for these components.

## Guardrails
- **No changes to production code** until the test runner is configured and verified.
- **Never refactor untested code**. Write characterization tests first to protect existing behavior.
- **Establish a dummy test first** to separate runner configuration issues from actual test failures.

---

## Steps

### Step 1: Understand Scope & Ask Clarifying Questions
a) Before writing any code or tests, define what needs to be tested:
- **Which features, files or functions should be tested?** Identify the target implementation modules.
- **What is the expected behavior, edge cases, and error paths?** Define the happy path and any possible failure scenarios.
b) In case the test is for a full feature, check the `/docs` folder to read the documentation (if it exists) and understand how it works.


### Step 2: Review Relevant Skills
Ensure you understand the codebase guidelines and best practices for writing clean code and tests, and check any relevant skills.

### Step 3: Establish the Test Infrastructure
If needed, before writing any actual test, make sure the test runner is fully functional.
1. **Check Dependencies**: Ensure a test runner suitable for the project's language/framework is installed.
2. **Configure**: Create configuration files matching the build and runtime setup if needed.
3. **Smoke Test**: Write a temporary dummy test file (`smoke.test.ts` or language equivalent) to verify execution:
   ```typescript
   // Example (TypeScript/Vitest):
   import { test, expect } from 'vitest';
   test('smoke test', () => {
     expect(true).toBe(true);
   });
   ```
4. **Execute**: Run the test runner command to ensure the runner starts, executes the smoke test, and outputs a passing result.
5. **Clean up**: Delete the temporary smoke test file once verified.

### Step 4: Establish a Safety Net (Characterization Testing)
If you need to edit or refactor *existing* untested code, you must first document its current behavior to prevent regressions.
1. **Identify Boundaries**: Find the inputs and outputs of the module/function you want to modify.
2. **Write Characterization Tests**: Write tests that assert the *current actual behavior*, even if it seems incorrect or buggy. 
   - *Example*: If a function returns `null` for a bad input instead of throwing, write a test asserting it returns `null`.
3. **Verify Green**: Run these tests to make sure they pass. This is your safety net. Practical Example:
Suppose we have a complex legacy function calculateDiscount(user, total).

```typescript
// 1. Write a test assuming a false result on purpose
test('characterization of calculateDiscount for VIP user', () => {
  const result = calculateDiscount('VIP', 100);
  expect(result).toBe('DUMMY_VALUE'); // We know this will fail
});

// 2. Execute. The console outputs:
// Expected: "DUMMY_VALUE"
// Received: 85.5

// 3. Fix the test based on reality, not theory.
test('characterization of calculateDiscount for VIP user', () => {
  const result = calculateDiscount('VIP', 100);
  expect(result).toBe(85.5); // The test now passes and protects this behavior
});
```

### Step 5: Transition to TDD
Now that you have a functioning runner and a safety net, you can safely write code using the standard TDD cycle.

#### A. For Bug Fixes:
1. **Write the Bug Test**: Write a test demonstrating the bug (e.g., asserting it throws an error or returns the correct value). Run it and watch it fail (**RED**).
2. **Fix the Bug**: Write the minimal code to make the test pass (**GREEN**).
3. **Verify Safety Net**: Run the characterization tests from Step 4 to ensure no existing functionality was broken.
4. **Refactor**: Clean up the implementation while keeping all tests green.

#### B. For New Features:
1. **Write Feature Test**: Write a test defining the first small sub-feature (**RED**).
2. **Implement**: Write minimal production code to pass (**GREEN**).
3. **Refactor**: Clean up duplication and naming.
4. **Repeat**: Move to the next behavior.

---

## Principles
- **A test runner that doesn't run is worse than no tests.** Always verify the runner works in isolation first.
- **Golden Rule of Legacy Code**: Do not change code to make it testable until you have some test (even a high-level integration test) verifying it doesn't break.
- **Make changes easy, then make the easy change.**