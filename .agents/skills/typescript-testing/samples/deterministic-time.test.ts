import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

class UserSession {
  private createdAt: number;
  private durationMs: number;

  constructor(options: { durationMinutes: number }) {
    this.createdAt = Date.now();
    this.durationMs = options.durationMinutes * 60 * 1000;
  }

  isExpired(): boolean {
    return Date.now() - this.createdAt > this.durationMs;
  }
}

describe('Session', () => {
  beforeEach(() => {
    // 1. Tell Vitest to mock system time and timers
    vi.useFakeTimers();
  });

  afterEach(() => {
    // 2. Always restore real timers in teardown
    vi.useRealTimers();
  });

  it('should expire session after the designated duration', () => {
    // Set a static initial system time (2026-06-28 12:00:00)
    const baseDate = new Date(2026, 5, 28, 12, 0, 0);
    vi.setSystemTime(baseDate);
    
    // Create the session
    const session = new UserSession({ durationMinutes: 30 });

    // Advance Vitest's virtual clock by 31 minutes
    vi.advanceTimersByTime(31 * 60 * 1000);

    // Verify session has expired
    expect(session.isExpired()).toBe(true);
  });
});
