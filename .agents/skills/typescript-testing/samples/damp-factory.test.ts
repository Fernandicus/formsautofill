import { describe, it, expect } from 'vitest';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'ADMIN' | 'USER';
  status: 'ACTIVE' | 'INACTIVE';
}

class AuthManager {
  canAccessAdminPanel(user: User): boolean {
    return user.role === 'ADMIN' && user.status === 'ACTIVE';
  }
}

// ✅ GOOD: A factory function providing sensible defaults.
// This handles boilerplate object construction while keeping the test cases clean.
function makeUser(overrides: Partial<User> = {}): User {
  return {
    id: 'user-123',
    name: 'John Doe',
    email: 'john@example.com',
    role: 'USER',
    status: 'ACTIVE',
    ...overrides
  };
}

describe('AuthManager', () => {
  // ❌ BAD: Over-duplicating complex objects.
  // The test is cluttered with properties (id, name, email) that are irrelevant to authorization.
  it('should grant access to active admin users (cluttered setup)', () => {
    const adminUser: User = {
      id: 'user-999',
      name: 'Super Admin',
      email: 'admin@system.com',
      role: 'ADMIN',
      status: 'ACTIVE'
    };
    const auth = new AuthManager();

    expect(auth.canAccessAdminPanel(adminUser)).toBe(true);
  });

  // ✅ GOOD (DAMP): Setup helper hides boilerplate but highlights critical inputs.
  // The reader instantly sees that "role: ADMIN" is the variable under test.
  it('should grant access to admin panel when user role is ADMIN and status is ACTIVE', () => {
    const adminUser = makeUser({ role: 'ADMIN', status: 'ACTIVE' });
    const auth = new AuthManager();
    
    expect(auth.canAccessAdminPanel(adminUser)).toBe(true);
  });

  it('should deny access if the admin user is INACTIVE', () => {
    const inactiveAdmin = makeUser({ role: 'ADMIN', status: 'INACTIVE' });
    const auth = new AuthManager();

    expect(auth.canAccessAdminPanel(inactiveAdmin)).toBe(false);
  });
});
