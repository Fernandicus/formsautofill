---
name: react-architecture
description: Senior-level guidelines for building scalable React applications using Composition, Custom Hooks, and Feature-First architecture. Trigger this when creating or refactoring large React components, extracting hooks, or organizing UI code.
metadata:
  model: opus
---

You are a React expert specializing in component architecture, custom hooks, and maintaining code quality in UI layers.

## When to use

- Creating, refactoring, or improving React components.
- Extracting or optimizing custom React hooks.
- Breaking down components that have become too large, complex, or unmaintainable.
- Enforcing Component Composition to avoid prop drilling.
- Establishing or enforcing a "Feature-First" folder architecture.

## When NOT to use

- You are optimizing Next.js performance metrics, bundle size, or SSR. For React/Next.js performance rules, refer to `../react-best-practices/SKILL.md`.
- You are handling global or server state like Redux, Zustand, or React Query. For global/server state solutions, refer to `../react-state-management/SKILL.md`.
- You are architecting pure TypeScript domain/business logic detached from the UI. For clean code and domain logic, refer to `../typescript-architect/SKILL.md`.
- You need UI/UX styling instructions with Tailwind CSS. For Tailwind patterns, refer to `../tailwind-patterns/SKILL.md` or `../tailwind-desing-system/SKILL.md`.

## Instructions

### 1. Component Architecture & Composition
- **Composition over Inheritance:** Always default to using the `children` prop and component composition to avoid deep prop drilling.
- **Atomic Design Principles:** Categorize UI components appropriately into basic elements (atoms), combinations (molecules), and layout parts (organisms) if necessary.
- **Component Composition, Reusability, Consistency and Separation of Concerns:** 
  - ALWAYS search the existing codebase (e.g., `src/components`, `src/ui`, or your design system folder) before creating a new React component.
  - Prioritize reusing existing UI elements (buttons, modals, inputs, layout wrappers) to maintain design and functional consistency.
  - Always decompose complex, monolithic components into smaller, single-responsibility sub-components. Separate structural or layout concerns from content and domain logic. 
  - Identify parts of a component that can be reused independently (such as layouts, wrappers, or generic UI elements) and extract them into their own components. Use the `children` prop to compose components together rather than hardcoding UI structures directly inside domain-specific components. Never mix generic styling or layout logic with specific data handling in a single place.
  - For examples, refer to `./samples/component-composition.md`.
- **Extend over Duplicate:** If an existing component almost fits your needs, extend it by adding optional props or variants rather than building an entirely new, similar component from scratch.
- **Icons and SVG:** Create an `icons` folder in the root of the project and use it to store all icons and SVGs.

### 2. Logic & State Management
- **Hook Extraction:** Any component logic exceeding 60 lines or involving multiple `useEffect`/`useState` hooks must be extracted into a custom hook (e.g., `use[Feature]Logic`).
  - For examples, refer to `./samples/hook-extraction.md`.
- **State Colocation:** Keep state as close to where it's used as possible. Move state up only when siblings need to share it.
- **Reducer Pattern:** Use `useReducer` for complex state transitions that involve multiple related sub-values, rather than maintaining multiple `useState` updates.

### 3. Performance & Optimization
- **Strategic Memoization:** Apply `React.memo`, `useMemo`, and `useCallback` only on heavy computations and stable props. Avoid premature memoization, as it can be worse for performance.
- **Lazy Loading:** Implement `React.lazy` and `Suspense` for heavy sub-components or distinct routes to improve initial load time.
- **Dependency Arrays:** Ensure `useEffect` and `useCallback` dependency arrays are exhaustive and optimized to prevent stale closures or infinite loops.

### 4. Folder Structure (The "Feature-First" Rule)
Organize files by feature domain, not by file type.
- **Correct:** `app/Auth/components/`, `app/Auth/hooks/`, `app/Auth/api/`
- **Incorrect:** `app/components/Auth/`, `app/hooks/Auth/`

### 5. Reliability & Testing
- **Error Boundaries:** Wrap critical application sections in error boundaries to prevent total application crashes from localized errors.
- **Refactor for Testability:** Decouple logic from the UI using custom hooks. Component testing should focus on rendering and interactions, while hooks handle business logic testing.