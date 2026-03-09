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

### 2. Use parameter objects instead of positional arguments

When building functions with multiple arguments, use parameter objects to improve readability and maintainability.

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

### 3. Always asing a return type to exported functions

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

### 4. Handler Extraction (Single Responsibility)
Never mix control flow with business logic. Extract complex conditional logic inside an if statement into isolated pure functions or handlers.

### 5. Early Returns
Inside handlers, use early returns (return true, return false, or the final value) to completely eliminate else if and else blocks.

### 6. State Centralization
Repeating state mutations (such as count++, array.push()) across multiple conditional branches is strictly prohibited. The handler must return a result, and the state should be updated in a single, centralized location at the end of the block.

### 7. Immutability by Default
Prioritize the use of const and direct value returns over declaring variables with let to mutate them later inside try/catch or if/else blocks.

### 8 Avoid Deep Nesting
Never generate code in this format:

```typescript
// Bad
let count = 0;
if (type === 'A') {
  doA();
  count++;
} else if (type === 'B') {
  if (condition) {
    doB();
    count++;
  }
}

// Good
const handleA = (): boolean => {
  doA();
  return true;
};

const handleB = (cond: boolean): boolean => {
  if (!cond) return false; // Early return
  doB();
  return true;
};

let handled = false;

// Clean controll flow
if (type === 'A') handled = handleA();
else if (type === 'B') handled = handleB(condition);

if (handled) count++;
```

### 8. Narrow Error Handling (Minimum Try/Catch Scope)
Do not wrap entire functions or predictable business logic (such as variable assignments or React state updates) inside `try/catch` blocks. Error handling must be tightly scoped. Only use `try/catch` for unpredictable external operations (e.g., I/O, network requests, `localStorage`, or `JSON.parse`). 

Never wrap safe, predictable logic inside a try block along with the risky operation (Broad Try/Catch).
Separate the safe logic from the unpredictable side effects. Only wrap the exact line that can fail (Narrow Try/Catch):

```typescript
//Bad
const setValue = (value: string) => {
  try {
    const parsed = value.trim();
    setInternalState(parsed); // Predictable state update (Should not be here)
    window.localStorage.setItem('key', parsed); // Unpredictable I/O
  } catch (error) {
    console.error(error);
  }

//Good
const setValue = (value: string) => {
  // 1. Safe, predictable logic (Outside try/catch)
  const parsed = value.trim();
  setInternalState(parsed); 

  // 2. Unpredictable external operation (Inside try/catch)
  try {
    window.localStorage.setItem('key', parsed);
  } catch (error) {
    console.warn('Failed to save to localStorage:', error);
  }
};