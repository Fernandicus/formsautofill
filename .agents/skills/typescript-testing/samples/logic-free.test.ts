import { describe, it, expect } from 'vitest';

class StatusTracker {
  constructor(private status: string) {}

  isFinal(): boolean {
    return ['COMPLETED', 'CANCELLED', 'FAILED'].includes(this.status);
  }
}

describe('StatusTracker', () => {
  // ❌ BAD: Logic inside the test case. 
  // It uses loops and conditions. If one iteration fails, it's hard to tell which one and why.
  // The test itself is complex and prone to bugs.
  it('should process all active statuses (with loops and logic)', () => {
    const statuses = ['PENDING', 'APPROVED', 'COMPLETED'];
    
    for (const status of statuses) {
      const tracker = new StatusTracker(status);
      if (status === 'COMPLETED') {
        expect(tracker.isFinal()).toBe(true);
      } else {
        expect(tracker.isFinal()).toBe(false);
      }
    }
  });

  // ✅ GOOD: Separate, linear, logic-free test cases.
  // Each test has a single responsibility, no conditionals, and asserts a specific behavior.
  it('should mark COMPLETED as a final status', () => {
    const tracker = new StatusTracker('COMPLETED');
    expect(tracker.isFinal()).toBe(true);
  });

  it('should mark PENDING as non-final status', () => {
    const tracker = new StatusTracker('PENDING');
    expect(tracker.isFinal()).toBe(false);
  });

  it('should mark APPROVED as non-final status', () => {
    const tracker = new StatusTracker('APPROVED');
    expect(tracker.isFinal()).toBe(false);
  });
});
