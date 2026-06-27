// ============================================================================
// Bug Fix Example: RED (Failing Test)
// ============================================================================

test('rejects empty email', async () => {
  // Test represents the desired behavior before the implementation is updated
  const result = await submitForm({ email: '' });
  expect(result.error).toBe('Email required');
});
