# TypeScript Implementation Playbook

This file contains detailed patterns, checklists, and code samples referenced by the skill.

## Core Concepts

### 1. Types over Interfaces 

```typescript
// Bad
interface User {
  name: string;
  age: number;
}

// Good
type User = {
  name: string;
  age: number;
}
```

2. When building functions with multiple arguments, use parameter objects instead of positional arguments to improve readability and maintainability.

If there are 3 or more parameters create a `type` for the parameters (Optional)

```typescript
// Bad
function getUser(name: string, age: number) {
  return name;
}

// Good
function getUser(user: {name: string, age: number}) {
  return user.name;
}

// Good with type
type User = {
  name: string;
  age: number;
  email: string;
  phone: string;
}

function getUser(user: User) {
  return user.name;
}
```

3. When exporting functions, always asing a return type.

```typescript
// Bad
export function getUser(user: {name: string, age: number}) {
  return user.name;
}

// Good
export function getUser(user: {name: string, age: number}): string {
  return user.name;
}
```