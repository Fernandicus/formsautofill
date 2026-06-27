---
name: migration-architecture-skill
description: Guides the folder structure and versioning strategy for large-scale refactoring and migrations. Use when rewriting major features like a Login flow or data processing pipelines.
---

# Migration Architecture Skill

Detailed instructions for the agent to handle major structural modifications, critical flow refactors, or component migrations without breaking production code.

## When to use

- Trigger this skill when undertaking structural changes that alter more than 40% of an existing feature's internal logic.
- Trigger this skill when making destructive changes to API signatures, state management payloads, or TypeScript contracts.
- Trigger this skill when a complete visual redesign is required while keeping the backend behavior intact (or vice versa).
- Trigger this skill when handling A/B testing setup, gradual migrations, or decoupling old (`v1`) and new (`v2`) code layers safely.
- Trigger this skill when the user explicitly requests rewriting or replacing a critical system flow (e.g., Authentication, Wizard steps, or PDF processing).

## When NOT to use

- Do not use when making minor styling tweaks or simple bug fixes that do not change folder structures or APIs.
- Do not use for general React optimization tasks without structural migration. Refer to [react-best-practices](file:///Users/fernandogonzalezrionda/Desktop/Projects/autofill/formsautofill/.agent/react-best-practices/SKILL.md).
- Do not use for styling or design token updates. Refer to [ui-consistency](file:///Users/fernandogonzalezrionda/Desktop/Projects/autofill/formsautofill/.agent/ui-consistency/SKILL.md) or [tailwind-patterns](file:///Users/fernandogonzalezrionda/Desktop/Projects/autofill/formsautofill/.agent/tailwind-patterns/SKILL.md).
- Do not use for managing business logic detached from migrations. Refer to [typescript-architect](file:///Users/fernandogonzalezrionda/Desktop/Projects/autofill/formsautofill/.agent/typescript-architect/SKILL.md).

## Instructions

### 1. Mandatory Folder Structure
Implement the following internal hierarchy within the feature folder to isolate the migration process:

```text
[feature-name]/
  shared/                  # "Shared Core" (Only 100% identical elements)
    hooks/                 # Hooks shared exactly by v1 and v2
    components/            # Identical sub-components (e.g., base inputs)
    utils/                 # Common helpers
  v1/                      # Current/Old version (STABLE & LEGACY)
    components/            # UI components specific to v1
    hooks/                 # Logic specific to v1
  v2/                      # New version (IN DEVELOPMENT / ACTIVE MIGRATION)
    components/            # New UI and visual structure
    hooks/                 # New logic, new API integrations, etc.
```

### 2. Naming Conventions
- **Never** append version numbers to file names (e.g., `LoginCardV2.tsx` is strictly forbidden).
- Keep file names clean and identical within their versioned folders (e.g., `LoginCard.tsx` inside its respective `v1/` or `v2/` folder).

### 3. Managing the "Shared Core" (`shared/` folder)
- **The Golden Rule:** All code originates in `v1` or `v2`. Move a component or hook to `shared/` **only** if both versions consume it identically.
- Conditional logic based on version inside shared files (e.g., `if (version === 'v2')`) is strictly prohibited.
- If a shared hook requires a tweak for `v2`, duplicate the hook into `v2/hooks/` and decouple it entirely to guarantee zero regressions in `v1`.

### 4. Post-Migration Cleanup
- Once `v2` is 100% validated in production and `v1` receives no traffic, `v1/` can be safely deleted.
- Keep `shared/` and `v2/` files as they are after deleting `v1/` to maintain a clean Git history. Do not perform immediate massive restructurings.

### 5. Import Rules
- **Avoid cross-imports:** Do not import `v1` files into `v2` or vice versa.
- Import exclusively from the current version or from the internal `shared/` core.

---

## Cross-Linking & Relations

For related topics and guidelines:
- For **styling tokens and layout consistency**, refer to [ui-consistency](file:///Users/fernandogonzalezrionda/Desktop/Projects/autofill/formsautofill/.agent/ui-consistency/SKILL.md).
- For **component composition and hook structure**, refer to [react-architecture](file:///Users/fernandogonzalezrionda/Desktop/Projects/autofill/formsautofill/.agent/react-architecture/SKILL.md).
- For **managing global and local application states**, refer to [react-state-management](file:///Users/fernandogonzalezrionda/Desktop/Projects/autofill/formsautofill/.agent/react-state-management/SKILL.md).

---

## Practical Samples

For examples of migration folder structures, correct/incorrect imports, and refactored components adhering to Clean Code standards, refer to the [Migration Examples](file:///Users/fernandogonzalezrionda/Desktop/Projects/autofill/formsautofill/.agent/migration-architecture-skill/samples/migration-examples.md) page.