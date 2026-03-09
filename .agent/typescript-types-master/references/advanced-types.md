# Advanced TypeScript Types Reference

## 1. Branded Types (Nominal Typing)
Prevent mixing up primitives of the same underlying runtime type (e.g., passing a Document ID to a component expecting a User ID).

```typescript
// Define a utility for Branded Types
export type Brand<K, T> = K & { __brand: T };

export type DocumentId = Brand<string, 'DocumentId'>;
export type UserId = Brand<string, 'UserId'>;

// Usage:
function fetchDocument(docId: DocumentId) {
  // Application logic ensures docId is actually a DocumentId
}

// Attempting to pass a normal string or a UserId will result in a compiler error.
const myUserId = "user_123" as UserId;
// fetchDocument(myUserId); // Error: Argument of type 'UserId' is not assignable to parameter of type 'DocumentId'.
```

## 2. Deriving Types from Constants (Source of Truth)
Never duplicate types if they can be derived from existing data structures. Use `as const`.

```typescript
// The runtime configuration array
export const HTTP_METHODS = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'] as const;

// The strict type derived directly from the array
export type HttpMethod = typeof HTTP_METHODS[number]; // 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'
```

## 3. Advanced Conditional and Mapped Types
Transform object types powerfully and recursively.

```typescript
// Make all nested properties readonly
export type DeepReadonly<T> = T extends Function
  ? T
  : T extends object
  ? { readonly [K in keyof T]: DeepReadonly<T[K]> }
  : T;

// Utility to extract only properties of a specific type (e.g., all string properties)
export type StringsOnly<T> = {
  [K in keyof T as T[K] extends string ? K : never]: T[K]
};

interface User {
  id: number;
  name: string;
  email: string;
  isActive: boolean;
}

type UserStrings = StringsOnly<User>; 
// Result: { name: string; email: string; }
```

## 4. Type Predicates (Safely narrowing `unknown`)
Whenever dealing with external data, use `unknown` and a type predicate instead of `any`.

```typescript
// Given a strict type
export interface ApiError {
  status: number;
  message: string;
}

// 1. The Type Predicate
export function isApiError(error: unknown): error is ApiError {
  return (
    typeof error === 'object' &&
    error !== null &&
    'status' in error &&
    typeof (error as Record<string, unknown>).status === 'number' &&
    'message' in error &&
    typeof (error as Record<string, unknown>).message === 'string'
  );
}

// 2. Usage
try {
  await fetchSomething();
} catch (error: unknown) { // Prefer 'unknown' catch clause variables (TS 4.4+)
  if (isApiError(error)) {
    console.log(`Failed with status ${error.status}: ${error.message}`); // Safely narrowed!
  } else {
    // Handle truly unknown error
  }
}
```
