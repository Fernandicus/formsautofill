import { expect, test } from 'vitest';

// ============================================================================
// GOOD TDD Example: Testing Real Behavior
// ============================================================================

// Clear name, tests real behavior, asserts state transitions, minimal mock usage
test('retries failed operations 3 times', async () => {
  let attempts = 0;
  const operation = () => {
    attempts++;
    if (attempts < 3) throw new Error('fail');
    return 'success';
  };

  const result = await retryOperation(operation);

  expect(result).toBe('success');
  expect(attempts).toBe(3);
});

// ============================================================================
// BAD Testing Example (Anti-Pattern): Testing Mock Behavior
// ============================================================================

// Vague name, tests the mock's internal calls instead of actual behavior code
test('retry works', async () => {
  const mock = jest.fn()
    .mockRejectedValueOnce(new Error())
    .mockRejectedValueOnce(new Error())
    .mockResolvedValueOnce('success');
  await retryOperation(mock);
  expect(mock).toHaveBeenCalledTimes(3);
});
