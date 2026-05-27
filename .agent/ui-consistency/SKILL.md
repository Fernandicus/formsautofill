---
name: ui-consistency
description: Enforce UI consistency by reusing existing React components, adhering to the project's specific component taxonomy (Item/Base/Specific), and following the established design system. Trigger this when building new UI elements or modifying layouts to prevent duplicated components and redundant styles.
risk: low
source: workspace
date_added: "2026-05-27"
---

## When to use

- Creating new UI components or modifying existing user interfaces.
- Styling React elements using the project's styling tools (Tailwind, CSS, etc.).
- Implementing elements that belong to the global design system.

## When NOT to use

- You are modifying pure business logic, API integrations, or state management without UI changes.
- You are solely focused on React rendering performance or global state (refer to `../react-best-practices/SKILL.md` or `../react-state-management/SKILL.md`).

## Instructions

### 1. Component Reusability & Discovery
- **Search First:** Always check the `app/shared/components` directory (or equivalent UI folder) before creating a new component.
- **Reuse and Extend:** If a component already exists, use it. If it almost fits your needs, extend it by adding optional props or variants rather than building a new one from scratch.

### 2. Component Taxonomy
Adhere to the established modular component structure when creating new pieces:
- **Item Components:** Basic atomic elements (e.g., `CardHeader`, `CardBody`, `CardFooter`, `Button`). Should be stored in the `/items  ` folder.
- **Base Components:** Composed of multiple item components (e.g., `Card`, `Tab`, `Menu`). Should be stored in the `/base` folder.
- **Specific Components:** Context-aware components formed by items and/or base components that solve a highly specific domain problem (e.g., `UserCard`, `ProductCard`). Should be stored in the `/components` or in folder of the specific feature.

### 3. Styling Consistency
- **Design Tokens:** Primitive and Semantic token styles should be defined centrally. Before adding new arbitrary styles, check the design system configuration (e.g., `tailwind.config.ts` or global CSS variables) for existing utilities.
- **Update the System:** If a required design token is missing, consider adding it to the global configuration rather than hardcoding arbitrary or magic values in the component.

### 4. Cross-Linking & Relations
For detailed implementation guidelines, refer to the following related SKILLs:
- For **React Component Architecture and Composition**, refer to `../react-architecture/SKILL.md`.
- For **Tailwind Patterns and Design Tokens**, refer to `../tailwind-patterns/SKILL.md`.
- For **Building Scalable Design Systems**, refer to `../tailwind-design-system/SKILL.md`.

## Practical Samples
For concrete examples on how to compose consistent UI components and utilize design tokens, refer to `./samples/ui-consistency-examples.md`. *(Note: Ensure examples of Item, Base, and Specific components are maintained there.)*
