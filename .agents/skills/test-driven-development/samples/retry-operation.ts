// ============================================================================
// GOOD TDD Example: Minimal Implementation to Pass Test
// ============================================================================

// Simplest code that passes the test without over-engineering or premature optimization
async function retryOperation<T>(fn: () => Promise<T>): Promise<T> {
  for (let i = 0; i < 3; i++) {
    try {
      return await fn();
    } catch (e) {
      if (i === 2) throw e;
    }
  }
  throw new Error('unreachable');
}

// ============================================================================
// BAD Testing Example (Anti-Pattern): Over-Engineered Implementation (YAGNI)
// ============================================================================

// Writing complex functionality before it has a failing test
async function retryOperationBad<T>(
  fn: () => Promise<T>,
  options?: {
    maxRetries?: number;
    backoff?: 'linear' | 'exponential';
    onRetry?: (attempt: number) => void;
  }
): Promise<T> {
  // Over-engineered features not requested by any failing test. Avoid!
  throw new Error('YAGNI');
}
