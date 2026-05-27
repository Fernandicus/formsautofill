# UI Consistency Examples

This document provides concrete examples of how to follow the `ui-consistency` skill guidelines when building or modifying UI components in this project.

## 1. Using Predefined Tailwind Theme Variables

Always use the semantic color tokens defined in `tailwind.config.ts` instead of raw hexadecimal or generic color names. This ensures the app responds correctly to theming and maintains a unified look.

### ❌ Inconsistent (Do Not Use)
```tsx
// Hardcoding hex colors or unconfigured utility colors
<button className="bg-[#4f46e5] text-white hover:bg-[#4338ca] border-[#e2e8f0]">
  Submit
</button>

<span className="text-red-500">Error occurred</span>
```

### ✅ Consistent (Use Theme Tokens)
```tsx
// Using semantic tokens configured in tailwind.config.ts
<button className="bg-primary text-white hover:bg-primary-hover border-border">
  Submit
</button>

<span className="text-danger">Error occurred</span>
```

## 2. Reusing Existing Components

Before creating a new UI element, check `app/shared/components`. If a component exists that solves your problem, use it.

### ❌ Inconsistent (Reinventing the wheel)
```tsx
// Creating a new button from scratch when a Button component already exists
export function ActionPanel() {
  return (
    <div>
      <button className="px-4 py-2 bg-primary text-white rounded-md">
        Save Changes
      </button>
    </div>
  );
}
```

### ✅ Consistent (Using existing components)
```tsx
import { Button } from '@/app/shared/items/Button';

export function ActionPanel() {
  return (
    <div>
      <Button variant="primary">
        Save Changes
      </Button>
    </div>
  );
}
```

## 3. Modular Component Construction

When creating complex structures, break them down into smaller, reusable "item components" (e.g., `CardHeader`, stored in `/items`) to form "base components" (e.g., `Card`, stored in `/base`), which can then be assembled into "specific components" (e.g., `UserCard`, stored in `/components` or feature folders).

### ❌ Inconsistent (Monolithic Component)
```tsx
// Putting all layout and styling into one massive component
export function UserCard({ user }) {
  return (
    <div className="border border-border rounded-lg shadow-sm bg-background p-4">
      <div className="border-b border-border pb-2 mb-2 font-bold text-lg text-foreground">
        User Profile
      </div>
      <div className="text-muted-foreground text-sm">
        <p>Name: {user.name}</p>
        <p>Email: {user.email}</p>
      </div>
      <div className="mt-4 pt-2 border-t border-border flex justify-end">
        <button className="bg-primary text-white px-3 py-1 rounded">Edit</button>
      </div>
    </div>
  );
}
```

### ✅ Consistent (Modular Components)
```tsx
// 1. Item Components (Stored in /items)
export function CardHeader({ title }) {
  return <div className="border-b border-border p-4 font-bold text-lg text-foreground">{title}</div>;
}

export function CardBody({ children }) {
  return <div className="p-4 text-muted-foreground text-sm">{children}</div>;
}

export function CardFooter({ children }) {
  return <div className="border-t border-border p-4 flex justify-end">{children}</div>;
}

// 2. Base Component (Stored in /base)
export function Card({ children }) {
  return <div className="border border-border rounded-lg shadow-sm bg-background">{children}</div>;
}

// 3. Specific Component (Stored in /components or feature folder)
import { Button } from '@/app/shared/items/Button';

export function UserCard({ user }) {
  return (
    <Card>
      <CardHeader title="User Profile" />
      <CardBody>
        <p>Name: {user.name}</p>
        <p>Email: {user.email}</p>
      </CardBody>
      <CardFooter>
        <Button variant="primary">Edit</Button>
      </CardFooter>
    </Card>
  );
}
```

## 4. Keeping the Tailwind Config Clean

Before adding a new style or token to `tailwind.config.ts`, verify if an existing one can be used.

### ❌ Inconsistent (Adding unnecessary tokens)
```ts
// tailwind.config.ts
colors: {
  // Adding a new color for just one specific button state
  deleteButtonHover: "#b91c1c"
}
```

### ✅ Consistent (Reusing danger palette)
```ts
// Using the existing danger.hover palette instead of creating a bespoke color
<Button className="bg-danger hover:bg-danger-hover">Delete</Button>
```
